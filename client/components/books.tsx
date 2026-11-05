"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { Book, categories } from "@/lib/types";
import { useLibrary } from "./provider";
import { Cover, Empty, Spinner } from "./ui";
export function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card card">
      <Link href={`/books/${book.id}`} className="cover-well">
        <Cover src={book.image} title={book.title} />
        <span className="cover-link" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="book-info">
        <div className="book-meta">
          <span>{book.category}</span>
          <span className={book.availableCopies ? "available" : "unavailable"}>
            {book.availableCopies ? "Available" : "On loan"}
          </span>
        </div>
        <h3>
          <Link href={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p>by {book.author}</p>
        <Link className="detail-link" href={`/books/${book.id}`}>
          View Details <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
export function BooksPage() {
  const { books, ready, error, refresh } = useLibrary();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  if (!ready) return <Spinner />;
  const filtered = books
    .filter(
      (b) =>
        (category === "All" || b.category === category) &&
        `${b.title} ${b.author}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  return (
    <section className="site-width page-space">
      <div className="page-intro">
        <span className="eyebrow">THE COMMUNITY SHELF</span>
        <h1>
          So many stories.
          <br />
          <em>One next chapter.</em>
        </h1>
        <p>Find a familiar favorite or a world you haven’t visited yet.</p>
      </div>
      <div className="filter-bar">
        <label className="search-box">
          <Search size={19} />
          <input
            aria-label="Search books by title or author"
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="sort-box">
          <SlidersHorizontal size={17} />
          <select
            className="select"
            aria-label="Sort books"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      <div className="category-tabs" aria-label="Filter by category">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            className={`btn btn-sm ${category === c ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setCategory(c)}
          >
            {c === "All" ? "All Books" : c}
          </button>
        ))}
      </div>
      <div className="results-line">
        <span>
          {filtered.length} {filtered.length === 1 ? "story" : "stories"} to
          discover
        </span>
        <span>Good books find good people.</span>
      </div>
      {error ? (
        <div className="empty">
          <h2>Couldn’t load the shelf</h2>
          <p>{error}</p>
          <button className="btn" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      ) : filtered.length ? (
        <div className="book-grid">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      ) : (
        <Empty
          title="No books on this shelf yet"
          text="Try another search or category."
        >
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear filters
          </button>
        </Empty>
      )}
    </section>
  );
}
