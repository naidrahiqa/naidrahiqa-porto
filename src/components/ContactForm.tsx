"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-foreground/40 focus:outline-none";

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setError("All fields are required");
      setSending(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to send");
      }

      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-fill text-accent">
          <Send size={22} />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-foreground">
            Message sent
          </p>
          <p className="mt-1 text-sm text-muted">
            I&apos;ll get back to you as soon as possible.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="Your name"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={200}
          placeholder="you@example.com"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={5}
          placeholder="Tell me about your project, question, or just say hi..."
          className={cn(FIELD_CLASS, "resize-none")}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3",
          "text-sm font-semibold tracking-wide text-background",
          "transition-opacity duration-200 hover:opacity-90 active:scale-[0.99]",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        <Send size={15} />
        {sending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
