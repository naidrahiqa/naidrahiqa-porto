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
  ExternalLink,
  Wand2,
  Zap,
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
}

const INTRO_PRESETS = {
  teknis:
    "Praktikum dan tugas kejuruan merupakan sarana mengasah kompetensi teknis, pemahaman materi, dan kebiasaan kerja terstandar di ruang kelas maupun laboratorium. Pada kegiatan ini, kami mengimplementasikan materi secara terstruktur mulai dari perencanaan, pelaksanaan, hingga validasi hasil.\n\nLaporan ini merangkum setiap tahapan beserta bukti visual hasil pengujian.",
  observasi:
    "Kegiatan observasi dan proyek ini dilaksanakan sebagai bagian dari tugas pembelajaran berbasis proyek (Project-Based Learning) untuk memadukan pemahaman teori dengan kondisi aktual di lingkungan sekolah. Melalui pengamatan terarah, dokumentasi visual yang terstruktur, dan diskusi kelompok, kami mengumpulkan bukti konkret untuk mengevaluasi topik yang dipelajari.",
};

const CONCLUSION_PRESETS = {
  teknis:
    "Seluruh rangkaian kegiatan ini berhasil diselesaikan sesuai spesifikasi modul. Melalui pengujian bertahap dan pemecahan kendala secara langsung, kami memperoleh pemahaman mendalam tentang prinsip kerja sistem serta pentingnya ketelitian dan standar operasional dalam setiap tahapan.",
  tim:
    "Proyek ini membuktikan bahwa koordinasi yang rapi dan komunikasi terbuka adalah kunci penyelesaian tugas bersama secara optimal. Setiap anggota berkontribusi aktif sesuai perannya masing-masing sehingga seluruh dokumentasi dan target pembelajaran dapat tercapai dengan hasil yang memuaskan.",
};

const UNIVERSAL_INTRO =
  "Kegiatan ini dilaksanakan sebagai bagian dari pembelajaran berbasis proyek untuk menghubungkan materi di kelas dengan praktik nyata. Melalui perencanaan, pelaksanaan, dan evaluasi yang terstruktur, kami mendokumentasikan setiap tahapan kegiatan beserta bukti visualnya.\n\nLaporan ini merangkum tujuan, proses, hasil, dan refleksi dari kegiatan tersebut.";

const UNIVERSAL_CONCLUSION =
  "Kegiatan ini telah diselesaikan sesuai rencana dan tujuan pembelajaran. Melalui proses langsung, kami memahami materi lebih mendalam, terbiasa bekerja secara sistematis, dan belajar menyelesaikan kendala secara bertahap. Harapan ke depan, kompetensi yang diperoleh dapat terus diterapkan pada tugas berikutnya.";

function universalPoints(): SchoolPoint[] {
  return [
    {
      id: `up-1-${Date.now()}`,
      title: "Poin 1: Persiapan & Tujuan",
      text: "* **Tujuan**: Menjelaskan sasaran kegiatan dan kompetensi yang ingin dicapai.\n* **Alat & Bahan**: Menyiapkan perangkat, software, atau bahan yang dibutuhkan sebelum mulai.\n* **Rencana Kerja**: Membagi peran dan menyusun langkah kerja bersama tim.",
      images: [],
    },
    {
      id: `up-2-${Date.now()}`,
      title: "Poin 2: Pelaksanaan / Langkah Kerja",
      text: "* **Langkah Kerja**: Menjalankan tahapan kegiatan sesuai rencana dan panduan.\n* **Dokumentasi**: Mengambil foto pada setiap tahap penting sebagai bukti proses.",
      images: [],
    },
    {
      id: `up-3-${Date.now()}`,
      title: "Poin 3: Hasil & Pengujian",
      text: "* **Hasil**: Memeriksa hasil akhir kegiatan terhadap tujuan yang ditetapkan.\n* **Pengujian**: Melakukan uji sederhana untuk memastikan hasil berfungsi sebagaimana mestinya.",
      images: [],
    },
    {
      id: `up-4-${Date.now()}`,
      title: "Poin 4: Analisis & Refleksi",
      text: "* **Analisis**: Menilai keberhasilan kegiatan beserta kendala yang ditemui.\n* **Refleksi**: Menarik pelajaran dan perbaikan untuk kegiatan berikutnya.",
      images: [],
    },
  ];
}

