"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Printer,
  Search,
  Video,
  X,
} from "lucide-react";
import {
  cn,
  formatDate,
  isTrustedImageHost,
  resolveImageUrl,
} from "@/lib/utils";
import { parsePklMeta } from "@/lib/pkl";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { Project } from "@/lib/types";

export function PklTimeline({ items }: { items: Project[] }) {
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"chronological" | "newest">("chronological");
  const [reportMode, setReportMode] = useState(false);

  const enriched = useMemo(() => {
    return items.map((project, index) => ({
      project,
      meta: parsePklMeta(project),
      index,
    }));
  }, [items]);

  const sortedAndFiltered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? enriched.filter(({ project, meta }) => {
          return (
            project.title.toLowerCase().includes(query) ||
            meta.weekLabel.toLowerCase().includes(query) ||
            (meta.period ?? "").toLowerCase().includes(query) ||
            meta.excerpt.toLowerCase().includes(query)
          );
        })
      : [...enriched];

    filtered.sort((a, b) => {
      const weekA = a.meta.weekNumber;
      const weekB = b.meta.weekNumber;
      if (weekA !== null && weekB !== null && weekA !== weekB) {
        return order === "chronological" ? weekA - weekB : weekB - weekA;
      }
      const sortDiff = (a.project.sort_order ?? 0) - (b.project.sort_order ?? 0);
      if (sortDiff !== 0) {
        return order === "chronological" ? sortDiff : -sortDiff;
      }
      const timeA = new Date(a.project.created_at).getTime();
      const timeB = new Date(b.project.created_at).getTime();
      return order === "chronological" ? timeA - timeB : timeB - timeA;
    });

    return filtered;
  }, [enriched, order, search]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center sm:p-12">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-muted">
          <BookOpen size={18} />
        </div>
        <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-foreground">
          Belum ada catatan kegiatan mingguan
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Jurnal mingguan selama Praktik Kerja Lapangan akan muncul di sini
          setiap kali postingan baru dipublikasikan dari panel admin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari minggu atau kegiatan..."
            aria-label="Cari catatan PKL"
            className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-foreground/40"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setOrder((prev) =>
                prev === "chronological" ? "newest" : "chronological"
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-foreground/30 hover:text-foreground active:scale-[0.98]"
          >
            <ArrowUpDown size={12} />
            {order === "chronological" ? "Urut: Minggu Awal" : "Urut: Terbaru"}
          </button>

          <button
            type="button"
            onClick={() => setReportMode((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors active:scale-[0.98]",
              reportMode
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground"
            )}
          >
            <FileText size={12} />
            {reportMode ? "Mode Timeline" : "Mode Rekap Lengkap"}
          </button>

          {reportMode && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-on-accent transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <Printer size={12} />
              Cetak / Simpan PDF
            </button>
          )}
        </div>
      </div>

      {/* Full Report Mode (for reading all weeks or printing/exporting PDF) */}
      {reportMode ? (
        <div className="flex flex-col gap-8">
          {sortedAndFiltered.map(({ project, meta }, idx) => {
            const coverSrc = project.cover_image
              ? resolveImageUrl(project.cover_image)
              : null;

            return (
              <article
                key={project.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:p-8 print:break-inside-avoid print:border-black/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-wider">
                    <span className="rounded-full border border-accent/30 bg-accent-fill px-3 py-0.5 font-bold text-accent">
                      {meta.weekLabel || `Minggu ${idx + 1}`}
                    </span>
                    <span className="text-muted">
                      {meta.period ?? formatDate(project.created_at)}
                    </span>
                  </div>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline print:hidden"
                  >
                    Halaman detail →
                  </Link>
                </div>

                <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {project.title}
                </h2>

                {coverSrc && (
                  <div className="relative aspect-[16/9] max-h-80 w-full overflow-hidden rounded-xl border border-border bg-surface-2">
                    <Image
                      src={coverSrc}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      unoptimized={!isTrustedImageHost(coverSrc)}
                      className="object-cover"
                    />
                  </div>
                )}

                {project.content ? (
                  <div className="mt-1">
                    <MarkdownContent content={project.content} />
                  </div>
                ) : (
                  <p className="text-sm text-muted">{meta.excerpt}</p>
                )}
              </article>
            );
          })}
        </div>
      ) : sortedAndFiltered.length > 0 ? (
        /* Timeline feed */
        <ol className="relative ml-3 flex flex-col gap-6 border-l border-border pl-6 sm:ml-4 sm:pl-8">
          {sortedAndFiltered.map(({ project, meta }, idx) => {
            const coverSrc = project.cover_image
              ? resolveImageUrl(project.cover_image)
              : null;
            const badgeNumber =
              meta.weekNumber !== null
                ? `W${String(meta.weekNumber).padStart(2, "0")}`
                : String(idx + 1).padStart(2, "0");

            return (
              <li key={project.id} className="relative">
                {/* Timeline node */}
                <span className="absolute -left-[37px] top-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background font-mono text-[9px] font-bold text-muted sm:-left-[45px]">
                  {badgeNumber}
                </span>

                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-foreground/25 sm:flex-row sm:items-start sm:p-6"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      <span className="rounded-full border border-accent/30 bg-accent-fill px-2.5 py-0.5 font-semibold text-accent">
                        {meta.weekLabel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />
                        {meta.period ?? formatDate(project.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {meta.readingTimeMinutes} menit baca
                      </span>
                      {project.video_url && project.video_type !== "none" && (
                        <span className="inline-flex items-center gap-1 text-foreground/70">
                          <Video size={11} />
                          Video
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-xl">
                      {project.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted sm:text-sm">
                      {meta.excerpt}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-foreground">
                      Baca catatan lengkap
                      <ArrowRight
                        size={13}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </div>
                  </div>

                  {coverSrc && (
                    <div
                      className={cn(
                        "relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 sm:w-48 md:w-56"
                      )}
                    >
                      <Image
                        src={coverSrc}
                        alt={project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 224px"
                        unoptimized={!isTrustedImageHost(coverSrc)}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
          <p className="font-display text-sm font-bold text-foreground">
            Tidak ada catatan yang cocok dengan &quot;{search}&quot;
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-2 text-xs font-semibold text-accent hover:underline"
          >
            Reset pencarian
          </button>
        </div>
      )}
    </div>
  );
}
