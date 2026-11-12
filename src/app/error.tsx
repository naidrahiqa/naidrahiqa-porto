"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center gap-6 py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        Error / 500
      </p>
      <h1 className="max-w-[18ch] font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-foreground sm:text-6xl">
        Something broke <span className="text-foreground/30">on the way</span>
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed text-muted">
        An unexpected error stopped this page from rendering. You can retry, or
        head back home.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
