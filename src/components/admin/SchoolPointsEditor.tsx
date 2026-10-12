"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ImagePlus,
  Check,
  ExternalLink,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";
import { Label } from "@/components/admin/ui";
import { FileUpload } from "@/components/admin/FileUpload";
import type { SchoolPoint, SchoolPointImage } from "@/components/SchoolProjectView";
import type { MediaDraft } from "@/components/admin/MediaGallery";

interface SchoolPointsEditorProps {
  intro: string;
  points: SchoolPoint[];
  conclusion: string;
  media: MediaDraft[];
  onChange: (intro: string, points: SchoolPoint[], conclusion: string) => void;
  onGeneratePancasila: () => void;
}

export function SchoolPointsEditor({
  intro,
  points,
  conclusion,
  media,
  onChange,
  onGeneratePancasila,
}: SchoolPointsEditorProps) {
  const [activeUploadPtIdx, setActiveUploadPtIdx] = useState<number | null>(null);

  const updateIntro = (newIntro: string) => {
    onChange(newIntro, points, conclusion);
  };

  const updateConclusion = (newConc: string) => {
    onChange(intro, points, newConc);
  };

  const addPoint = () => {
    const nextIdx = points.length + 1;
    const newPoint: SchoolPoint = {
      id: `point-${Date.now()}`,
      title: `Poin #${nextIdx}`,
      text: "",
      images: [],
    };
    onChange(intro, [...points, newPoint], conclusion);
  };

  const updatePoint = (index: number, patch: Partial<SchoolPoint>) => {
    const nextPts = points.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange(intro, nextPts, conclusion);
  };

  const removePoint = (index: number) => {
    const nextPts = points.filter((_, i) => i !== index);
    onChange(intro, nextPts, conclusion);
  };

  const movePoint = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= points.length) return;
    const nextPts = [...points];
    [nextPts[index], nextPts[target]] = [nextPts[target], nextPts[index]];
    onChange(intro, nextPts, conclusion);
  };

  const attachImage = (pointIndex: number, img: SchoolPointImage) => {
    const point = points[pointIndex];
    if (!point) return;
    const nextImages = [...(point.images || []), img];
    updatePoint(pointIndex, { images: nextImages });
  };

  const removeImage = (pointIndex: number, imgIndex: number) => {
    const point = points[pointIndex];
    if (!point) return;
    const nextImages = point.images.filter((_, i) => i !== imgIndex);
    updatePoint(pointIndex, { images: nextImages });
  };

  const updateCaption = (pointIndex: number, imgIndex: number, caption: string) => {
    const point = points[pointIndex];
    if (!point) return;
    const nextImages = point.images.map((img, i) =>
      i === imgIndex ? { ...img, caption } : img
    );
    updatePoint(pointIndex, { images: nextImages });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-foreground bg-surface p-4 hard-shadow">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-on-accent hard-shadow-sm font-bold">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
              Mode Poin & Foto Tugas Sekolah
            </h3>
            <p className="text-xs text-muted">
              Foto langsung terpasang di tiap poin (grid 2 kolom). Tanpa perlu salin link manual.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onGeneratePancasila}
            className="inline-flex items-center gap-1.5 rounded-xl border border-accent bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-on-accent"
            title="Otomatis susun 5 Sila dengan 10 foto yang ada di galeri"
          >
            <Sparkles size={13} />
            🪄 Susun 5 Sila Otomatis (10 Foto)
          </button>
          <button
            type="button"
            onClick={addPoint}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-accent px-3 py-1.5 text-xs font-bold text-on-accent transition-colors hover:bg-accent-hover"
          >
            <Plus size={14} />
            Tambah Poin
          </button>
        </div>
      </div>

      {/* 1. LATAR BELAKANG */}
      <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="school-intro">
            Latar Belakang & Pendahuluan
          </Label>
          <span className="font-mono text-[11px] text-muted">
            Pengantar proyek & tujuan
          </span>
        </div>
        <textarea
          id="school-intro"
          rows={4}
          value={intro}
          onChange={(e) => updateIntro(e.target.value)}
          placeholder="Tuliskan latar belakang tugas, tujuan observasi, dan relevansinya di sekolah..."
          className="w-full rounded-xl border border-border/80 bg-surface-2/40 p-3.5 text-sm leading-relaxed text-foreground placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15"
        />
      </div>

      {/* 2. DAFTAR POIN-POIN */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
            Daftar Poin Pembahasan ({points.length})
          </span>
          <span className="font-mono text-xs text-muted">
            Tiap poin bisa dipasangi foto langsung
          </span>
        </div>

        {points.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-surface-2/30 p-8 text-center">
            <BookOpen size={32} className="mx-auto text-muted mb-2 opacity-50" />
            <p className="font-semibold text-foreground text-sm">
              Belum ada poin kegiatan yang dibuat
            </p>
            <p className="text-xs text-muted mt-1 max-w-md mx-auto">
              Klik tombol di bawah untuk membuat poin baru, atau klik Susun 5 Sila Otomatis untuk langsung memasangkan 10 foto media.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onGeneratePancasila}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-on-accent hard-shadow-sm"
              >
                <Sparkles size={14} />
                Susun 5 Sila Otomatis (10 Foto)
              </button>
              <button
                type="button"
                onClick={addPoint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:border-accent"
              >
                <Plus size={14} />
                Tambah Poin Manual
              </button>
            </div>
          </div>
        ) : (
          points.map((point, ptIdx) => (
            <div
              key={point.id || ptIdx}
              className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow transition-all"
            >
              {/* Header Poin Card */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20 font-mono text-xs font-bold text-accent border border-accent/30">
                    {String(ptIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    Poin #{ptIdx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => movePoint(ptIdx, -1)}
                    disabled={ptIdx === 0}
                    className="rounded p-1 text-muted hover:text-accent disabled:opacity-30"
                    title="Geser ke atas"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePoint(ptIdx, 1)}
                    disabled={ptIdx === points.length - 1}
                    className="rounded p-1 text-muted hover:text-accent disabled:opacity-30"
                    title="Geser ke bawah"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePoint(ptIdx)}
                    className="rounded p-1 text-danger hover:bg-danger/10"
                    title="Hapus poin ini"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Form Input Poin */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Judul Poin *</Label>
                  <input
                    type="text"
                    value={point.title}
                    onChange={(e) => updatePoint(ptIdx, { title: e.target.value })}
                    placeholder="misal: Sila Pertama: Ketuhanan Yang Maha Esa"
                    className="w-full rounded-xl border border-border/80 bg-surface-2/40 px-3.5 py-2 text-sm font-semibold text-foreground outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15"
                  />
                </div>

                <div>
                  <Label>Penjelasan Materi / Aksi Nyata</Label>
                  <textarea
                    rows={4}
                    value={point.text}
                    onChange={(e) => updatePoint(ptIdx, { text: e.target.value })}
                    placeholder="Tuliskan makna nilai dan bukti aksi nyata di sekolah..."
                    className="w-full rounded-xl border border-border/80 bg-surface-2/40 p-3 text-sm leading-relaxed text-foreground placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15"
                  />
                </div>

                {/* Section Foto Dokumentasi Poin */}
                <div className="rounded-xl border border-border/80 bg-surface-2/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-foreground">
                      Foto Dokumentasi Poin Ini ({point.images?.length || 0})
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {point.images?.length === 2
                        ? "✨ Tampil 2 kolom berdampingan"
                        : point.images?.length === 1
                          ? "Tampil 1 kolom lebar"
                          : "Pilih foto di bawah untuk memasang"}
                    </span>
                  </div>

                  {/* Foto yang sudah terpasang di poin ini */}
                  {point.images && point.images.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 mb-3.5">
                      {point.images.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-2.5"
                        >
                          <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-surface-2 flex-shrink-0 border border-border/60">
                            <img
                              src={resolveImageUrl(img.url)}
                              alt={img.caption || "foto"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={img.caption || ""}
                              onChange={(e) =>
                                updateCaption(ptIdx, imgIdx, e.target.value)
                              }
                              placeholder="Caption foto..."
                              className="w-full rounded-lg border border-border/60 bg-surface-2 px-2.5 py-1 text-xs text-foreground outline-none focus:border-accent"
                            />
                            <div className="flex items-center justify-between">
                              <a
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-accent"
                              >
                                <ExternalLink size={10} />
                                lihat
                              </a>
                              <button
                                type="button"
                                onClick={() => removeImage(ptIdx, imgIdx)}
                                className="text-[10px] text-danger hover:underline"
                              >
                                Hapus Foto
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Photo Selector dari Galeri Media Proyek */}
                  {media.length > 0 && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-[11px] font-semibold text-muted mb-2">
                        Klik foto dari galeri proyek untuk langsung dipasang ke Poin #{ptIdx + 1}:
                      </p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                        {media.map((mItem, mIdx) => {
                          const isAlreadyAttached = point.images?.some(
                            (i) => i.url === mItem.url
                          );
                          return (
                            <button
                              key={mIdx}
                              type="button"
                              onClick={() =>
                                attachImage(ptIdx, {
                                  url: mItem.url,
                                  caption: mItem.caption || `Foto #${mIdx + 1}`,
                                })
                              }
                              className={`group relative flex flex-shrink-0 items-center gap-1.5 rounded-xl border p-1 transition-all ${
                                isAlreadyAttached
                                  ? "border-accent bg-accent/10 opacity-70"
                                  : "border-border bg-surface hover:border-accent"
                              }`}
                              title={
                                isAlreadyAttached
                                  ? `Foto #${mIdx + 1} sudah terpasang (klik untuk tambah lagi)`
                                  : `Pasang Foto #${mIdx + 1} ke poin ini`
                              }
                            >
                              <div className="relative h-11 w-16 overflow-hidden rounded-lg bg-surface-2">
                                <img
                                  src={resolveImageUrl(mItem.url)}
                                  alt={mItem.caption || `Foto ${mIdx + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                                <span className="absolute bottom-0 right-0 bg-background/90 px-1 font-mono text-[9px] text-foreground">
                                  #{mIdx + 1}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-accent pr-1">
                                {isAlreadyAttached ? "✓ Ada" : "+ Pasang"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upload / URL Baru ke Poin Ini */}
                  <div className="mt-3">
                    {activeUploadPtIdx === ptIdx ? (
                      <div className="rounded-xl border border-border bg-surface p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-foreground">
                            Upload Foto Baru ke Poin Ini
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveUploadPtIdx(null)}
                            className="text-[11px] text-muted hover:text-foreground"
                          >
                            Tutup
                          </button>
                        </div>
                        <FileUpload
                          label=""
                          value={null}
                          onChange={(url) => {
                            if (url) {
                              attachImage(ptIdx, {
                                url,
                                caption: `${point.title} - Foto`,
                              });
                              setActiveUploadPtIdx(null);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveUploadPtIdx(ptIdx)}
                        className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-accent font-medium"
                      >
                        <ImagePlus size={12} />
                        <span>Upload atau tempel link foto baru ke poin ini...</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Tombol Tambah Poin Bawah */}
        {points.length > 0 && (
          <button
            type="button"
            onClick={addPoint}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-4 text-xs font-bold text-muted transition-colors hover:border-accent hover:text-accent hover:bg-surface-2/40"
          >
            <Plus size={16} />
            Tambah Poin Pembahasan Baru
          </button>
        )}
      </div>

      {/* 3. KESIMPULAN & REFLEKSI */}
      <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="school-conclusion">
            Kesimpulan & Refleksi Akhir
          </Label>
          <span className="font-mono text-[11px] text-muted">
            Rangkuman penutup
          </span>
        </div>
        <textarea
          id="school-conclusion"
          rows={4}
          value={conclusion}
          onChange={(e) => updateConclusion(e.target.value)}
          placeholder="Rangkum hasil pengamatan, refleksi penerapan nilai di kehidupan nyata, atau pesan penutup..."
          className="w-full rounded-xl border border-border/80 bg-surface-2/40 p-3.5 text-sm leading-relaxed text-foreground placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15"
        />
      </div>
    </div>
  );
}
