"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  BookOpen,
  Check,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Book } from "@/lib/types";
import { isDemo } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { useLibrary } from "./provider";
import { Cover, Empty, Guard, Modal, Spinner } from "./ui";
import { BookForm } from "./book-form";
const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
function Details({ id }: { id: string }) {
  const { books, user, borrows, borrowBook } = useLibrary();
  const [remote, setRemote] = useState<Book | null>(null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const book = isDemo ? books.find((b) => b.id === id) : remote;
  useEffect(() => {
    if (!isDemo) {
      api
        .book(id)
        .then(setRemote)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id]);
  useEffect(() => {
    if (book) document.title = `BookNook | ${book.title}`;
  }, [book]);
  async function borrow() {
    setBusy(true);
    try {
      await borrowBook(id);
      if (remote)
        setRemote({ ...remote, availableCopies: remote.availableCopies - 1 });
      setModal(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Borrow could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Spinner />;
  if (!book)
    return (
      <Empty
        title={
          error ? "Unable to load this book" : "This book has left the shelf"
        }
        text={error || "Explore the library to find another great read."}
      >
        <Link className="btn btn-primary" href="/books">
          Back to All Books
        </Link>
      </Empty>
    );
  const borrowed = borrows.some(
    (b) => b.bookId === id && b.userId === user?.id,
  );
  return (
    <section className="site-width page-space">
      <Link href="/books" className="back-link">
        <ArrowLeft size={16} /> Back to the library
      </Link>
      <div className="book-detail">
        <div className="detail-cover">
          <Cover src={book.image} title={book.title} />
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{book.category} · A COMMUNITY PICK</span>
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          <div className="availability">
            <span
              className={`badge ${book.availableCopies ? "badge-success" : "badge-warning"}`}
            >
              {book.availableCopies
                ? `${book.availableCopies} of ${book.totalCopies} copies available`
                : "Not Available"}
            </span>
            {borrowed && (
              <span className="badge badge-outline">On your reading shelf</span>
            )}
          </div>
          <h3>Between the covers</h3>
          <p className="description">{book.description}</p>
          <div className="shared-by">
            <span className="avatar-letter">{book.ownerName.slice(0, 1)}</span>
            <div>
              <small>Shared by</small>
              <strong>{book.ownerName}</strong>
              <small>Added {date(book.createdAt)}</small>
            </div>
          </div>
          <div className="borrow-note">
            <CalendarDays size={18} /> A little time to escape. Borrow for 14
            days.
          </div>
          <button
            className="btn btn-primary borrow-button"
            disabled={!book.availableCopies}
            onClick={() => {
              if (borrowed) {
                toast.error("You already have a copy of this book.");
                return;
              }
              setModal(true);
            }}
          >
            <BookOpen size={18} />
            {!book.availableCopies
              ? "Not Available"
              : borrowed
                ? "Already Borrowed"
                : "Borrow This Book"}
          </button>
          {borrowed && (
            <Link href="/my-borrows" className="text-link">
              Go to My Borrows <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
      {modal && (
        <Modal
          title="Your next chapter is waiting."
          onClose={() => !busy && setModal(false)}
        >
          <p>
            You’re borrowing <strong>{book.title}</strong>. Return it in 14 days
            so the next reader can enjoy it too.
          </p>
          <div className="form-stack modal-form">
            <label>
              Your Name
              <input className="input" readOnly value={user?.name} />
            </label>
            <label>
              Your Email
              <input className="input" readOnly value={user?.email} />
            </label>
            <div className="borrow-summary">
              <span>Return by</span>
              <strong>
                {date(new Date(Date.now() + 14 * 86400000).toISOString())}
              </strong>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => void borrow()}
              disabled={busy}
            >
              {busy ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Check size={17} />
              )}
              Confirm Borrow
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
export function BookDetails({ id }: { id: string }) {
  return (
    <Guard>
      <Details id={id} />
    </Guard>
  );
}
function OwnBooks() {
  const { books, user, deleteBook } = useLibrary();
  const [edit, setEdit] = useState<Book | null>(null);
  const [remove, setRemove] = useState<Book | null>(null);
  const [busy, setBusy] = useState(false);
  const mine = books
    .filter((b) => b.ownerId === user?.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  async function confirm() {
    if (!remove) return;
    setBusy(true);
    try {
      await deleteBook(remove.id);
      setRemove(null);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not delete the book.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="site-width page-space">
      <div className="section-heading">
        <div className="page-intro">
          <span className="eyebrow">A LITTLE OF YOU ON THE SHELF</span>
          <h1>
            My Books<span className="heading-dot">.</span>
          </h1>
          <p>The stories you’ve shared with the community.</p>
        </div>
        <Link href="/add-book" className="btn btn-primary">
          <Plus size={17} />
          Add Book
        </Link>
      </div>
      <div className="shelf-stats">
        <div>
          <strong>{mine.length}</strong>
          <span>books shared</span>
        </div>
        <div>
          <strong>{mine.reduce((sum, b) => sum + b.availableCopies, 0)}</strong>
          <span>copies ready to read</span>
        </div>
        <div>
          <strong>
            {mine.reduce(
              (sum, b) => sum + b.totalCopies - b.availableCopies,
              0,
            )}
          </strong>
          <span>copies out on adventures</span>
        </div>
      </div>
      {mine.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Category</th>
                <th>Available / Total</th>
                <th>Date Added</th>
                <th>Make a change</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/books/${b.id}`} className="table-book">
                      <Cover src={b.image} title={b.title} />
                      <span>
                        <strong>{b.title}</strong>
                        <small>{b.author}</small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-ghost">{b.category}</span>
                  </td>
                  <td>
                    {b.availableCopies} / {b.totalCopies}
                  </td>
                  <td>{date(b.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setEdit(b)}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-ghost delete"
                        onClick={() => setRemove(b)}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="Your shelf has room for a story"
          text="Share your first book and help someone discover their next favorite."
        >
          <Link href="/add-book" className="btn btn-primary">
            Add Your First Book
          </Link>
        </Empty>
      )}
      {edit && (
        <Modal title="A little shelf editing." onClose={() => setEdit(null)}>
          <BookForm book={edit} onSaved={() => setEdit(null)} />
        </Modal>
      )}
      {remove && (
        <Modal
          title="Remove this book?"
          onClose={() => !busy && setRemove(null)}
        >
          <p>
            <strong>{remove.title}</strong> will be removed from your community
            shelf. This action can’t be undone.
          </p>
          <div className="form-actions">
            <button
              className="btn btn-ghost"
              onClick={() => setRemove(null)}
              disabled={busy}
            >
              Keep Book
            </button>
            <button
              className="btn btn-error"
              onClick={() => void confirm()}
              disabled={busy}
            >
              {busy ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Delete Book"
              )}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
export function MyBooks() {
  return (
    <Guard>
      <OwnBooks />
    </Guard>
  );
}
function BorrowList() {
  const { borrows, user, returnBook } = useLibrary();
  const [pending, setPending] = useState<string | null>(null);
  const mine = borrows.filter((b) => b.userId === user?.id);
  async function giveBack(id: string) {
    setPending(id);
    try {
      await returnBook(id);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Unable to return the book.",
      );
    } finally {
      setPending(null);
    }
  }
  return (
    <section className="site-width page-space">
      <div className="page-intro">
        <span className="eyebrow">STORIES YOU’RE SPENDING TIME WITH</span>
        <h1>
          My Borrows<span className="heading-dot">.</span>
        </h1>
        <p>A few borrowed worlds. A little reminder to pass them on.</p>
      </div>
      {mine.length ? (
        <>
          <div className="reading-note">
            <BookOpen size={22} />
            <span>
              <strong>
                {mine.length} {mine.length === 1 ? "story" : "stories"} on your
                reading shelf.
              </strong>{" "}
              Return each book within 14 days to keep the stories moving.
            </span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Next chapter</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/books/${b.bookId}`} className="table-book">
                        <Cover src={b.bookImage} title={b.bookTitle} />
                        <strong>{b.bookTitle}</strong>
                      </Link>
                    </td>
                    <td>{date(b.borrowDate)}</td>
                    <td>{date(b.returnDate)}</td>
                    <td>
                      <span
                        className={`badge ${Date.parse(b.returnDate) < Date.now() ? "badge-warning" : "badge-ghost"}`}
                      >
                        {Date.parse(b.returnDate) < Date.now()
                          ? "Overdue"
                          : "Enjoying the story"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        disabled={!!pending}
                        onClick={() => void giveBack(b.id)}
                      >
                        {pending === b.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "Return Book"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty
          title="Your next adventure is waiting"
          text="You haven’t borrowed any books yet. Find a story that feels like you."
        >
          <Link href="/books" className="btn btn-primary">
            Browse Books <ArrowUpRight size={16} />
          </Link>
        </Empty>
      )}
    </section>
  );
}
export function MyBorrows() {
  return (
    <Guard>
      <BorrowList />
    </Guard>
  );
}
function ProfileContent() {
  const { user, books, borrows } = useLibrary();
  return (
    <section className="site-width page-space">
      <span className="eyebrow">THE READER BEHIND THE STORIES</span>
      <h1>
        My Profile<span className="heading-dot">.</span>
      </h1>
      <div className="profile-card card">
        <div className="profile-avatar">
          {user?.image ? (
            <Cover src={user.image} title={user.name} />
          ) : (
            user?.name.slice(0, 1)
          )}
        </div>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        <span className="badge badge-ghost">Community reader</span>
        <div className="shelf-stats">
          <div>
            <strong>
              {books.filter((b) => b.ownerId === user?.id).length}
            </strong>
            <span>books shared</span>
          </div>
          <div>
            <strong>
              {borrows.filter((b) => b.userId === user?.id).length}
            </strong>
            <span>current reads</span>
          </div>
        </div>
        <Link href="/books" className="btn btn-primary">
          Find Your Next Read <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
export function Profile() {
  return (
    <Guard>
      <ProfileContent />
    </Guard>
  );
}
