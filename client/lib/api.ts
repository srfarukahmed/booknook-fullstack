import { authClient } from "./auth-client";
import { Book, BookInput, Borrow } from "./types";
// No tokens or database credentials are persisted by this client.
async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  protectedRoute = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (protectedRoute) {
    const token = await authClient.token();
    if (token.error || !token.data?.token)
      throw new Error("Please sign in again.");
    headers.Authorization = `Bearer ${token.data.token}`;
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${path}`,
    {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(data?.message || "The request could not be completed.");
  return data as T;
}
export const api = {
  arrivals: () =>
    request<Book[]>("/books?sort=newest&limit=6", "GET", undefined, false),
  books: () => request<Book[]>("/books", "GET", undefined, false),
  book: (id: string) => request<Book>(`/books/${encodeURIComponent(id)}`),
  add: (data: BookInput) => request<Book>("/books", "POST", data),
  edit: (id: string, data: BookInput) =>
    request<Book>(`/books/${encodeURIComponent(id)}`, "PATCH", data),
  remove: (id: string) =>
    request<void>(`/books/${encodeURIComponent(id)}`, "DELETE"),
  borrows: () => request<Borrow[]>("/borrows"),
  borrow: (bookId: string) => request<Borrow>("/borrows", "POST", { bookId }),
  returnBook: (id: string) =>
    request<void>(`/borrows/${encodeURIComponent(id)}`, "DELETE"),
};
