"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty">
      <h1>A little interruption.</h1>
      <p>We couldn’t load this chapter. Please try again.</p>
      <button className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
