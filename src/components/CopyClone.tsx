"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

export function CopyClone({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`git clone ${url}`);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be blocked by the browser.
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <Terminal size={13} className="shrink-0 text-muted" />
      <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">
        git clone {url}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Clone command copied" : "Copy clone command"}
        title={copied ? "Copied" : "Copy clone command"}
        className="shrink-0 rounded p-1 text-muted transition-colors hover:text-foreground active:scale-95"
      >
        {copied ? (
          <Check size={13} className="text-accent-2" />
        ) : (
          <Copy size={13} />
        )}
      </button>
    </div>
  );
}
