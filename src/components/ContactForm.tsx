"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-accent/30 bg-accent/5 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Send size={24} />
        </div>
        <div>
          <p className="font-display text-lg font-bold">Message sent!</p>
          <p className="mt-1 text-sm text-muted">
            I&apos;ll get back to you as soon as possible.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 text-xs font-semibold uppercase tracking-wide text-accent hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="Your name"
          className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={200}
          placeholder="you@example.com"
          className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={5}
          placeholder="Tell me about your project, question, or just say hi..."
          className="w-full resize-none rounded-xl border-2 border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-accent focus:outline-none"
        />
      </div>

      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-accent px-6 py-3",
          "text-sm font-bold uppercase tracking-wide text-on-accent hard-shadow",
          "transition-all duration-150 hover:-translate-y-0.5 hover:hard-shadow-hover",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        <Send size={15} />
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
