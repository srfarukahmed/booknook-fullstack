"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ArrowUpRight,
  Menu,
  X,
  Moon,
  Sun,
  Mail,
  MapPin,
} from "lucide-react";
import { useLibrary } from "./provider";
import { isDemo } from "@/lib/auth-client";
export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useLibrary();
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("booknook-theme") === "dark";
    setDark(saved);
    document.documentElement.dataset.theme = saved ? "dark" : "light";
  }, []);
  useEffect(() => setMenu(false), [path]);
  const links = [
    ["/", "Home"],
    ["/books", "All Books"],
    ...(user
      ? [
          ["/add-book", "Add Book"],
          ["/my-books", "My Books"],
          ["/my-borrows", "My Borrows"],
        ]
      : []),
  ];
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <div className="navbar site-width">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <BookOpen size={23} />
            </span>
            BookNook<span className="brand-dot"></span>
          </Link>
          <nav
            className={menu ? "nav-links open" : "nav-links"}
            aria-label="Main navigation"
          >
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={path === href ? "active" : ""}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="btn btn-ghost btn-circle theme-toggle"
              aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
              onClick={() => {
                const next = !dark;
                setDark(next);
                document.documentElement.dataset.theme = next
                  ? "dark"
                  : "light";
                localStorage.setItem("booknook-theme", next ? "dark" : "light");
              }}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            {user ? (
              <details className="dropdown dropdown-end">
                <summary
                  className="btn btn-circle avatar"
                  aria-label="Open account menu"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    user.name.slice(0, 1)
                  )}
                </summary>
                <ul className="menu dropdown-content bg-base-100 rounded-box shadow-xl w-56 z-50 p-3">
                  <li className="account-name">{user.name}</li>
                  <li>
                    <Link href="/profile">My Profile</Link>
                  </li>
                  <li>
                    <button onClick={() => void logout()}>Logout</button>
                  </li>
                </ul>
              </details>
            ) : (
              <>
                <Link href="/login" className="login-link">
                  Log in
                </Link>
                <Link href="/register" className="btn btn-primary join-button">
                  Join the nook <ArrowUpRight size={15} />
                </Link>
              </>
            )}
            <button
              className="btn btn-ghost btn-circle mobile-menu"
              onClick={() => setMenu(!menu)}
              aria-expanded={menu}
              aria-label="Toggle navigation"
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {isDemo && (
        <div className="demo-strip">
          CLIENT PREVIEW{" "}
          <span>Local demo · Your changes stay in this browser</span>
        </div>
      )}
      <main id="main">{children}</main>
      <footer>
        <div className="site-width footer-grid">
          <div>
            <Link href="/" className="brand">
              <span className="brand-mark">
                <BookOpen size={23} />
              </span>
              BookNook
            </Link>
            <p>
              A little space for big stories
              <br />
              Share a book. Find your people
            </p>
          </div>
          <div>
            <h3>Your next chapter</h3>
            <Link href="/books">Explore the library</Link>
            <Link href="/add-book">Share a book</Link>
            <Link href="/my-borrows">My reading shelf</Link>
          </div>
          <div>
            <h3>Let’s stay connected</h3>
            <a href="mailto:hello@booknook.example">
              <Mail size={15} /> faruk@booknook.example
            </a>
            <p>
              <MapPin size={15} /> A community without borders
            </p>
            <div className="socials">
              <a href="https://www.instagram.com/" aria-label="Instagram">
                Instagram ↗
              </a>
              <a href="https://x.com/" aria-label="X">
                𝕏 ↗
              </a>
              <a href="https://www.facebook.com/" aria-label="Facebook">
                Facebook ↗
              </a>
            </div>
          </div>
        </div>
        <div className="site-width footer-bottom">
          <span>
            © {new Date().getFullYear()} BookNook. Every story belongs.
          </span>
          <span>
            Made for the love of reading <BookOpen size={14} />
          </span>
        </div>
      </footer>
    </>
  );
}
