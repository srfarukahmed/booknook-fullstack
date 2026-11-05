"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, ArrowUpRight, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Book, categories } from "@/lib/types";
import { isDemo } from "@/lib/auth-client";
import { useLibrary } from "./provider";
import { Guard, Cover } from "./ui";
function Form({ book, onSaved }: { book?: Book; onSaved?: () => void }) {
  const { user, saveBook } = useLibrary();
  const router = useRouter();
  const [image, setImage] = useState(book?.image || "");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 4 * 1024 * 1024
    ) {
      toast.error("Choose a JPG, PNG, or WebP smaller than 4 MB.");
      return;
    }
    setUploading(true);
    try {
      const key = process.env.NEXT_PUBLIC_IMGBB_KEY;
      if (key) {
        const data = new FormData();
        data.set("image", file);
        const response = await fetch(
          "https://api.imgbb.com/1/upload?key=" + encodeURIComponent(key),
          { method: "POST", body: data },
        );
        const result = await response.json();
        if (!response.ok || !result.success)
          throw new Error("The image upload failed. Please try again.");
        setImage(result.data.url);
      } else if (isDemo) {
        if (file.size > 700 * 1024)
          throw new Error(
            "For local preview, choose an image under 700 KB or configure the imgbb key.",
          );
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setImage(data);
        toast.info("Image saved locally for the demo.");
      } else
        throw new Error(
          "Configure NEXT_PUBLIC_IMGBB_KEY to upload book images.",
        );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Image could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!image) {
      toast.error("Please upload a book image or enter an image URL.");
      return;
    }
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      await saveBook(
        {
          title: String(data.get("title")).trim(),
          author: String(data.get("author")).trim(),
          category: String(data.get("category")) as Book["category"],
          description: String(data.get("description")).trim(),
          image,
          totalCopies: Number(data.get("totalCopies")),
        },
        book?.id,
      );
      if (onSaved) onSaved();
      else router.push("/my-books");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Book could not be saved.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="book-form" onSubmit={submit}>
      <div className="upload-column">
        <div className="upload-preview">
          {image ? (
            <Cover src={image} title={book?.title || "Your book"} />
          ) : (
            <>
              <ImagePlus size={38} />
              <h3>A cover tells a story.</h3>
              <p>Add a photo of your book.</p>
            </>
          )}
        </div>
        <label className="btn btn-outline upload-label">
          <Upload size={17} />
          {uploading ? "Uploading…" : "Upload Book Image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </label>
        <small>
          JPG, PNG or WebP · max 4 MB
          <br />
          Local preview: max 700 KB
        </small>
        <label className="image-url">
          Or use an image URL
          <input
            type="url"
            className="input"
            placeholder="https://…"
            value={
              image.startsWith("data:") || image.startsWith("/") ? "" : image
            }
            onChange={(e) => setImage(e.target.value)}
          />
        </label>
      </div>
      <div className="form-stack">
        <div className="field-pair">
          <label>
            Book Title
            <input
              name="title"
              className="input"
              required
              maxLength={160}
              defaultValue={book?.title}
              placeholder="A story worth sharing"
            />
          </label>
          <label>
            Author Name
            <input
              name="author"
              className="input"
              required
              maxLength={100}
              defaultValue={book?.author}
              placeholder="Who wrote it?"
            />
          </label>
        </div>
        <div className="field-pair">
          <label>
            Category
            <select
              className="select"
              name="category"
              defaultValue={book?.category || "Fiction"}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Total Copies
            <input
              className="input"
              name="totalCopies"
              type="number"
              min="1"
              max="10000"
              step="1"
              required
              defaultValue={book?.totalCopies || 1}
            />
          </label>
        </div>
        <label>
          Short Description
          <textarea
            className="textarea"
            name="description"
            rows={5}
            required
            minLength={15}
            maxLength={2000}
            defaultValue={book?.description}
            placeholder="What makes this book special? Give your fellow readers a glimpse."
          />
        </label>
        <div className="contributor">
          <span className="eyebrow">SHARED WITH THE COMMUNITY BY</span>
          <div className="field-pair">
            <label>
              Your Name
              <input className="input" value={user?.name || ""} readOnly />
            </label>
            <label>
              Your Email
              <input className="input" value={user?.email || ""} readOnly />
            </label>
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Link className="btn btn-ghost" href="/my-books">
            Cancel
          </Link>
          <button className="btn btn-primary" disabled={busy || uploading}>
            {busy ? (
              <span className="loading loading-spinner loading-sm" />
            ) : book ? (
              "Save Changes"
            ) : (
              "Add Book"
            )}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}
export function BookForm(props: { book?: Book; onSaved?: () => void }) {
  return (
    <Guard>
      <Form {...props} />
    </Guard>
  );
}
export function AddBook() {
  return (
    <section className="site-width page-space">
      <div className="page-intro">
        <span className="eyebrow">A GOOD STORY DESERVES COMPANY</span>
        <h1>
          From your shelf.
          <br />
          <em>To someone’s next chapter.</em>
        </h1>
        <p>Share a book you love. Let it become someone else’s favorite.</p>
      </div>
      <BookForm />
    </section>
  );
}