const QUICK_PHRASES = [
  { label: "Pilih kalimat contoh siap pakai...", value: "" },
  {
    label: "[TKJ] Crimping kabel UTP T568B & tes 8 pin LAN tester",
    value:
      "* **Langkah Kerja**: Mengurutkan kabel sesuai standar T568B, meratakan ujung kabel, memasukkan ke konektor RJ-45, crimping kuat, dan verifikasi 8 pin menyala berurutan di LAN tester.",
  },
  {
    label: "[TKJ] Konfigurasi IP, Gateway & DHCP Server",
    value:
      "* **Konfigurasi**: Menetapkan IP address pada interface router, mengaktifkan DHCP server pool untuk klien, serta mengatur default gateway dan NAT masquerade.",
  },
  {
    label: "[TKJ] Pengujian ping reply 0% packet loss",
    value:
      "* **Hasil Pengujian**: Pengujian ping dan traceroute dari komputer klien menuju gateway dan jaringan internet berhasil reply dengan latensi rendah tanpa kendala packet loss.",
  },
  {
    label: "[Umum] Melaksanakan tugas tertib sesuai arahan guru",
    value:
      "* **Pelaksanaan**: Melaksanakan tugas observasi dan praktik secara tertib sesuai panduan lembar kerja guru pembimbing.",
  },
];

