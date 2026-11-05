"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast, Toaster } from "sonner";
import { authClient, isDemo } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Book, BookInput, Borrow, User } from "@/lib/types";
import { demoUser, seedBooks } from "@/lib/seed";
type Account = User & { salt: string; hash: string };
type Store = {
  books: Book[];
  borrows: Borrow[];
  accounts: Account[];
  user: User | null;
};
type Context = {
  arrivals: Book[];
  user: User | null;
  books: Book[];
  borrows: Borrow[];
  ready: boolean;
  error: string;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    image: string,
  ) => Promise<void>;
  demoLogin: () => void;
  logout: () => Promise<void>;
  google: (returnTo: string) => Promise<void>;
  saveBook: (input: BookInput, id?: string) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  borrowBook: (id: string) => Promise<void>;
  returnBook: (id: string) => Promise<void>;
};
const Ctx = createContext<Context | null>(null);
const key = "booknook-demo-v1";
const initial: Store = {
  books: isDemo ? seedBooks : [],
  borrows: [],
  accounts: [],
  user: null,
};
async function digest(password: string, salt: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(salt + password),
  );
  return Array.from(new Uint8Array(bytes), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}
export function Provider({ children }: { children: ReactNode }) {
  const [arrivals, setArrivals] = useState<Book[]>([]);
  const [store, setStore] = useState<Store>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  function commit(next: Store) {
    if (isDemo) localStorage.setItem(key, JSON.stringify(next));
    setStore(next);
  }
  async function refresh(strict = false) {
    setError("");
    try {
      const [session, books, latest] = await Promise.all([
        authClient.getSession(),
        api.books(),
        api.arrivals(),
      ]);
      if (session.error)
        throw new Error(session.error.message || "Session unavailable.");
      const user = session.data?.user || null;
      const borrows = user ? await api.borrows() : [];
      setStore({ books, borrows, user, accounts: [] });
      setArrivals(latest);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load the library.");
      if (strict) throw e;
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    if (isDemo) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const value = JSON.parse(raw);
          if (
            Array.isArray(value.books) &&
            Array.isArray(value.borrows) &&
            Array.isArray(value.accounts)
          )
            setStore(value);
        }
      } catch {
        toast.error(
          "Saved demo data could not be read. A fresh library has been loaded.",
        );
      }
      setReady(true);
    } else {
      void refresh();
    }
  }, []); // Initial hydration precedes private-route checks.
  async function login(email: string, password: string) {
    if (isDemo) {
      const account = store.accounts.find(
        (a) => a.email === email.toLowerCase(),
      );
      if (email.toLowerCase() === demoUser.email && password === "Reader123") {
        commit({ ...store, user: demoUser });
        return;
      }
      if (!account || (await digest(password, account.salt)) !== account.hash)
        throw new Error("Email or password is incorrect.");
      const { salt, hash, ...user } = account;
      void salt;
      void hash;
      commit({ ...store, user });
    } else {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message);
      await refresh(true);
    }
  }
  async function register(
    name: string,
    email: string,
    password: string,
    image: string,
  ) {
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      password.length < 6
    )
      throw new Error(
        "Use at least 6 characters, one uppercase and one lowercase letter.",
      );
    if (isDemo) {
      if (
        store.accounts.some((a) => a.email === email.toLowerCase()) ||
        email.toLowerCase() === demoUser.email
      )
        throw new Error("An account with this email already exists.");
      const salt = crypto.randomUUID();
      const account = {
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        image,
        salt,
        hash: await digest(password, salt),
      };
      commit({ ...store, accounts: [...store.accounts, account] });
    } else {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        image: image || undefined,
      });
      if (result.error) throw new Error(result.error.message);
      await authClient.signOut();
    }
  }
  async function logout() {
    try {
      if (isDemo) commit({ ...store, user: null });
      else {
        const result = await authClient.signOut();
        if (result.error) throw new Error(result.error.message);
        setStore((current) => ({ ...current, user: null, borrows: [] }));
      }
      toast.success("You have been signed out.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    }
  }
  async function google(returnTo: string) {
    if (isDemo)
      throw new Error(
        "Google sign-in needs the BetterAuth server. Use the demo account or register locally.",
      );
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin + returnTo,
    });
    if (result.error) throw new Error(result.error.message);
  }
  function requireUser() {
    if (!store.user) throw new Error("Please sign in to continue.");
    return store.user;
  }
  async function saveBook(input: BookInput, id?: string) {
    const user = requireUser();
    if (!Number.isInteger(input.totalCopies) || input.totalCopies < 1)
      throw new Error("Total copies must be a positive whole number.");
    if (isDemo) {
      const old = store.books.find((b) => b.id === id);
      if (id && (!old || old.ownerId !== user.id))
        throw new Error("You can only edit your own books.");
      const borrowed = old ? old.totalCopies - old.availableCopies : 0;
      if (input.totalCopies < borrowed)
        throw new Error(`At least ${borrowed} copies are currently borrowed.`);
      const book: Book = {
        ...input,
        id: id || crypto.randomUUID(),
        ownerId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
        createdAt: old?.createdAt || new Date().toISOString(),
        availableCopies: input.totalCopies - borrowed,
      };
      commit({
        ...store,
        books: id
          ? store.books.map((b) => (b.id === id ? book : b))
          : [book, ...store.books],
      });
    } else {
      if (id) await api.edit(id, input);
      else await api.add(input);
      await refresh(true);
    }
    toast.success(id ? "Book updated." : "Your book is on the shelf!");
  }
  async function deleteBook(id: string) {
    const user = requireUser();
    if (isDemo) {
      const book = store.books.find((b) => b.id === id);
      if (!book || book.ownerId !== user.id)
        throw new Error("You can only delete your own books.");
      if (store.borrows.some((b) => b.bookId === id))
        throw new Error(
          "Return all borrowed copies before deleting this book.",
        );
      commit({ ...store, books: store.books.filter((b) => b.id !== id) });
    } else {
      await api.remove(id);
      await refresh(true);
    }
    toast.success("Book removed from your shelf.");
  }
  async function borrowBook(id: string) {
    const user = requireUser();
    if (isDemo) {
      if (store.borrows.some((b) => b.bookId === id && b.userId === user.id))
        throw new Error("You already have a copy of this book.");
      const book = store.books.find((b) => b.id === id);
      if (!book || book.availableCopies < 1)
        throw new Error("This book is not available.");
      const date = new Date();
      const due = new Date(date);
      due.setDate(due.getDate() + 14);
      const borrow: Borrow = {
        id: crypto.randomUUID(),
        bookId: id,
        bookTitle: book.title,
        bookImage: book.image,
        userId: user.id,
        userEmail: user.email,
        borrowDate: date.toISOString(),
        returnDate: due.toISOString(),
      };
      commit({
        ...store,
        books: store.books.map((b) =>
          b.id === id ? { ...b, availableCopies: b.availableCopies - 1 } : b,
        ),
        borrows: [...store.borrows, borrow],
      });
    } else {
      await api.borrow(id);
      await refresh(true);
    }
    toast.success("Happy reading! Your book is borrowed for 14 days.");
  }
  async function returnBook(id: string) {
    const user = requireUser();
    if (isDemo) {
      const borrow = store.borrows.find(
        (b) => b.id === id && b.userId === user.id,
      );
      if (!borrow) throw new Error("Borrow record not found.");
      commit({
        ...store,
        borrows: store.borrows.filter((b) => b.id !== id),
        books: store.books.map((b) =>
          b.id === borrow.bookId
            ? {
                ...b,
                availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
              }
            : b,
        ),
      });
    } else {
      await api.returnBook(id);
      await refresh(true);
    }
    toast.success("Book returned. Thank you for sharing the story.");
  }
  return (
    <Ctx.Provider
      value={{
        ...store,
        arrivals,
        ready,
        error,
        refresh,
        login,
        register,
        demoLogin: () => commit({ ...store, user: demoUser }),
        logout,
        google,
        saveBook,
        deleteBook,
        borrowBook,
        returnBook,
      }}
    >
      {children}
      <Toaster richColors position="top-right" closeButton />
    </Ctx.Provider>
  );
}
export function useLibrary() {
  const value = useContext(Ctx);
  if (!value) throw new Error("Library provider is required.");
  return value;
}
