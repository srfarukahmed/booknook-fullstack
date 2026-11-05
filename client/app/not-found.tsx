import Link from "next/link";
export default function NotFound() {
  return (
    <section className="site-width empty">
      <span className="eyebrow">A SMALL PLOT TWIST</span>
      <h1>
        Looks like this page
        <br />
        left the shelf.
      </h1>
      <p>We couldn’t find that chapter. A new story is waiting back home.</p>
      <Link href="/" className="btn btn-primary">
        Back to Home →
      </Link>
    </section>
  );
}
