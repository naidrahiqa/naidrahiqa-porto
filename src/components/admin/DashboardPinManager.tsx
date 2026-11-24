"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Loader2,
  Pencil,
  Pin,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn, resolveImageUrl } from "@/lib/utils";
import { isPklProject } from "@/lib/pkl";
import { useToast } from "@/components/admin/Toast";
import type { Project } from "@/lib/types";

export function DashboardPinManager({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const pinned = useMemo(
    () => projects.filter((p) => p.featured),
    [projects]
  );

  const unpinnedCandidates = useMemo(() => {
    const list = projects.filter((p) => !p.featured && p.published);
    const q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 10);
    return list
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.subject ?? "").toLowerCase().includes(q) ||
          (p.language ?? "").toLowerCase().includes(q) ||
          (p.repo_name ?? "").toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [projects, query]);

  async function togglePin(project: Project, nextFeatured: boolean) {
    if (busyId) return;
    setBusyId(project.id);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      if (!res.ok) throw new Error("Failed");
      setProjects((prev) =>
        prev.map((item) =>
          item.id === project.id ? { ...item, featured: nextFeatured } : item
        )
      );
      toast(
        "success",
        nextFeatured
          ? `"${project.title}" di-pin ke Beranda`
          : `"${project.title}" dilepas dari Beranda`
      );
    } catch {
      toast("error", "Gagal memperbarui pin proyek");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent-fill text-accent">
            <Pin size={16} className="fill-accent" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
                Proyek di-Pin ke Beranda
              </h2>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold",
                  pinned.length > 6
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : "border-accent/30 bg-accent-fill text-accent"
                )}
              >
                {pinned.length} / 6 slot
              </span>
            </div>
            <p className="text-xs text-muted">
              Proyek di bawah ini tampil di bagian &quot;Selected work&quot;
              halaman utama.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
            showPicker
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface-2 text-foreground hover:border-accent hover:text-accent"
          )}
        >
          {showPicker ? <X size={13} /> : <Plus size={13} />}
          {showPicker ? "Tutup Pilihan" : "Tambah Pin Proyek"}
        </button>
      </div>

      {/* Quick picker to add a project to homepage */}
      {showPicker && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2/60 p-3.5">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik nama proyek, repo, atau mapel yang ingin di-pin..."
              autoFocus
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {unpinnedCandidates.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {unpinnedCandidates.map((item) => {
                const isBusy = busyId === item.id;
                const isPkl = isPklProject(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-xs font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted">
                        {isPkl
                          ? "PKL"
                          : item.category === "school"
                            ? item.subject || "School"
                            : item.language || "Personal"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => togglePin(item, true)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Pin size={11} />
                      )}
                      Pin
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-muted">
              Tidak ada proyek yang ditemukan.
            </p>
          )}
        </div>
      )}

      {/* Pinned cards grid */}
      {pinned.length > 0 ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {pinned.map((item, idx) => {
            const cover = item.cover_image
              ? resolveImageUrl(item.cover_image)
              : null;
            const isBusy = busyId === item.id;
            const isPkl = isPklProject(item);
            const editHref = isPkl
              ? `/admin/pkl/${item.id}`
              : `/admin/projects/${item.id}`;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                  idx < 6
                    ? "border-accent/30 bg-accent-fill/25"
                    : "border-border bg-surface-2/50 opacity-75"
                )}
              >
                <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-[10px] font-bold text-accent">
                      #{idx + 1}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-accent">
                      #{idx + 1}
                    </span>
                    <span className="truncate font-mono text-[10px] uppercase text-muted">
                      {isPkl
                        ? "PKL"
                        : item.category === "school"
                          ? item.subject || "School"
                          : item.language || "Personal"}
                    </span>
                  </div>
                  <p className="truncate font-display text-xs font-bold text-foreground">
                    {item.title}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={editHref}
                    className="rounded-md border border-border bg-surface p-1.5 text-muted transition-colors hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </Link>
                  <Link
                    href={`/projects/${item.slug}`}
                    target="_blank"
                    className="rounded-md border border-border bg-surface p-1.5 text-muted transition-colors hover:text-foreground"
                    title="Lihat"
                  >
                    <ExternalLink size={12} />
                  </Link>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => togglePin(item, false)}
                    className="rounded-md border border-accent/30 bg-accent-fill p-1.5 text-accent transition-colors hover:bg-accent hover:text-on-accent"
                    title="Lepas pin dari Beranda"
                  >
                    {isBusy ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/30 p-6 text-center">
          <p className="text-xs font-semibold text-foreground">
            Belum ada proyek yang di-pin ke Beranda
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Klik tombol &quot;Tambah Pin Proyek&quot; di kanan atas untuk
            memilih hingga 6 proyek unggulan.
          </p>
        </div>
      )}
    </section>
  );
}
