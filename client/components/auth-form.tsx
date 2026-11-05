"use client";
import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Eye, EyeOff, ArrowUpRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useLibrary } from "./provider";
import { isDemo } from "@/lib/auth-client";
import { safeNext, Spinner } from "./ui";
function Form({ register = false }: { register?: boolean }) {
  const library = useLibrary();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      if (register) {
        await library.register(
          String(data.get("name")).trim(),
          String(data.get("email")).trim(),
          password,
          String(data.get("image")).trim(),
        );
        toast.success("Your account is ready. Please log in.");
        router.push("/login?next=" + encodeURIComponent(next));
      } else {
        await library.login(String(data.get("email")).trim(), password);
        toast.success("Welcome back to your nook.");
        router.push(next);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    try {
      await library.google(register ? "/" : next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="site-width auth-layout page-space">
      <aside className="auth-story">
        <BookOpen size={40} />
        <span className="eyebrow">THERE’S A PLACE FOR YOU HERE</span>
        <h1>
          {register ? (
            <>
              New reader.
              <br />
              <em>New possibilities.</em>
            </>
          ) : (
            <>
              Welcome back
              <br />
              to <em>your nook.</em>
            </>
          )}
        </h1>
        <p>
          A familiar favorite. A fresh perspective. A small community that
          believes every story deserves to be shared.
        </p>
        <div className="auth-book-stack">
          <img src="/covers/book-1.svg" alt="The Quiet Forest" />
          <img src="/covers/book-6.svg" alt="Beyond the Blue Horizon" />
        </div>
      </aside>
      <div className="auth-panel">
        <span className="eyebrow">
          {register ? "LET’S START YOUR STORY" : "JUST ONE MORE CHAPTER"}
        </span>
        <h2>{register ? "Create your account" : "Good to see you again."}</h2>
        <p>
          {register
            ? "Your next favorite book is waiting."
            : "Log in and pick up where you left off."}
        </p>
        <button
          className="btn btn-outline google-btn"
          onClick={() => void google()}
          disabled={busy}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.6a4.8 4.8 0 0 1-2.1 3.2v2.6h3.4c2-1.8 3.1-4.5 3.1-7.7Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1.9-3.5.9-2.7 0-5-1.8-5.8-4.2H2.7v2.7A10.4 10.4 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.2 13.6a6.2 6.2 0 0 1 0-3.2V7.7H2.7a10.4 10.4 0 0 0 0 9.6l3.5-2.7Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.2c1.5 0 2.9.5 4 1.6l3-3A10.1 10.1 0 0 0 12 2a10.4 10.4 0 0 0-9.3 5.7l3.5 2.7C7 8 9.3 6.2 12 6.2Z"
            />
          </svg>
          Continue with Google
        </button>
        <div className="divider">or with your email</div>
        <form onSubmit={submit} className="form-stack">
          {register && (
            <label>
              Full name
              <input
                className="input"
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              className="input"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          {register && (
            <label>
              Photo URL <span className="optional">(optional)</span>
              <input
                className="input"
                type="url"
                name="image"
                placeholder="https://example.com/your-photo.jpg"
              />
            </label>
          )}
          <label>
            Password
            <div className="password-wrap">
              <input
                className="input"
                name="password"
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {register ? (
            <div className="password-rules">
              {[
                ["6 or more characters", password.length >= 6],
                ["An uppercase letter", /[A-Z]/.test(password)],
                ["A lowercase letter", /[a-z]/.test(password)],
              ].map(([text, pass]) => (
                <span key={String(text)} className={pass ? "passed" : ""}>
                  <Check size={13} />
                  {text}
                </span>
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="forgot"
              onClick={() =>
                toast.info(
                  "Password recovery is intentionally disabled for this assignment preview.",
                )
              }
            >
              Forgot password?
            </button>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? (
              <span className="loading loading-spinner loading-sm" />
            ) : register ? (
              "Create Account"
            ) : (
              "Log in"
            )}
            {!busy && <ArrowUpRight size={17} />}
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Already part of the community?" : "New to the nook?"}{" "}
          <Link
            href={`${register ? "/login" : "/register"}?next=${encodeURIComponent(next)}`}
          >
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
        {isDemo && (
          <div className="demo-login">
            <strong>Take a look around</strong>
            <p>No signup needed for the client preview.</p>
            <button
              className="btn btn-sm btn-outline"
              disabled={busy}
              onClick={() => {
                library.demoLogin();
                toast.success("Welcome, Alex!");
                router.push(next);
              }}
            >
              Enter as demo reader →
            </button>
            <small>Or use reader@booknook.demo / Reader123</small>
          </div>
        )}
      </div>
    </section>
  );
}
export default function AuthForm(props: { register?: boolean }) {
  return (
    <Suspense fallback={<Spinner />}>
      <Form {...props} />
    </Suspense>
  );
}
