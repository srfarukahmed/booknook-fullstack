"use client";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLibrary } from "./provider";
import { X, BookOpen } from "lucide-react";
export function Spinner() {
  return (
    <div className="loading-area" role="status">
      <span className="loading loading-spinner loading-lg" />
      <span>Finding your next chapter…</span>
    </div>
  );
}
export function Guard({ children }: { children: ReactNode }) {
  const { user, ready } = useLibrary();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (ready && !user)
      router.replace("/login?next=" + encodeURIComponent(path));
  }, [ready, user, path, router]);
  return ready && user ? <>{children}</> : <Spinner />;
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const element = ref.current;
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost close-modal"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <BookOpen size={40} />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function safeNext(value: string | null) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/";
}
export function Cover({
  src,
  title,
  className = "",
}: {
  src: string;
  title: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={src}
      alt={`${title} cover`}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/covers/fallback.svg";
      }}
    />
  );
}
