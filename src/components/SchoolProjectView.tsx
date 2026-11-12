"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { resolveImageUrl, getSourceHref, isTrustedImageHost } from "@/lib/utils";
import { ImageLightbox } from "@/components/ImageLightbox";
import { MarkdownContent } from "@/components/MarkdownContent";

export interface SchoolPointImage {
  url: string;
  caption?: string;
}

export interface SchoolPoint {
  id: string;
  title: string;
  text: string;
  images: SchoolPointImage[];
}

export interface StructuredSchoolProject {
  type: "school_project";
  intro?: string;
  points: SchoolPoint[];
  conclusion?: string;
}

export function isStructuredSchoolProject(
  content: string | null | undefined
): StructuredSchoolProject | null {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && (parsed.type === "school_project" || Array.isArray(parsed.points))) {
      return {
        type: "school_project",
        intro: parsed.intro || "",
        points: Array.isArray(parsed.points) ? parsed.points : [],
        conclusion: parsed.conclusion || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function SchoolProjectView({
  data,
}: {
  data: StructuredSchoolProject;
}) {
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    href?: string;
  } | null>(null);

  return (
    <div className="flex flex-col gap-10">
      {/* INTRO / LATAR BELAKANG */}
      {data.intro && data.intro.trim() && (
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            <BookOpen size={13} />
            <span>Latar Belakang &amp; Pengantar</span>
          </div>
          <MarkdownContent content={data.intro} />
        </section>
      )}

      {/* POIN-POIN KEGIATAN / SILA */}
      <section className="flex flex-col gap-8">
        {data.points.map((point, index) => {
          const numberLabel = String(index + 1).padStart(2, "0");
          const hasImages = point.images && point.images.length > 0;

          return (
            <article
              key={point.id || index}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-7"
            >
              {/* Header Poin */}
              <header className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 font-mono text-[11px] font-bold text-accent">
                    {numberLabel}
                  </span>
                  <h2 className="font-display text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                    {point.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
                  <CheckCircle2 size={13} className="text-accent" />
                  <span>
                    {hasImages
                      ? `${point.images.length} Dokumentasi`
                      : "Poin Pembahasan"}
                  </span>
                </div>
              </header>

              {/* Uraian Teks / Penjelasan Poin */}
              {point.text && point.text.trim() && (
                <div className="mb-6">
                  <MarkdownContent content={point.text} />
                </div>
              )}

              {/* Foto Dokumentasi Poin */}
              {hasImages && (
                <div
                  className={
                    point.images.length === 1
                      ? "mt-4 max-w-2xl"
                      : "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                  }
                >
                  {point.images.map((img, imgIdx) => {
                    const src = resolveImageUrl(img.url);
                    const href = getSourceHref(img.url);
                    const altText =
                      img.caption || `${point.title} - Foto #${imgIdx + 1}`;

                    return (
                      <figure
                        key={imgIdx}
                        className="group overflow-hidden rounded-xl border border-border bg-surface-2/60 transition-colors hover:border-foreground/25"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setLightbox({
                              src,
                              alt: altText,
                              href,
                            })
                          }
                          aria-label={`Lihat layar penuh: ${altText}`}
                          className="block w-full text-left"
                        >
                          <div className="relative aspect-video overflow-hidden bg-surface-2">
                            <Image
                              src={src}
                              alt={altText}
                              fill
                              sizes="(max-width: 640px) 100vw, 50vw"
                              unoptimized={!isTrustedImageHost(src)}
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </button>
                        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                          {img.caption ? (
                            <figcaption className="truncate font-mono text-xs text-muted">
                              {img.caption}
                            </figcaption>
                          ) : (
                            <span className="font-mono text-xs text-muted/60">
                              Dokumentasi #{imgIdx + 1}
                            </span>
                          )}
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition-colors hover:underline"
                          >
                            <ExternalLink size={11} />
                            source
                          </a>
                        </div>
                      </figure>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* KESIMPULAN & REFLEKSI */}
      {data.conclusion && data.conclusion.trim() && (
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            <Sparkles size={13} />
            <span>Kesimpulan &amp; Refleksi</span>
          </div>
          <MarkdownContent content={data.conclusion} />
        </section>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          href={lightbox.href}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
