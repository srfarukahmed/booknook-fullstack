"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, A11y } from "swiper/modules";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Heart,
  Users,
  Sparkles,
} from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useLibrary } from "./provider";
import { BookCard } from "./books";
import { Spinner } from "./ui";
import { isDemo } from "@/lib/auth-client";
const slides = [
  {
    tag: "YOUR NEXT CHAPTER STARTS HERE",
    title: (
      <>
        A little space.
        <br />
        For <em>big stories.</em>
      </>
    ),
    text: "Discover a book you’ll love. Share one that moved you. Welcome to a library that feels like home.",
  },
  {
    tag: "GOOD STORIES DESERVE TO TRAVEL",
    title: (
      <>
        Your old favorite.
        <br />
        Their <em>new adventure.</em>
      </>
    ),
    text: "Make room on your shelf and a little magic in someone’s day. Share your books with a community of curious minds.",
  },
  {
    tag: "READ. RETURN. REPEAT.",
    title: (
      <>
        Less scrolling.
        <br />
        More <em>page turning.</em>
      </>
    ),
    text: "Borrow a different perspective for a while. There’s a whole world waiting between the covers.",
  },
];
export default function Home() {
  const { books, arrivals, ready, error, refresh } = useLibrary();
  const latest = isDemo
    ? [...books]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 6)
    : arrivals;
  return (
    <>
      <section className="hero-section">
        <div className="site-width hero-inner">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, A11y]}
            autoplay={{
              delay: 6500,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            navigation
            speed={700}
            loop
            className="hero-slider"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={s.tag}>
                <div className="hero-slide">
                  <div className="hero-copy">
                    <span className="eyebrow">
                      <span className="little-line" />
                      {s.tag}
                    </span>
                    <h1>{s.title}</h1>
                    <p>{s.text}</p>
                    <Link href="/books" className="btn btn-primary">
                      Browse Books <ArrowUpRight size={18} />
                    </Link>
                    <div className="hero-trust">
                      <div className="reader-faces">
                        <span>AM</span>
                        <span>JL</span>
                        <span>SK</span>
                        <span>RN</span>
                      </div>
                      <div>
                        <strong>A community of curious minds</strong>
                        <small>One shared story at a time.</small>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`hero-art art-${i}`}
                    aria-label="An illustrated collection of community books"
                  >
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <span className="art-spark">✦</span>
                    <span className="art-caption">
                      a story for every version of you
                    </span>
                    <div className="floating-note">
                      <Heart size={17} /> Well-loved. Ready to share.
                    </div>
                    <img
                      className="hero-book back-book"
                      src={`/covers/book-${i + 2}.svg`}
                      alt={books[i + 1]?.title || "A community book"}
                    />
                    <img
                      className="hero-book front-book"
                      src={`/covers/book-${i + 1}.svg`}
                      alt={books[i]?.title || "A community book"}
                    />
                    <div className="art-label">
                      <BookOpen size={23} />
                      <div>
                        Find your next
                        <br />
                        <strong>can’t-put-it-down.</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      <div className="values-strip">
        <div className="site-width">
          <span>
            <BookOpen size={19} /> Stories worth sharing
          </span>
          <span>
            <Users size={19} /> A library built by you
          </span>
          <span>
            <Heart size={19} /> Borrow with a little love
          </span>
          <span>
            <Sparkles size={19} /> Always a new discovery
          </span>
        </div>
      </div>
      <section className="site-width section-space">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FRESH ON THE SHELF</span>
            <h2>Meet your next great read.</h2>
            <p>
              New arrivals, shared by our community. Your next favorite could be
              here.
            </p>
          </div>
          <span className="hand-note">fresh pages, fresh possibilities ↙</span>
        </div>
        {!ready ? (
          <Spinner />
        ) : error ? (
          <div className="empty">
            <p>{error}</p>
            <button className="btn" onClick={() => void refresh()}>
              Try again
            </button>
          </div>
        ) : (
          <div className="book-grid">
            {latest.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
        <div className="center-action">
          <Link href="/books" className="btn btn-outline">
            See All Books <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="how-section">
        <div className="site-width section-space">
          <div className="section-heading">
            <div>
              <span className="eyebrow">IT’S A BEAUTIFULLY SIMPLE THING</span>
              <h2>A good book. A little sharing.</h2>
            </div>
            <Link className="text-link" href="/register">
              Be part of the story <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="steps-grid">
            {[
              [
                "01",
                "Find your story",
                "Browse the shelves and discover something that speaks to you. Old favorites and new adventures live side by side.",
              ],
              [
                "02",
                "Make it yours, for a while",
                "Sign in and borrow a book for 14 days. Find a quiet corner, turn the first page, and settle in.",
              ],
              [
                "03",
                "Pass the feeling on",
                "Return your book when you’re done, or share one from your own shelf. Let the next chapter begin.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="site-width section-space">
        <div className="community-banner">
          <div className="quote-mark">“</div>
          <div>
            <span className="eyebrow">A NOOK FOR EVERY READER</span>
            <h2>
              Books bring us places.
              <br />
              <em>Sharing brings us together.</em>
            </h2>
            <p>
              A favorite book can open a door. Here, you can hold that door for
              someone else. Add a little of your shelf to ours.
            </p>
            <Link href="/add-book" className="btn btn-primary">
              Share a Book <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="community-stamp">
            <BookOpen size={45} />
            <span>
              ONE BOOK.
              <br />
              MANY STORIES.
            </span>
            <small>THE BOOKNOOK WAY</small>
          </div>
        </div>
      </section>
    </>
  );
}