function autoDraftPointText(title: string): string {
  const t = (title || "").toLowerCase();

  if (t.includes("sila 1") || t.includes("pertama") || t.includes("ketuhanan") || t.includes("bintang")) {
    return "* **Simbol**: Bintang emas berlatar perisai hitam.\n* **Makna Nilai**: Mengakui keberadaan Tuhan Yang Maha Esa, menjunjung tinggi toleransi antarumat beragama, dan menjalankan perintah agama dengan ikhlas.\n* **Aksi Nyata di Sekolah**: Melaksanakan ibadah sholat berjamaah tepat waktu di mushola sekolah bersama teman-teman dan menjaga ketenangan saat ibadah berlangsung.";
  }

  if (t.includes("sila 2") || t.includes("kedua") || t.includes("kemanusiaan") || t.includes("rantai")) {
    return "* **Simbol**: Rantai emas dengan gelang lingkaran dan persegi.\n* **Makna Nilai**: Mengakui persamaan harkat dan martabat setiap individu tanpa diskriminasi, serta menumbuhkan empati dan tolong-menolong.\n* **Aksi Nyata di Sekolah**: Menumbuhkan rasa peduli dengan saling berbagi bekal makanan kepada teman sekelas dan memperlakukan sesama dengan santun.";
  }

  if (t.includes("sila 3") || t.includes("ketiga") || t.includes("persatuan") || t.includes("beringin")) {
    return "* **Simbol**: Pohon Beringin.\n* **Makna Nilai**: Menempatkan kesatuan dan keselamatan bersama di atas kepentingan pribadi, serta cinta tanah air dan produk buatan dalam negeri.\n* **Aksi Nyata di Sekolah**: Mendukung produk lokal di kantin sekolah dengan berbelanja secara tertib serta membaur tanpa membeda-bedakan pertemanan.";
  }

  if (t.includes("sila 4") || t.includes("keempat") || t.includes("kerakyatan") || t.includes("musyawarah") || t.includes("banteng")) {
    return "* **Simbol**: Kepala Banteng.\n* **Makna Nilai**: Mengutamakan musyawarah mufakat dalam mengambil keputusan bersama dan menghormati setiap perbedaan pandangan.\n* **Aksi Nyata di Sekolah**: Berdiskusi aktif dalam kerja kelompok di kelas, saling bertukar argumen secara demokratis, dan menerima hasil mufakat.";
  }

  if (t.includes("sila 5") || t.includes("kelima") || t.includes("keadilan") || t.includes("padi")) {
    return "* **Simbol**: Padi dan Kapas.\n* **Makna Nilai**: Mengembangkan perbuatan luhur yang mencerminkan sikap kekeluargaan, bersikap adil, dan menjaga keseimbangan hak dan kewajiban.\n* **Aksi Nyata di Sekolah**: Menjalankan pembagian tugas piket kebersihan kelas secara adil serta mendistribusikan konsumsi atau fasilitas kelas secara merata.";
  }

  if (t.includes("kabel") || t.includes("crimping") || t.includes("utp") || t.includes("rj45") || t.includes("rj-45")) {
    return "* **Langkah Kerja**: Mengupas jaket pelindung kabel UTP, menyusun urutan 8 pin warna sesuai standar T568B, meratakan ujung kabel, memasukkan ke konektor RJ-45, dan crimping kuat menggunakan tang crimping.\n* **Hasil Pengujian**: Pengujian dengan LAN tester membuktikan ke-8 pin LED menyala berurutan dari pin 1 sampai 8.\n* **Catatan**: Pastikan jaket kabel ikut terjepit di dalam bodi konektor agar sambungan tidak mudah goyang.";
  }

  if (t.includes("vlan") || t.includes("switch") || t.includes("trunk")) {
    return "* **Konfigurasi**: Membuat database VLAN ID pada switch manageable, mengatur port access untuk divisi komputer, dan menetapkan port uplink sebagai mode trunk.\n* **Hasil Pengujian**: Komputer di VLAN yang sama saling terhubung lancar, sedangkan komunikasi antar-VLAN berbeda tersekat aman sesuai aturan.";
  }

  if (t.includes("router") || t.includes("routing") || t.includes("mikrotik") || t.includes("gateway") || t.includes("ip")) {
    return "* **Konfigurasi**: Menetapkan alokasi IP address pada interface router, mengaktifkan DHCP server pool untuk klien, serta konfigurasi default gateway dan NAT masquerade.\n* **Hasil Pengujian**: Pengujian ping dan traceroute dari komputer klien menuju gateway dan jaringan internet berhasil reply tanpa packet loss.";
  }

  if (t.includes("server") || t.includes("linux") || t.includes("debian") || t.includes("web") || t.includes("dns")) {
    return "* **Implementasi**: Instalasi paket layanan server, pengaturan berkas konfigurasi sistem operasi Linux Debian, dan membuka port firewall yang relevan.\n* **Hasil Pengujian**: Layanan berhasil aktif (running) dan dapat diakses dari browser maupun terminal klien dengan status sukses.";
  }

  if (t.includes("alat") || t.includes("bahan") || t.includes("topologi") || t.includes("persiapan")) {
    return "* **Alat & Bahan**: Laptop/PC, kabel UTP, konektor RJ-45, tang crimping, LAN tester, switch, dan router.\n* **Rancangan Topologi**: Menggunakan topologi star untuk memudahkan pemantauan aliran data dan penanganan masalah jika terjadi gangguan.\n* **Standar Keselamatan**: Memastikan area kerja bersih dan kabel tertata rapi tidak melintang di lantai.";
  }

  if (t.includes("uji") || t.includes("test") || t.includes("verifikasi") || t.includes("evaluasi")) {
    return "* **Metode Pengujian**: Melakukan uji ping bertahap mulai dari localhost (127.0.0.1), gateway lokal, hingga domain internet publik.\n* **Hasil Verifikasi**: Seluruh paket data terkirim dengan 0% packet loss dan waktu latensi sangat stabil.\n* **Kesimpulan Uji**: Sistem berfungsi normal sesuai kriteria kelulusan praktikum.";
  }

  return `* **Makna / Tujuan**: Mempelajari dan mempraktikkan konsep ${title || "tahap ini"} secara mendalam dan terstruktur.\n* **Aksi Nyata di Sekolah**: Melaksanakan instruksi kerja bersama rekan tim dengan disiplin, teliti, dan bertanggung jawab.\n* **Hasil & Refleksi**: Dokumentasi foto membuktikan pencapaian kompetensi sesuai target penugasan yang diberikan.`;
}

function appendSnippet(current: string, snippet: string): string {
  if (!current || !current.trim()) return snippet;
  const trimmed = current.trimEnd();
  return `${trimmed}\n${snippet}`;
}

