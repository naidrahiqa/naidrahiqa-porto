"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";

export function FeaturedToggle({
  id,
  featured,
  onToggled,
  compact = false,
}: {
  id: string;
  featured: boolean;
  onToggled?: (nextValue: boolean) => void;
  compact?: boolean;
}) {
  const [value, setValue] = useState(featured);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  if (featured !== value && !busy) {
    setValue(featured);
  }

  async function toggle() {
    if (busy) return;
    const next = !value;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: next }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status pin");
      setValue(next);
      onToggled?.(next);
      toast(
        "success",
        next ? "Proyek di-pin ke Beranda" : "Pin Beranda dilepas"
      );
    } catch {
      toast("error", "Gagal mengubah status pin");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={
        value
          ? "Di-pin di Beranda (Klik untuk lepas)"
          : "Pin proyek ini ke Beranda"
      }
      aria-label={value ? "Unpin dari Beranda" : "Pin ke Beranda"}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
        value
          ? "border-accent/40 bg-accent-fill text-accent hover:bg-accent/20"
          : "border-border bg-surface-2 text-muted hover:border-foreground/30 hover:text-foreground",
        busy && "opacity-60"
      )}
    >
      {busy ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Pin size={12} className={value ? "fill-accent text-accent" : ""} />
      )}
      {!compact && <span>{value ? "Pinned" : "Pin"}</span>}
    </button>
  );
}

export function PublishToggle({
  id,
  published,
  onToggled,
}: {
  id: string;
  published: boolean;
  onToggled?: (nextValue: boolean) => void;
}) {
  const [value, setValue] = useState(published);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  if (published !== value && !busy) {
    setValue(published);
  }

  async function toggle() {
    if (busy) return;
    const next = !value;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status publikasi");
      setValue(next);
      onToggled?.(next);
      toast(
        "success",
        next ? "Proyek dipublikasikan" : "Proyek disembunyikan (Draft)"
      );
    } catch {
      toast("error", "Gagal mengubah status publikasi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={
        value
          ? "Publik (Klik untuk sembunyikan jadi Draft)"
          : "Draft / Tersembunyi (Klik untuk publikasikan)"
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase transition-colors",
        value
          ? "border-accent-2/30 bg-accent-2-fill text-accent-2 hover:opacity-80"
          : "border-border bg-surface-2 text-muted hover:text-foreground",
        busy && "opacity-60"
      )}
    >
      {busy ? (
        <Loader2 size={11} className="animate-spin" />
      ) : value ? (
        <Eye size={11} />
      ) : (
        <EyeOff size={11} />
      )}
      <span>{value ? "Live" : "Draft"}</span>
    </button>
  );
}
