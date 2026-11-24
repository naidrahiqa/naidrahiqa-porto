import { slugify } from "@/lib/utils";
import type { Project } from "@/lib/types";

export const PKL_SUBJECT = "PKL";
export const PKL_DEFAULT_CLASS = "xii";

export interface PklMeta {
  weekLabel: string;
  weekNumber: number | null;
  period: string | null;
  excerpt: string;
  readingTimeMinutes: number;
}

export interface PklTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const PKL_TEMPLATES: PklTemplate[] = [
  {
    id: "weekly-simple",
    name: "Jurnal Mingguan Simpel",
    description: "Format paling praktis: ringkasan kegiatan, hal yang dipelajari, dan dokumentasi.",
    content: `## Ringkasan Kegiatan
Ceritakan secara singkat apa saja kegiatan utama yang dikerjakan selama minggu ini.

## Pekerjaan yang Dilakukan
- Kegiatan atau tugas pertama yang dikerjakan.
- Kegiatan atau tugas kedua yang dikerjakan.
- Kegiatan atau tugas ketiga yang dikerjakan.

## Hal Baru yang Dipelajari
Catatan ilmu, alat, atau pengalaman baru yang didapat minggu ini.

## Kendala & Catatan
Kendala yang ditemui di lapangan dan bagaimana cara mengatasinya.`,
  },
  {
    id: "daily-log",
    name: "Catatan Harian (Senin - Jumat)",
    description: "Rincian kegiatan per hari dalam satu minggu ditambah kesimpulan akhir minggu.",
    content: `## Rincian Kegiatan Harian

### Senin
- Kegiatan hari Senin.

### Selasa
- Kegiatan hari Selasa.

### Rabu
- Kegiatan hari Rabu.

### Kamis
- Kegiatan hari Kamis.

### Jumat
- Kegiatan hari Jumat.

## Evaluasi Minggu Ini
Rangkuman hasil pekerjaan dan rencana untuk minggu berikutnya.`,
  },
  {
    id: "technical-note",
    name: "Catatan Teknis & Troubleshooting",
    description: "Cocok untuk minggu yang fokus pada instalasi, konfigurasi jaringan, atau perbaikan perangkat.",
    content: `## Konteks Tugas
Penjelasan pekerjaan teknis atau perangkat yang ditangani minggu ini.

## Alat & Perangkat
- Perangkat keras / jaringan yang digunakan.
- Software atau tools pendukung.

## Langkah Pengerjaan
1. Persiapan perangkat dan pengecekan awal.
2. Proses instalasi atau konfigurasi.
3. Pengujian hasil konfigurasi.

## Hasil Akhir
Kondisi setelah pekerjaan selesai dan dokumentasi hasil uji coba.`,
  },
  {
    id: "free-blog",
    name: "Cerita Blog Bebas",
    description: "Format tulisan mengalir seperti blog pribadi tanpa banyak subjudul kaku.",
    content: `Minggu ini di tempat PKL cukup banyak pengalaman menarik yang ingin saya catat.

Bagian paling berkesan minggu ini adalah ketika mengerjakan...

Dari kegiatan minggu ini, saya belajar bahwa...`,
  },
];

export function isPklSubjectSlug(subjectSlug: string | null | undefined): boolean {
  if (!subjectSlug) return false;
  const normalized = slugify(subjectSlug);
  return normalized === "pkl" || normalized === "praktik-kerja-lapangan";
}

export function isPklProject(
  project: Pick<Project, "category" | "subject"> | null | undefined
): boolean {
  if (!project || project.category !== "school") return false;
  return isPklSubjectSlug(project.subject);
}

export function formatPklLanguageField(
  weekLabel: string,
  period?: string | null
): string {
  const cleanWeek = weekLabel.trim();
  const cleanPeriod = (period ?? "").trim();
  if (cleanWeek && cleanPeriod) {
    return `${cleanWeek} | ${cleanPeriod}`;
  }
  return cleanWeek || cleanPeriod;
}

export function parseWeekNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.match(/(?:minggu|week|pekan)\s*(?:ke-?)?\s*(\d+)/i);
  if (match) {
    const num = Number.parseInt(match[1], 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  const bareMatch = text.trim().match(/^#?(\d+)$/);
  if (bareMatch) {
    const num = Number.parseInt(bareMatch[1], 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  return null;
}

export function stripMarkdownToExcerpt(
  markdown: string | null | undefined,
  maxLength = 180
): string {
  if (!markdown) return "";
  const trimmed = markdown.trim();
  if (!trimmed || trimmed.startsWith("{")) return "";

  const plain = trimmed
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+.*$/gm, " ")
    .replace(/[*_~`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

export function estimateReadingTimeMinutes(content: string | null | undefined): number {
  if (!content) return 1;
  const words = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function parsePklMeta(
  project: Pick<Project, "title" | "language" | "description" | "content">
): PklMeta {
  const rawLang = (project.language ?? "").trim();
  let weekLabel = "";
  let period: string | null = null;

  if (rawLang.includes("|")) {
    const [left, ...rest] = rawLang.split("|");
    weekLabel = left.trim();
    const right = rest.join("|").trim();
    period = right || null;
  } else if (rawLang) {
    weekLabel = rawLang;
  }

  const weekFromLang = parseWeekNumber(weekLabel);
  const weekFromTitle = parseWeekNumber(project.title);
  const weekNumber = weekFromLang ?? weekFromTitle;

  if (!weekLabel && weekNumber !== null) {
    weekLabel = `Minggu ${weekNumber}`;
  }

  const excerpt =
    project.description?.trim() ||
    stripMarkdownToExcerpt(project.content) ||
    "Catatan kegiatan dan dokumentasi mingguan selama Praktik Kerja Lapangan.";

  return {
    weekLabel: weekLabel || "Jurnal PKL",
    weekNumber,
    period,
    excerpt,
    readingTimeMinutes: estimateReadingTimeMinutes(project.content),
  };
}