export function SchoolPointsEditor({
  intro,
  points,
  conclusion,
  media,
  onChange,
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

  const handleSmartAutoDraft = (index: number) => {
    const point = points[index];
    if (!point) return;
    const draft = autoDraftPointText(point.title);
    updatePoint(index, { text: draft });
  };

  const appendToPointText = (index: number, snippet: string) => {
    const point = points[index];
    if (!point) return;
    const nextText = appendSnippet(point.text, snippet);
    updatePoint(index, { text: nextText });
  };

  const generateUniversalTemplate = () => {
    onChange(UNIVERSAL_INTRO, universalPoints(), UNIVERSAL_CONCLUSION);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-on-accent font-bold">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addPoint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-accent px-3 py-1.5 text-xs font-bold text-on-accent transition-colors hover:bg-accent-hover"
            >
              <Plus size={14} />
              Tambah Poin
            </button>
          </div>
        </div>

        {/* TEMPLATE GENERATORS TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted">
            <Zap size={12} className="text-accent" />
            Mulai cepat:
          </span>
          <button
            type="button"
            onClick={generateUniversalTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-accent bg-accent/15 px-3 py-1 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-on-accent"
            title="Susun struktur tugas universal: latar belakang, 4 poin, kesimpulan"
          >
            <Zap size={12} />
            Struktur Tugas Universal (4 Poin)
          </button>
        </div>
      </div>

      {/* 1. LATAR BELAKANG */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="school-intro">
            Latar Belakang & Pendahuluan
          </Label>
          <span className="font-mono text-[11px] text-muted">
            Pengantar proyek & tujuan
          </span>
        </div>

        {/* INSPIRASI PENGANTAR (BANTU BUNTU NULIS) */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-surface-2/40 p-2.5">
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted">
            <Wand2 size={12} className="text-accent" />
            Buntu nulis pendahuluan? Klik inspirasi:
          </span>
          <button
            type="button"
            onClick={() => updateIntro(INTRO_PRESETS.teknis)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            Praktikum / Tugas Teknis
          </button>
          <button
            type="button"
            onClick={() => updateIntro(INTRO_PRESETS.observasi)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            Observasi / Proyek Kelompok
          </button>
          <button
            type="button"
            onClick={() =>
              updateIntro(
                appendSnippet(
                  intro,
                  "Tujuan dari proyek ini adalah mendokumentasikan proses, menguji pemahaman teori, dan membiasakan kerja tim secara terstruktur."
                )
              )
            }
            className="rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-medium text-muted hover:border-accent hover:text-foreground transition-colors"
          >
            + Tambah Tujuan Proyek
          </button>
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
            Tiap poin bisa dipasangi foto langsung & dibantu kalimatnya
          </span>
        </div>

        {points.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-2/30 p-8 text-center">
            <BookOpen size={32} className="mx-auto text-muted mb-2 opacity-50" />
            <p className="font-semibold text-foreground text-sm">
              Belum ada poin kegiatan yang dibuat
            </p>
            <p className="text-xs text-muted mt-1 max-w-md mx-auto">
              Klik salah satu template preset di atas atau tambah poin manual untuk mulai mengisi.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={generateUniversalTemplate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-on-accent"
              >
                <Sparkles size={14} />
                Susun Struktur Tugas Universal
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
              className="rounded-2xl border border-border bg-surface p-5 transition-all"
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
                    placeholder="misal: Sila Pertama: Ketuhanan Yang Maha Esa atau Crimping Kabel UTP"
                    className="w-full rounded-xl border border-border/80 bg-surface-2/40 px-3.5 py-2 text-sm font-semibold text-foreground outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15"
                  />
                </div>

                <div>
                  {/* WRITING ASSISTANT BOX: BANTU TULIS KALIMAT */}
                  <div className="mb-2 flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-accent">
                        <Wand2 size={13} />
                        Bantu Tulis Kalimat Poin #{ptIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSmartAutoDraft(ptIdx)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-bold text-on-accent transition-transform active:scale-95 hover:bg-accent-hover"
                        title="Tulis teks otomatis berdasarkan judul poin ini"
                      >
                        <Sparkles size={11} />
                        Tulis Otomatis Sesuai Judul
                      </button>
                    </div>

                    {/* STARTER CHIPS (TINGGAL ANU-ANU) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-accent/15">
                      <span className="text-[10px] font-bold text-muted">Format Poin:</span>
                      <button
                        type="button"
                        onClick={() => appendToPointText(ptIdx, "* **Makna Nilai**: ")}
                        className="rounded-md border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        + Makna Nilai
                      </button>
                      <button
                        type="button"
                        onClick={() => appendToPointText(ptIdx, "* **Aksi Nyata di Sekolah**: ")}
                        className="rounded-md border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        + Aksi Nyata
                      </button>
                      <button
                        type="button"
                        onClick={() => appendToPointText(ptIdx, "* **Langkah Kerja**: ")}
                        className="rounded-md border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        + Langkah Kerja
                      </button>
                      <button
                        type="button"
                        onClick={() => appendToPointText(ptIdx, "* **Hasil Pengujian**: ")}
                        className="rounded-md border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        + Hasil Pengujian
                      </button>
                      <button
                        type="button"
                        onClick={() => appendToPointText(ptIdx, "* **Kendala & Solusi**: ")}
                        className="rounded-md border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        + Kendala
                      </button>
                      <button
                        type="button"
                        onClick={() => appendToPointText(ptIdx, "* **Bukti Dokumentasi**: ")}
                        className="rounded-md border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        + Bukti Foto
                      </button>
                    </div>

                    {/* BANK KALIMAT CONTOH */}
                    <div className="flex items-center gap-2 pt-1 border-t border-accent/15">
                      <span className="text-[10px] font-bold text-muted flex-shrink-0">
                        Contoh Kalimat:
                      </span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            appendToPointText(ptIdx, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                        className="w-full rounded-md border border-border/80 bg-surface px-2 py-1 text-[11px] text-foreground outline-none focus:border-accent cursor-pointer"
                      >
                        {QUICK_PHRASES.map((qp, qpIdx) => (
                          <option key={qpIdx} value={qp.value}>
                            {qp.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Label>Penjelasan Materi / Aksi Nyata</Label>
                  <textarea
                    rows={4}
                    value={point.text}
                    onChange={(e) => updatePoint(ptIdx, { text: e.target.value })}
                    placeholder="Tuliskan makna nilai dan bukti aksi nyata di sekolah, atau klik tombol Bantu Tulis Kalimat di atas..."
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
                        ? "Tampil 2 kolom berdampingan"
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
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-xs font-bold text-muted transition-colors hover:border-accent hover:text-accent hover:bg-surface-2/40"
          >
            <Plus size={16} />
            Tambah Poin Pembahasan Baru
          </button>
        )}
      </div>

      {/* 3. KESIMPULAN & REFLEKSI */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="school-conclusion">
            Kesimpulan & Refleksi Akhir
          </Label>
          <span className="font-mono text-[11px] text-muted">
            Rangkuman penutup
          </span>
        </div>

        {/* INSPIRASI KESIMPULAN (BANTU BUNTU NULIS) */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-surface-2/40 p-2.5">
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted">
            <Wand2 size={12} className="text-accent" />
            Buntu nulis kesimpulan? Klik inspirasi:
          </span>
          <button
            type="button"
            onClick={() => updateConclusion(CONCLUSION_PRESETS.teknis)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            Evaluasi Teknis
          </button>
          <button
            type="button"
            onClick={() => updateConclusion(CONCLUSION_PRESETS.tim)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            Refleksi Kerjasama Tim
          </button>
          <button
            type="button"
            onClick={() =>
              updateConclusion(
                appendSnippet(
                  conclusion,
                  "Harapan ke depan, kebiasaan baik dan kompetensi yang telah dipelajari dalam proyek ini dapat terus diterapkan secara konsisten dalam kehidupan sehari-hari."
                )
              )
            }
            className="rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-medium text-muted hover:border-accent hover:text-foreground transition-colors"
          >
            + Harapan ke Depan
          </button>
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
