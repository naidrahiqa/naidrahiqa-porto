"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  BookOpen,
  Calendar,
  Check,
  Code,
  Eye,
  Heading2,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Loader2,
  PenSquare,
  Quote,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import { resolveImageUrl, slugify } from "@/lib/utils";
import {
  formatPklLanguageField,
  parsePklMeta,
  PKL_DEFAULT_CLASS,
  PKL_SUBJECT,
  PKL_TEMPLATES,
  stripMarkdownToExcerpt,
  type PklTemplate,
} from "@/lib/pkl";
import type { Project, ProjectLayout, ProjectMedia } from "@/lib/types";
import { Button, Input, Label, TextArea } from "@/components/admin/ui";
import { FileUpload } from "@/components/admin/FileUpload";
import { VideoFields } from "@/components/admin/VideoFields";
import { MediaGallery, type MediaDraft } from "@/components/admin/MediaGallery";
import { LAYOUTS } from "@/components/admin/LayoutPreview";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useToast } from "@/components/admin/Toast";

const QUICK_WEEKS = Array.from({ length: 12 }, (_, i) => `Minggu ${i + 1}`);

export function PklForm({
  initial,
  defaultWeekNumber = 1,
}: {
  initial?: Project | null;
  defaultWeekNumber?: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(initial);
  const isDirty = useRef(false);
  const markDirty = useCallback(() => {
    isDirty.current = true;
  }, []);

  const initialMeta = initial ? parsePklMeta(initial) : null;

  const [weekLabel, setWeekLabel] = useState(
    initialMeta?.weekLabel ?? `Minggu ${defaultWeekNumber}`
  );
  const [period, setPeriod] = useState(initialMeta?.period ?? "");
  const [classLevel, setClassLevel] = useState(
    initial?.class_level || PKL_DEFAULT_CLASS
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [isSlugCustom, setIsSlugCustom] = useState(Boolean(initial?.slug));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(
    initial?.content ?? PKL_TEMPLATES[0].content
  );
  const [layout, setLayout] = useState<ProjectLayout>(
    initial?.layout ?? "text-first"
  );
  const [coverImage, setCoverImage] = useState<string | null>(
    initial?.cover_image ?? null
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(
    initial?.video_url ?? null
  );
  const [videoType, setVideoType] = useState<string>(
    initial?.video_type ?? "none"
  );
  const [published, setPublished] = useState(initial?.published ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [media, setMedia] = useState<MediaDraft[]>([]);
  const [mediaLoaded, setMediaLoaded] = useState(!initial);
  const [mediaLoading, setMediaLoading] = useState(Boolean(initial));
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!initial) return;
    fetch(`/api/admin/projects/${initial.id}/media`)
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuat media");
        return r.json();
      })
      .then((data: ProjectMedia[]) => {
        if (Array.isArray(data)) {
          setMedia(
            data.map((m) => ({
              media_type: m.media_type,
              url: m.url,
              caption: m.caption,
            }))
          );
        }
        setMediaLoaded(true);
      })
      .catch(() => {
        setError("Gagal memuat galeri media. Coba muat ulang halaman.");
      })
      .finally(() => setMediaLoading(false));
  }, [initial]);

  const updateTitleAndSlug = useCallback(
    (nextTitle: string, nextWeek = weekLabel) => {
      setTitle(nextTitle);
      markDirty();
      if (!isSlugCustom) {
        const base = nextTitle.trim() || `Catatan Kegiatan PKL ${nextWeek}`;
        setSlug(slugify(`pkl-${nextWeek}-${base}`));
      }
    },
    [isSlugCustom, markDirty, weekLabel]
  );

  const handleSelectWeek = (nextWeek: string) => {
    setWeekLabel(nextWeek);
    markDirty();
    if (!isSlugCustom) {
      const base = title.trim() || `Catatan Kegiatan PKL ${nextWeek}`;
      setSlug(slugify(`pkl-${nextWeek}-${base}`));
    }
  };

  const insertMarkdown = useCallback(
    (prefix: string, suffix = "", placeholder = "") => {
      markDirty();
      const textarea = textareaRef.current;
      if (!textarea) {
        setContent((prev) => prev + prefix + placeholder + suffix);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      const textToInsert = selected || placeholder;
      const replacement = prefix + textToInsert + suffix;

      const newContent =
        textarea.value.substring(0, start) +
        replacement +
        textarea.value.substring(end);

      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        const cursorPosition = selected
          ? start + replacement.length
          : start + prefix.length + placeholder.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    },
    [markDirty]
  );

  const applyTemplate = (tmpl: PklTemplate) => {
    markDirty();
    if (
      content.trim().length > 0 &&
      !PKL_TEMPLATES.some((t) => t.content.trim() === content.trim())
    ) {
      const replace = window.confirm(
        `Ganti isi tulisan saat ini dengan template "${tmpl.name}"?`
      );
      if (!replace) return;
    }
    setContent(tmpl.content);
    setEditorMode("write");
    toast("success", `Template "${tmpl.name}" diterapkan`);
  };

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (isEdit && !mediaLoaded) {
      setError("Media sedang dimuat, tunggu sebentar sebelum menyimpan.");
      return;
    }

    setSaving(true);
    setError(null);

    const effectiveWeek = weekLabel.trim() || `Minggu ${defaultWeekNumber}`;
    const effectiveTitle =
      title.trim() || `Catatan Kegiatan PKL - ${effectiveWeek}`;
    const effectiveSlug =
      slug.trim() || slugify(`pkl-${effectiveWeek}-${effectiveTitle}`);
    const effectiveDescription =
      description.trim() || stripMarkdownToExcerpt(content, 160);
    const firstGalleryImage =
      media.find((item) => item.media_type === "image" && item.url.trim())
        ?.url ?? null;
    const effectiveCover = coverImage || firstGalleryImage;

    const payload = {
      title: effectiveTitle,
      slug: effectiveSlug,
      category: "school" as const,
      layout,
      class_level: classLevel || PKL_DEFAULT_CLASS,
      subject: PKL_SUBJECT,
      language: formatPklLanguageField(effectiveWeek, period),
      description: effectiveDescription,
      content,
      cover_image: effectiveCover,
      video_url: videoUrl,
      video_type: videoType,
      link: null,
      published,
      featured,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/projects/${initial!.id}` : "/api/admin/projects",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan catatan PKL");

      const projectId = isEdit ? initial!.id : data.id;

      const mediaRes = await fetch(`/api/admin/projects/${projectId}/media`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: media }),
      });
      if (!mediaRes.ok) {
        const mdata = await mediaRes.json().catch(() => ({}));
        throw new Error(mdata.error ?? "Gagal menyimpan galeri dokumentasi");
      }

      isDirty.current = false;
      toast(
        "success",
        isEdit
          ? "Catatan PKL berhasil diperbarui"
          : "Catatan PKL baru berhasil dipublikasikan"
      );
      router.push("/admin/pkl");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
      setSaving(false);
    }
  }

  const submitRef = useRef(handleSubmit);

  useEffect(() => {
    submitRef.current = handleSubmit;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (e.defaultPrevented) return;
        e.preventDefault();
        submitRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const uploadedPhotos = media.filter(
    (m) => m.media_type === "image" && m.url.trim()
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-16">
      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* 1. MINGGU & JUDUL */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Calendar size={17} />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
              Minggu &amp; Judul Kegiatan
            </h2>
            <p className="text-xs text-muted">
              Pilih minggu ke-berapa dan beri judul singkat (atau biarkan
              otomatis).
            </p>
          </div>
        </div>

        {/* Quick week pills */}
        <div>
          <Label>Pilih Minggu Cepat</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_WEEKS.map((w) => {
              const active = weekLabel.trim().toLowerCase() === w.toLowerCase();
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleSelectWeek(w)}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                    active
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border bg-surface-2 text-muted hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="pkl-week-label">Label Minggu / Tahap</Label>
            <Input
              id="pkl-week-label"
              value={weekLabel}
              onChange={(e) => handleSelectWeek(e.target.value)}
              placeholder="Minggu 1"
            />
          </div>

          <div>
            <Label htmlFor="pkl-period">Rentang Tanggal (Opsional)</Label>
            <Input
              id="pkl-period"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                markDirty();
              }}
              placeholder="Contoh: 12 - 17 Jan 2027"
            />
          </div>

          <div>
            <Label htmlFor="pkl-class">Kelas</Label>
            <div className="flex gap-1.5">
              {(["xii", "xi"] as const).map((cls) => (
                <button
                  key={cls}
                  id={cls === "xii" ? "pkl-class" : undefined}
                  type="button"
                  onClick={() => {
                    setClassLevel(cls);
                    markDirty();
                  }}
                  className={`flex-1 rounded-lg border py-2 text-xs font-bold uppercase transition-colors ${
                    classLevel === cls
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface-2 text-muted hover:text-foreground"
                  }`}
                >
                  Kelas {cls.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <Label htmlFor="pkl-title">Judul Postingan</Label>
            <button
              type="button"
              onClick={() =>
                updateTitleAndSlug(`Catatan Kegiatan PKL - ${weekLabel}`)
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <Wand2 size={12} />
              Pakai judul otomatis
            </button>
          </div>
          <Input
            id="pkl-title"
            value={title}
            onChange={(e) => updateTitleAndSlug(e.target.value)}
            placeholder={`Contoh: Orientasi & Crimping Kabel Server (kosongkan untuk "${weekLabel}")`}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <span className="font-mono">
              URL: /projects/
              {slug || slugify(`pkl-${weekLabel}-${title || weekLabel}`)}
            </span>
            <button
              type="button"
              onClick={() => setIsSlugCustom((prev) => !prev)}
              className="text-accent hover:underline"
            >
              {isSlugCustom ? "Sembunyikan edit URL" : "Ubah URL slug"}
            </button>
          </div>
          {isSlugCustom && (
            <div className="mt-2">
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  markDirty();
                }}
                placeholder="pkl-minggu-1"
              />
            </div>
          )}
        </div>
      </section>

      {/* 2. ISI CERITA / BLOG */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <BookOpen size={17} />
            </span>
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
                Cerita &amp; Kegiatan Mingguan
              </h2>
              <p className="text-xs text-muted">
                Bingung mau nulis apa? Klik salah satu template di bawah atau
                tulis bebas seperti blog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setEditorMode("write")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                editorMode === "write"
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <PenSquare size={12} />
              Tulis
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("preview")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                editorMode === "preview"
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Eye size={12} />
              Preview
            </button>
          </div>
        </div>

        {/* Template picker */}
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <Sparkles size={11} className="text-accent" />
            Template Cepat (Klik untuk pakai)
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {PKL_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="flex flex-col items-start rounded-xl border border-border bg-surface-2/60 p-3 text-left transition-colors hover:border-accent/50 hover:bg-surface-2"
              >
                <span className="font-display text-xs font-bold text-foreground">
                  {tmpl.name}
                </span>
                <span className="mt-0.5 text-[11px] leading-snug text-muted">
                  {tmpl.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {editorMode === "write" ? (
          <div className="flex flex-col gap-2">
            {/* Simple markdown toolbar */}
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface-2 p-1.5">
              <button
                type="button"
                onClick={() => insertMarkdown("## ", "", "Subjudul")}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                title="Subjudul"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**", "teks tebal")}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                title="Tebal"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*", "teks miring")}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                title="Miring"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("\n- ", "", "Kegiatan")}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                title="Daftar poin"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("\n1. ", "", "Langkah")}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                title="Daftar bernomor"
              >
                <ListOrdered size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("\n> ", "", "Catatan penting")}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                title="Kutipan"
              >
                <Quote size={15} />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertMarkdown("\n```bash\n", "\n```\n", "# perintah / kode")
                }
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                title="Blok kode"
              >
                <Code size={15} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={14}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                markDirty();
              }}
              placeholder="Tulis cerita kegiatan PKL minggu ini di sini..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-accent"
            />

            {uploadedPhotos.length > 0 && (
              <div className="rounded-xl border border-border bg-surface-2/50 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                  Klik foto di bawah bila ingin menyisipkannya langsung di
                  tengah paragraf:
                </p>
                <div className="flex flex-wrap gap-2">
                  {uploadedPhotos.map((photo, idx) => (
                    <button
                      key={`${photo.url}-${idx}`}
                      type="button"
                      onClick={() =>
                        insertMarkdown(
                          `\n![${photo.caption || `Dokumentasi ${idx + 1}`}](${resolveImageUrl(photo.url)})\n`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:border-accent"
                    >
                      <ImageIcon size={12} className="text-accent" />
                      {photo.caption || `Foto #${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-[260px] rounded-xl border border-border bg-background p-5">
            {content.trim() ? (
              <MarkdownContent content={content} />
            ) : (
              <p className="text-sm text-muted">Belum ada isi tulisan.</p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="pkl-desc">
            Ringkasan Singkat di Timeline (Opsional)
          </Label>
          <TextArea
            id="pkl-desc"
            rows={2}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              markDirty();
            }}
            placeholder="Kosongkan saja jika ingin diambil otomatis dari paragraf pertama tulisanmu."
          />
        </div>
      </section>

      {/* 3. FOTO & VIDEO DOKUMENTASI */}
      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <ImageIcon size={17} />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
              Upload Foto &amp; Video Dokumentasi
            </h2>
            <p className="text-xs text-muted">
              Upload foto kegiatan minggu ini seperti postingan biasa. Jika
              sampul dikosongkan, foto pertama galeri akan dipakai otomatis.
            </p>
          </div>
        </div>

        <div>
          <Label>Galeri Foto &amp; Video Kegiatan</Label>
          {mediaLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-4 text-xs text-muted">
              <Loader2 size={14} className="animate-spin text-accent" />
              Memuat galeri...
            </div>
          ) : (
            <MediaGallery
              items={media}
              onChange={(next) => {
                setMedia(next);
                markDirty();
              }}
            />
          )}
        </div>

        <div className="grid gap-6 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <FileUpload
              label="Foto Sampul / Cover (Opsional)"
              accept="image/*"
              value={coverImage}
              onChange={(url) => {
                setCoverImage(url || null);
                markDirty();
              }}
            />
            <p className="mt-1.5 text-[11px] text-muted">
              Kosongkan untuk memakai foto pertama di galeri secara otomatis.
            </p>
          </div>

          <div>
            <VideoFields
              url={videoUrl}
              type={videoType}
              onChange={({ video_url, video_type }) => {
                setVideoUrl(video_url);
                setVideoType(video_type);
                markDirty();
              }}
            />
          </div>
        </div>

        {/* Layout Selector */}
        <div className="border-t border-border pt-5">
          <Label>Tampilan Halaman Baca</Label>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {LAYOUTS.map((l) => {
              const active = layout === l.value;
              return (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => {
                    setLayout(l.value);
                    markDirty();
                  }}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent-fill/50 text-foreground"
                      : "border-border bg-surface-2/50 text-muted hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-display text-xs font-bold text-foreground">
                      {l.label}
                    </span>
                    {active && <Check size={13} className="text-accent" />}
                  </div>
                  <span className="mt-1 text-[11px] leading-snug text-muted">
                    {l.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PUBLIKASI & SIMPAN */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => {
                setPublished(e.target.checked);
                markDirty();
              }}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            Publikasikan sekarang
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => {
                setFeatured(e.target.checked);
                markDirty();
              }}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            <Star
              size={14}
              className={featured ? "fill-accent text-accent" : "text-muted"}
            />
            Tampilkan juga di Beranda
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (
                !isDirty.current ||
                window.confirm("Batalkan perubahan yang belum disimpan?")
              ) {
                router.push("/admin/pkl");
              }
            }}
          >
            Batal
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : isEdit ? (
              "Simpan Perubahan (Ctrl+S)"
            ) : (
              "Posting Catatan PKL (Ctrl+S)"
            )}
          </Button>
        </div>
      </section>
    </form>
  );
}
