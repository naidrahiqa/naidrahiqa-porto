"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Wand2,
  Loader2,
  ExternalLink,
  Star,
  Eye,
  Columns2,
  PenSquare,
  Sparkles,
  Bold,
  Italic,
  Strikethrough,
  Code,
  FileCode,
  Quote,
  List,
  ListOrdered,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  HelpCircle,
  Check,
  Plus,
  BookOpen,
  FolderGit2,
  Layers,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  X,
} from "lucide-react";
import { slugify, resolveImageUrl } from "@/lib/utils";
import type { Project, ProjectMedia, ProjectLayout } from "@/lib/types";
import {
  isStructuredSchoolProject,
  type SchoolPoint,
  type SchoolPointImage,
} from "@/components/SchoolProjectView";
import { SchoolPointsEditor } from "@/components/admin/SchoolPointsEditor";
import {
  Button,
  Input,
  Label,
  TextArea,
} from "@/components/admin/ui";
import { FileUpload } from "@/components/admin/FileUpload";
import { VideoFields } from "@/components/admin/VideoFields";
import { MediaGallery, type MediaDraft } from "@/components/admin/MediaGallery";
import { LAYOUTS } from "@/components/admin/LayoutPreview";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useToast } from "@/components/admin/Toast";

const standardSubjectCatalog = [
  // Produktif TKJ / Jaringan
  { name: "ADMINISTRASI SISTEM JARINGAN", group: "produktif", hint: "ASJ" },
  { name: "ADMINISTRASI INFRASTRUKTUR JARINGAN", group: "produktif", hint: "AIJ" },
  { name: "TEKNOLOGI LAYANAN JARINGAN", group: "produktif", hint: "TLJ" },
  { name: "TEKNOLOGI JARINGAN KABEL & NIRKABEL", group: "produktif", hint: "TJKN" },
  { name: "KEAMANAN JARINGAN", group: "produktif", hint: "Security" },
  { name: "KOMPUTER & JARINGAN DASAR", group: "produktif", hint: "KJD" },
  { name: "SISTEM KOMPUTER", group: "produktif", hint: "SisKom" },
  { name: "PEMROGRAMAN DASAR", group: "produktif", hint: "PemDas" },
  { name: "PRODUK KREATIF & KEWIRAUSAHAAN", group: "produktif", hint: "PKK" },
  { name: "INFORMATIKA", group: "produktif", hint: "Informatika" },
  { name: "DESAIN GRAFIS", group: "produktif", hint: "Multimedia" },
  { name: "DASAR PROGRAM KEAHLIAN TJKT", group: "produktif", hint: "DPK TJKT" },
  { name: "CLOUD COMPUTING", group: "produktif", hint: "Cloud" },
  { name: "IOT & SISTEM TERTANAM", group: "produktif", hint: "IoT" },

  // Muatan Umum & Bahasa
  { name: "ENGLISH", group: "umum", hint: "Bahasa Inggris" },
  { name: "BAHASA INDONESIA", group: "umum", hint: "B. Indo" },
  { name: "MATEMATIKA", group: "umum", hint: "MTK" },
  { name: "SEJARAH INDONESIA", group: "umum", hint: "Sejarah" },
  { name: "PENDIDIKAN PANCASILA", group: "umum", hint: "PPKn" },
  { name: "PENDIDIKAN AGAMA ISLAM", group: "umum", hint: "PAI" },
  { name: "PROJEK IPAS", group: "umum", hint: "IPAS" },
  { name: "PJOK", group: "umum", hint: "Olahraga" },
  { name: "BAHASA JEPANG", group: "umum", hint: "Nihongo" },
  { name: "BAHASA JAWA", group: "umum", hint: "B. Jawa" },
  { name: "SENI BUDAYA", group: "umum", hint: "Seni" },
  { name: "BIMBINGAN KONSELING", group: "umum", hint: "BK" },
];

const languageSuggestions = [
  "C",
  "C++",
  "Python",
  "Shell",
  "TypeScript",
  "Go",
  "Kotlin",
  "Blade",
  "QML",
];

type StoryTemplate = {
  id: string;
  name: string;
  description: string;
  template: string;
};

const storyTemplates: StoryTemplate[] = [
  {
    id: "case-study",
    name: "Case Study (Default)",
    description: "Standard narrative: Overview, Highlights, Tech Stack, Challenges, and Results",
    template: `## Overview
A brief introduction to the project, its motivations, and what problem it solves.

## Key Highlights
- **Feature One**: Description of functionality.
- **Feature Two**: Description of functionality.
- **Feature Three**: Description of functionality.

## Architecture & Tech Stack
Explain the technical architecture, libraries used, and how everything connects.

\`\`\`bash
# Example build or setup command
\`\`\`

## Engineering Challenges & Solutions
What were the hardest bugs or constraints you ran into, and how did you resolve them?

## Outcomes & Future Work
What did you achieve, performance metrics, and what's next for this project.`,
  },
  {
    id: "kernel-devlog",
    name: "Kernel / Low-Level Devlog",
    description: "Hardware specs, kernel features, build commands, and flashing guide",
    template: `## Device Specifications
- **Target Device**: 
- **Chipset / SoC**: 
- **Android Version**: 
- **Kernel Version**: 
- **Toolchain**: Clang / GCC

## Modifications & Optimizations
- **CPU / GPU Governors**: Optimized frequencies and energy model.
- **Memory Management**: ZRAM and swap tuning.
- **Drivers & Patches**: Upstream backports and stability fixes.

## Building from Source
\`\`\`bash
# Clone the repository
git clone <repo_url> -b <branch> kernel
cd kernel

# Run build script
bash build.sh
\`\`\`

## Flashing Instructions
1. Boot into custom recovery (TWRP/OrangeFox).
2. Flash the AnyKernel3 zip.
3. Wipe cache and reboot to system.`,
  },
  {
    id: "iot-hardware",
    name: "Hardware & IoT Build Log",
    description: "Bill of materials, wiring pinout, firmware logic, and telemetry",
    template: `## Bill of Materials (BOM)
- **Microcontroller**: ESP32 / Arduino / RP2040
- **Sensors & Modules**: 
- **Power Supply**: 

## Wiring & Schematic
Explain the connections, GPIO pin assignments, and communication buses (I2C, SPI, UART).

## Firmware Implementation
Core sensor polling, power-saving sleep modes, and error recovery.

\`\`\`cpp
// Snippet of core logic
void setup() {
  // initialization
}
\`\`\`

## Telemetry & Cloud Integration
Data pipeline (MQTT, WebSockets, Supabase, Dashboard).`,
  },
  {
    id: "school-report",
    name: "School Lab Report (SMK)",
    description: "Tujuan praktikum, alat & bahan, langkah konfigurasi, hasil, dan kesimpulan",
    template: `## Tujuan Praktikum
Memahami konsep dasar dan implementasi teknis pada materi ini.

## Alat & Bahan
- Laptop / PC
- Software: Packet Tracer / VirtualBox / Terminal Linux

## Langkah Kerja
1. Buka software dan siapkan topologi.
2. Lakukan konfigurasi IP address dan interface.
3. Terapkan konfigurasi routing atau layanan.

## Hasil & Pengujian
Dokumentasi hasil verifikasi dan pengujian:

\`\`\`bash
ping -c 4 192.168.1.1
\`\`\`

## Kesimpulan
Rangkuman dari apa yang dipelajari dan hasil praktikum.`,
  },
];

export function ProjectForm({ initial }: { initial?: Project | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(initial);
  const isDirty = useRef(false);
  const markDirty = useCallback(() => {
    isDirty.current = true;
  }, []);

  const [activeTab, setActiveTab] = useState<"story" | "details" | "media">("story");
  const [editorMode, setEditorMode] = useState<"write" | "split" | "preview">("write");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [category, setCategory] = useState<"school" | "personal">(
    initial?.category ?? "school"
  );
  const [layout, setLayout] = useState<ProjectLayout>(
    initial?.layout ?? "text-first"
  );
  const [classLevel, setClassLevel] = useState(initial?.class_level ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(
    initial?.cover_image ?? null
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(
    initial?.video_url ?? null
  );
  const [videoType, setVideoType] = useState<string>(
    initial?.video_type ?? "none"
  );
  const [link, setLink] = useState(initial?.link ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [media, setMedia] = useState<MediaDraft[]>([]);
  const [mediaLoaded, setMediaLoaded] = useState(!initial);
  const [mediaLoading, setMediaLoading] = useState(!!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingSubjects, setExistingSubjects] = useState<string[]>([]);
  const [subjectTab, setSubjectTab] = useState<"all" | "produktif" | "umum">("all");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [newSubjectInput, setNewSubjectInput] = useState("");

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMarkdownCheat, setShowMarkdownCheat] = useState(false);
  const [showMediaTray, setShowMediaTray] = useState(true);

  const [contentFormat, setContentFormat] = useState<"points" | "markdown">(() => {
    if (initial?.content && isStructuredSchoolProject(initial.content)) return "points";
    if (initial?.category === "school") return "points";
    return "markdown";
  });

  const [schoolIntro, setSchoolIntro] = useState(() => {
    const parsed = isStructuredSchoolProject(initial?.content);
    return parsed?.intro || "";
  });

  const [schoolPoints, setSchoolPoints] = useState<SchoolPoint[]>(() => {
    const parsed = isStructuredSchoolProject(initial?.content);
    return parsed?.points || [];
  });

  const [schoolConclusion, setSchoolConclusion] = useState(() => {
    const parsed = isStructuredSchoolProject(initial?.content);
    return parsed?.conclusion || "";
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncPointsToContent = useCallback(
    (intro: string, pts: SchoolPoint[], conc: string) => {
      markDirty();
      const payload = JSON.stringify(
        {
          type: "school_project",
          intro,
          points: pts,
          conclusion: conc,
        },
        null,
        2
      );
      setContent(payload);
    },
    [markDirty]
  );

  const addSchoolPoint = () => {
    const nextIdx = schoolPoints.length + 1;
    const newPoint: SchoolPoint = {
      id: `point-${Date.now()}`,
      title: `Poin #${nextIdx}`,
      text: "",
      images: [],
    };
    const nextPts = [...schoolPoints, newPoint];
    setSchoolPoints(nextPts);
    syncPointsToContent(schoolIntro, nextPts, schoolConclusion);
    toast("success", `Poin #${nextIdx} ditambahkan!`);
  };

  const updateSchoolPoint = (index: number, patch: Partial<SchoolPoint>) => {
    const nextPts = schoolPoints.map((pt, i) => (i === index ? { ...pt, ...patch } : pt));
    setSchoolPoints(nextPts);
    syncPointsToContent(schoolIntro, nextPts, schoolConclusion);
  };

  const removeSchoolPoint = (index: number) => {
    const nextPts = schoolPoints.filter((_, i) => i !== index);
    setSchoolPoints(nextPts);
    syncPointsToContent(schoolIntro, nextPts, schoolConclusion);
    toast("success", "Poin dihapus.");
  };

  const moveSchoolPoint = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= schoolPoints.length) return;
    const nextPts = [...schoolPoints];
    [nextPts[index], nextPts[target]] = [nextPts[target], nextPts[index]];
    setSchoolPoints(nextPts);
    syncPointsToContent(schoolIntro, nextPts, schoolConclusion);
  };

  const attachImageToPoint = (pointIndex: number, img: SchoolPointImage) => {
    const point = schoolPoints[pointIndex];
    if (!point) return;
    const nextImages = [...(point.images || []), img];
    updateSchoolPoint(pointIndex, { images: nextImages });
    toast("success", `Foto ditambahkan ke ${point.title || `Poin #${pointIndex + 1}`}`);
  };

  const removeImageFromPoint = (pointIndex: number, imgIndex: number) => {
    const point = schoolPoints[pointIndex];
    if (!point) return;
    const nextImages = point.images.filter((_, i) => i !== imgIndex);
    updateSchoolPoint(pointIndex, { images: nextImages });
  };

  const updatePointImageCaption = (pointIndex: number, imgIndex: number, caption: string) => {
    const point = schoolPoints[pointIndex];
    if (!point) return;
    const nextImages = point.images.map((img, i) => (i === imgIndex ? { ...img, caption } : img));
    updateSchoolPoint(pointIndex, { images: nextImages });
  };

  const generatePancasilaTemplate = () => {
    const intro =
      "Pancasila bukan sekadar dasar falsafah negara yang dihafal bunyinya, melainkan pedoman moral dan etika bertindak yang harus diwujudkan dalam kehidupan nyata. Sebagai siswa kejuruan di SMK Negeri 3 Jepara, penerapan nilai-nilai Pancasila menjadi fondasi penting dalam membentuk karakter kedisiplinan, solidaritas, kepedulian sosial, serta integritas moral.\n\nMelalui tugas proyek mata pelajaran Pendidikan Pancasila ini, kami mendokumentasikan aksi konkret penerapan kelima sila Pancasila yang berlangsung di lingkungan sekolah dan ruang kelas kami sehari-hari.";

    const pts: SchoolPoint[] = [
      {
        id: "sila-1",
        title: "Sila Pertama: Ketuhanan Yang Maha Esa",
        text: "* **Simbol**: Bintang emas berlatar perisai hitam.\n* **Makna Nilai**: Mengakui keberadaan Tuhan Yang Maha Esa, menjunjung tinggi toleransi antarumat beragama, dan menjalankan perintah agama dengan ikhlas dan penuh kedisiplinan.\n* **Aksi Nyata di Sekolah**: Mendengarkan khutbah sholat Jumat dengan khusyuk, tenang, dan tertib di mushola sekolah bersama teman-teman, menjaga adab dengan tidak berbicara saat khatib menyampaikan khutbah sebagai wujud ketaatan beribadah kepada Tuhan Yang Maha Esa.",
        images: [
          {
            url: media[0]?.url || "https://lh3.googleusercontent.com/d/1BzzjvkPjHUi-abyuZTOSGV5bLsouRj5P=s0",
            caption: "Simbol Sila ke-1: Bintang (Ketuhanan Yang Maha Esa)",
          },
          {
            url: media[1]?.url || "https://lh3.googleusercontent.com/d/1_0GQozFV4Xs5FzfgyKYXJbl9427WOi0e=s0",
            caption: "Penerapan Sila ke-1: Mendengarkan khutbah sholat Jumat dengan khusyuk di mushola sekolah",
          },
        ],
      },
      {
        id: "sila-2",
        title: "Sila Kedua: Kemanusiaan yang Adil dan Beradab",
        text: "* **Simbol**: Rantai emas dengan gelang lingkaran dan persegi.\n* **Makna Nilai**: Mengakui persamaan harkat dan martabat setiap individu tanpa diskriminasi, serta menumbuhkan empati dan tolong-menolong.\n* **Aksi Nyata di Sekolah**: Menumbuhkan rasa peduli dengan saling berbagi bekal makanan kepada teman sekelas dan memperlakukan sesama dengan santun.",
        images: [
          {
            url: media[2]?.url || "https://lh3.googleusercontent.com/d/18ZTkSHRKRB_HXGNUAr81KgT7_-YIWztN=s0",
            caption: "Simbol Sila ke-2: Rantai (Kemanusiaan yang Adil dan Beradab)",
          },
          {
            url: media[3]?.url || "https://lh3.googleusercontent.com/d/1yVOcV1uuGRBMOX3DBGpYsSn47noLvWyr=s0",
            caption: "Penerapan Sila ke-2: Berbagi makanan dengan teman sekelas",
          },
        ],
      },
      {
        id: "sila-3",
        title: "Sila Ketiga: Persatuan Indonesia",
        text: "* **Simbol**: Pohon Beringin.\n* **Makna Nilai**: Menempatkan kesatuan dan keselamatan bersama di atas kepentingan pribadi, serta cinta tanah air dan produk buatan dalam negeri.\n* **Aksi Nyata di Sekolah**: Mendukung produk lokal dan kantin sekolah dengan berbelanja secara tertib serta membaur tanpa membeda-bedakan pertemanan.",
        images: [
          {
            url: media[4]?.url || "https://lh3.googleusercontent.com/d/1fwDxo5rz5efIyejXIoZcn_UNpndCGF8o=s0",
            caption: "Simbol Sila ke-3: Pohon Beringin (Persatuan Indonesia)",
          },
          {
            url: media[5]?.url || "https://lh3.googleusercontent.com/d/1SYtW89NFwM6hwgZhfGPGApH6acnUppPf=s0",
            caption: "Penerapan Sila ke-3: Mendukung produk lokal di kantin sekolah",
          },
        ],
      },
      {
        id: "sila-4",
        title: "Sila Keempat: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan",
        text: "* **Simbol**: Kepala Banteng.\n* **Makna Nilai**: Mengutamakan musyawarah mufakat dalam mengambil keputusan bersama dan menghormati setiap perbedaan pandangan.\n* **Aksi Nyata di Sekolah**: Berdiskusi aktif dalam kerja kelompok di kelas, saling bertukar argumen secara demokratis, dan menerima hasil mufakat.",
        images: [
          {
            url: media[6]?.url || "https://lh3.googleusercontent.com/d/1ASfipttavPp9SgactCdfWi-D-ca2KUAZ=s0",
            caption: "Simbol Sila ke-4: Kepala Banteng (Permusyawaratan/Perwakilan)",
          },
          {
            url: media[7]?.url || "https://lh3.googleusercontent.com/d/1lx2bW4Rc5bzxEe3kiK9Hs7YY7qvD_mes=s0",
            caption: "Penerapan Sila ke-4: Diskusi dan musyawarah tugas kelompok di kelas",
          },
        ],
      },
      {
        id: "sila-5",
        title: "Sila Kelima: Keadilan Sosial bagi Seluruh Rakyat Indonesia",
        text: "* **Simbol**: Padi dan Kapas.\n* **Makna Nilai**: Mengembangkan sikap adil terhadap sesama, menjaga keseimbangan antara hak dan kewajiban, serta menghormati hak orang lain demi mewujudkan kesejahteraan dan keadilan sosial yang merata.\n* **Aksi Nyata di Sekolah**: Pembagian dan pendistribusian makanan Program Makan Bergizi Gratis (MBG) secara tertib dan merata kepada seluruh siswa di kelas menggunakan wadah omprengan stainless steel, memastikan setiap teman memperoleh hak porsi makanan sehat dan bergizi yang sama tanpa ada yang terlewatkan.",
        images: [
          {
            url: media[8]?.url || "https://lh3.googleusercontent.com/d/1E1W3W0SYs95oXRLTGrO4LTrruxDeJTQK=s0",
            caption: "Simbol Sila ke-5: Padi dan Kapas (Keadilan Sosial)",
          },
          {
            url: media[9]?.url || "https://lh3.googleusercontent.com/d/17BeH00qmGdqIDDoDR9991rKANoxHBV3I=s0",
            caption: "Penerapan Sila ke-5: Pembagian makanan Program Makan Bergizi Gratis (MBG) secara adil dan merata di kelas",
          },
        ],
      },
    ];

    const conc =
      "Praktik pengamalan Pancasila tidak harus menunggu momen kenegaraan yang besar. Dari hal-hal sederhana di sekolah - mulai dari menjaga sholat berjamaah di mushola, kepedulian berbagi bekal, mendukung produk lokal di kantin, bermusyawarah di bangku kelas, hingga pembagian porsi Makan Bergizi Gratis (MBG) secara adil dan merata - nilai luhur Pancasila telah hidup dan terjaga dalam kebiasaan kita sehari-hari.";

    setSchoolIntro(intro);
    setSchoolPoints(pts);
    setSchoolConclusion(conc);
    syncPointsToContent(intro, pts, conc);
    toast("success", "Berhasil menyusun 5 Sila beserta 10 foto media!");
  };

  const handleSwitchContentFormat = (newFormat: "points" | "markdown") => {
    if (newFormat === contentFormat) return;
    if (newFormat === "markdown") {
      if (schoolPoints.length > 0) {
        let md = "";
        if (schoolIntro.trim()) {
          md += `## Latar Belakang\n\n${schoolIntro.trim()}\n\n---\n\n`;
        }
        md += `## Pembahasan & Dokumentasi\n\n`;
        schoolPoints.forEach((pt, idx) => {
          md += `### ${pt.title || `Poin #${idx + 1}`}\n\n`;
          if (pt.text.trim()) {
            md += `${pt.text.trim()}\n\n`;
          }
          if (pt.images && pt.images.length > 0) {
            pt.images.forEach((img) => {
              md += `![${img.caption || pt.title || "foto"}](${img.url})\n`;
            });
            md += "\n";
          }
          md += "---\n\n";
        });
        if (schoolConclusion.trim()) {
          md += `## Kesimpulan & Refleksi\n\n${schoolConclusion.trim()}\n`;
        }
        setContent(md);
      }
      setContentFormat("markdown");
      toast("success", "Beralih ke Mode Markdown Bebas.");
    } else {
      const parsed = isStructuredSchoolProject(content);
      if (parsed) {
        setSchoolIntro(parsed.intro || "");
        setSchoolPoints(parsed.points || []);
        setSchoolConclusion(parsed.conclusion || "");
      }
      setContentFormat("points");
      toast("success", "Beralih ke Mode Poin & Foto.");
    }
  };

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const set = new Set<string>();
          for (const p of data) {
            if (p.category === "school" && p.subject && p.subject.trim()) {
              set.add(p.subject.trim());
            }
          }
          if (initial?.subject && initial.subject.trim()) {
            set.add(initial.subject.trim());
          }
          setExistingSubjects(Array.from(set).sort());
        }
      })
      .catch(() => {});
  }, [initial?.subject]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleSelectOrAddSubject = useCallback(
    (subjectName: string) => {
      const clean = subjectName.trim().toUpperCase();
      if (!clean) return;
      setExistingSubjects((prev) =>
        prev.includes(clean) ? prev : [...prev, clean].sort()
      );
      setSubject(clean);
      markDirty();
    },
    [markDirty]
  );

  const handleAddNewCustomSubject = useCallback(() => {
    const candidate = newSubjectInput.trim();
    if (!candidate) return;
    const formatted = candidate.toUpperCase();
    handleSelectOrAddSubject(formatted);
    setNewSubjectInput("");
    toast("success", `Mapel "${formatted}" dipilih! Simpan proyek untuk menyimpannya ke database.`);
  }, [newSubjectInput, handleSelectOrAddSubject, toast]);

  useEffect(() => {
    if (!initial) return;
    fetch(`/api/admin/projects/${initial.id}/media`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load media");
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
        setError("Failed to load existing media. Save without changing media to avoid data loss.");
      })
      .finally(() => setMediaLoading(false));
  }, [initial]);

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = "", placeholder: string = "") => {
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

  const applyTemplate = (tmpl: StoryTemplate) => {
    markDirty();
    if (content.trim().length > 0) {
      const confirmReplace = window.confirm(
        "Current content is not empty. Click OK to append this template to the end, or Cancel to abort."
      );
      if (!confirmReplace) return;
      setContent((prev) => prev + "\n\n" + tmpl.template);
    } else {
      setContent(tmpl.template);
    }
    setShowTemplateModal(false);
    toast("success", `Applied ${tmpl.name}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      insertMarkdown("  ");
    }
  };

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (isEdit && !mediaLoaded) {
      setError("Media not loaded yet. Wait for it to load before saving.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      title,
      slug,
      category,
      layout,
      class_level: category === "school" ? classLevel : "",
      subject: category === "school" ? subject : "",
      language: category === "personal" ? language : "",
      description,
      content,
      cover_image: coverImage,
      video_url: videoUrl,
      video_type: videoType,
      link: link || null,
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
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      const projectId = isEdit ? initial!.id : data.id;

      const mediaRes = await fetch(`/api/admin/projects/${projectId}/media`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: media }),
      });
      if (!mediaRes.ok) {
        const mdata = await mediaRes.json().catch(() => ({}));
        throw new Error(mdata.error ?? "Failed to save media");
      }

      isDirty.current = false;
      toast("success", isEdit ? "Project updated" : "Project created");
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <form onSubmit={handleSubmit} onChange={markDirty} className="flex flex-col gap-6">
      {/* TOP STICKY ACTION BAR */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-foreground bg-surface p-3.5 hard-shadow backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-display text-sm font-bold uppercase tracking-tight text-foreground truncate max-w-[200px] sm:max-w-[320px]">
            {title ? title : isEdit ? "Editing Project" : "New Project Studio"}
          </span>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => {
                setPublished(e.target.checked);
                markDirty();
              }}
              className="h-3.5 w-3.5 accent-accent"
            />
            <span className={published ? "font-semibold text-accent" : "text-muted"}>
              {published ? "Published" : "Hidden"}
            </span>
          </label>

          <button
            type="button"
            onClick={() => {
              setFeatured(!featured);
              markDirty();
            }}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              featured
                ? "border-amber-400/50 bg-amber-400/10 font-bold text-amber-400"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            <Star size={13} className={featured ? "fill-amber-400" : ""} />
            {featured ? "Featured" : "Not Featured"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isEdit && slug && (
            <Link
              href={`/projects/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-accent"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View Live</span>
            </Link>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (isDirty.current && !window.confirm("Discard unsaved changes?")) return;
              router.push("/admin/projects");
            }}
            className="px-3 py-1.5 text-xs"
          >
            Cancel
          </Button>

          <Button type="submit" disabled={saving} className="px-4 py-1.5 text-xs font-bold">
            {saving ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" />
                Saving...
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Publish Project"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* STUDIO NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("story")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            activeTab === "story"
              ? "bg-accent text-on-accent hard-shadow-sm"
              : "bg-surface-2/60 text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <PenSquare size={16} />
          Story & Content
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            activeTab === "details"
              ? "bg-accent text-on-accent hard-shadow-sm"
              : "bg-surface-2/60 text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Layers size={16} />
          Project Details & Layout
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            activeTab === "media"
              ? "bg-accent text-on-accent hard-shadow-sm"
              : "bg-surface-2/60 text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <ImageIcon size={16} />
          Media & Gallery
          {media.length > 0 && (
            <span className="ml-1 rounded-full bg-surface/30 px-2 py-0.5 text-[11px] font-mono">
              {media.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: STORY & CONTENT */}
      {activeTab === "story" && (
        <div className="flex flex-col gap-6">
          {/* TITLE & SLUG CARD */}
          <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTitle(newTitle);
                    if (!isSlugCustom && (!isEdit || !slug)) {
                      setSlug(slugify(newTitle));
                    }
                    markDirty();
                  }}
                  placeholder="e.g. Android Kernel Development for Redmi 10 (selene)"
                  className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-lg font-bold text-foreground placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15 sm:text-xl"
                />
              </div>

              {/* SLUG ROW */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-surface-2/30 px-3.5 py-2">
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted">
                  <span className="text-muted/60">/projects/</span>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsSlugCustom(true);
                      markDirty();
                    }}
                    placeholder="my-project-slug"
                    className="min-w-[140px] rounded border border-border/60 bg-surface px-2 py-0.5 text-xs text-accent outline-none focus:border-accent"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSlug(slugify(title));
                    setIsSlugCustom(false);
                    markDirty();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition-colors hover:underline"
                >
                  <Wand2 size={12} />
                  generate from title
                </button>
              </div>

              {/* DESCRIPTION / EXCERPT */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="description">Short Summary (Card Preview & SEO)</Label>
                  <span
                    className={`text-[11px] font-mono ${
                      description.length > 180 ? "text-amber-400" : "text-muted"
                    }`}
                  >
                    {description.length} / 180 chars
                  </span>
                </div>
                <TextArea
                  id="description"
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    markDirty();
                  }}
                  placeholder="Brief 1-2 sentence hook explaining what you built and why it matters..."
                  className="text-sm"
                />
                <p className="mt-1 text-[11px] text-muted">
                  This summary appears on homepage cards, project grid, and search snippets.
                </p>
              </div>
            </div>
          </div>

          {/* FORMAT SWITCHER: POIN SEKOLAH vs MARKDOWN BEBAS */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-xl border-2 border-foreground bg-surface p-1 hard-shadow-sm">
              <button
                type="button"
                onClick={() => handleSwitchContentFormat("points")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  contentFormat === "points"
                    ? "bg-accent text-on-accent hard-shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <BookOpen size={13} />
                Mode Poin & Foto (Tugas Sekolah)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchContentFormat("markdown")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  contentFormat === "markdown"
                    ? "bg-accent text-on-accent hard-shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <FileCode size={13} />
                Mode Markdown Bebas
              </button>
            </div>

            {contentFormat === "points" && (
              <span className="font-mono text-[11px] text-muted">
                {schoolPoints.length} Poin tersusun
              </span>
            )}
          </div>

          {contentFormat === "points" ? (
            <SchoolPointsEditor
              intro={schoolIntro}
              points={schoolPoints}
              conclusion={schoolConclusion}
              media={media}
              onChange={(newIntro, newPts, newConc) => {
                setSchoolIntro(newIntro);
                setSchoolPoints(newPts);
                setSchoolConclusion(newConc);
                syncPointsToContent(newIntro, newPts, newConc);
              }}
              onGeneratePancasila={generatePancasilaTemplate}
            />
          ) : (
            /* MARKDOWN STORY STUDIO */
            <div className="rounded-2xl border-2 border-foreground bg-surface hard-shadow overflow-hidden">
            {/* STUDIO HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground bg-surface-2/80 p-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                  Story & Documentation
                </span>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
                  Markdown
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* STORY TEMPLATES DROPDOWN BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Sparkles size={13} className="text-accent" />
                  Insert Story Template
                </button>

                {/* VIEW MODE TOGGLE */}
                <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditorMode("write")}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      editorMode === "write"
                        ? "bg-accent text-on-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <PenSquare size={13} />
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("split")}
                    className={`hidden sm:inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      editorMode === "split"
                        ? "bg-accent text-on-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Columns2 size={13} />
                    Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      editorMode === "preview"
                        ? "bg-accent text-on-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Eye size={13} />
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {/* FORMATTING TOOLBAR */}
            {editorMode !== "preview" && (
              <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-2/40 px-3 py-2 text-xs">
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ", "\n", "Heading 2")}
                  title="Heading 2"
                  className="rounded p-1.5 font-bold hover:bg-surface-2 hover:text-accent"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ", "\n", "Heading 3")}
                  title="Heading 3"
                  className="rounded p-1.5 font-bold hover:bg-surface-2 hover:text-accent"
                >
                  H3
                </button>
                <div className="mx-1 h-4 w-px bg-border" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**", "bold text")}
                  title="Bold"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*", "italic text")}
                  title="Italic"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("~~", "~~", "strikethrough")}
                  title="Strikethrough"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <Strikethrough size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("`", "`", "code")}
                  title="Inline Code"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <Code size={14} />
                </button>
                <div className="mx-1 h-4 w-px bg-border" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("```bash\n", "\n```\n", "# command here")}
                  title="Code Block"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <FileCode size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("> ", "\n", "Quote or key point")}
                  title="Blockquote"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <Quote size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ", "\n", "List item")}
                  title="Bullet List"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("1. ", "\n", "First item")}
                  title="Numbered List"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <ListOrdered size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertMarkdown(
                      "| Item | Description | Status |\n| :--- | :--- | :--- |\n| Feature A | Details | Active |\n",
                      "",
                      ""
                    )
                  }
                  title="Table"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <TableIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](https://example.com)", "link text")}
                  title="Insert Link"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <LinkIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertMarkdown("![", "](https://example.com/image.png)", "Image caption")
                  }
                  title="Insert Image"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <ImageIcon size={14} />
                </button>
                {media.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowMediaTray(!showMediaTray)}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                      showMediaTray
                        ? "bg-accent text-on-accent"
                        : "bg-surface-2 text-foreground hover:bg-surface-2/80"
                    }`}
                    title="Toggle Project Media Tray"
                  >
                    <ImageIcon size={12} />
                    <span>Photos ({media.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n---\n\n", "", "")}
                  title="Horizontal Divider"
                  className="rounded p-1.5 hover:bg-surface-2 hover:text-accent"
                >
                  <Minus size={14} />
                </button>
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowMarkdownCheat(!showMarkdownCheat)}
                    className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-accent"
                  >
                    <HelpCircle size={13} />
                    Syntax Help
                  </button>
                </div>
              </div>
            )}

            {/* SYNTAX CHEATSHEET ACCORDION */}
            {showMarkdownCheat && (
              <div className="border-b border-border bg-surface-2/60 p-4 text-xs text-muted">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="font-bold text-foreground mb-1">Headers & Text</p>
                    <p className="font-mono text-[11px] text-accent"># H1, ## H2, ### H3</p>
                    <p className="font-mono text-[11px] text-accent">**bold**, *italic*, ~~strike~~</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground mb-1">Code & Blocks</p>
                    <p className="font-mono text-[11px] text-accent">`inline code`</p>
                    <p className="font-mono text-[11px] text-accent">```lang ... ```</p>
                    <p className="font-mono text-[11px] text-accent">&gt; blockquote</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground mb-1">Lists & Links</p>
                    <p className="font-mono text-[11px] text-accent">- list item, 1. numbered</p>
                    <p className="font-mono text-[11px] text-accent">[title](https://url)</p>
                    <p className="font-mono text-[11px] text-accent">![caption](img_url)</p>
                  </div>
                </div>
              </div>
            )}

            {/* PROJECT MEDIA QUICK-INSERT TRAY */}
            {media.length > 0 && showMediaTray && (
              <div className="border-b border-border bg-surface-2/60 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Foto & Media Proyek ({media.length})
                    </span>
                    <span className="text-[11px] text-muted">
                      Klik foto untuk menyisipkan langsung di kursor teks
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted">
                    Tips: 2 gambar berurutan otomatis jadi grid 2-kolom
                  </span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {media.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const caption = item.caption || `Foto #${idx + 1}`;
                        insertMarkdown(`![${caption}](${item.url})\n\n`);
                        toast("success", `Disisipkan Media #${idx + 1} ke teks!`);
                      }}
                      className="group relative flex flex-shrink-0 items-center gap-2 rounded-xl border border-border bg-surface p-1.5 text-left transition-all hover:border-accent hover:shadow-sm"
                      title={`Klik untuk menyisipkan #${idx + 1}: ${item.caption || item.url}`}
                    >
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-border/60 bg-surface-2">
                        {item.url ? (
                          <img
                            src={resolveImageUrl(item.url)}
                            alt={item.caption || `Media ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-muted">
                            #{idx + 1}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 rounded-tl bg-background/90 px-1 font-mono text-[9px] text-foreground">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="max-w-[130px] pr-1.5">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {item.caption || `Foto #${idx + 1}`}
                        </p>
                        <p className="font-medium text-[11px] text-accent group-hover:underline">
                          + Sisipkan
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EDITOR WORKSPACE */}
            <div className="p-4">
              {editorMode === "write" && (
                <textarea
                  ref={textareaRef}
                  id="content"
                  rows={20}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    markDirty();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell the story of this project in markdown... (Ctrl+S to save, Tab to indent)"
                  className="w-full rounded-xl border border-border/80 bg-surface-2/40 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15"
                />
              )}

              {editorMode === "split" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-muted uppercase">Editor</span>
                    <textarea
                      ref={textareaRef}
                      id="content"
                      rows={20}
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        markDirty();
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Write markdown here..."
                      className="h-[520px] w-full rounded-xl border border-border/80 bg-surface-2/40 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:bg-surface-2 focus:ring-2 focus:ring-accent/15"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-accent uppercase">Live Output</span>
                    <div className="h-[520px] overflow-y-auto rounded-xl border border-border/80 bg-surface-2/20 p-5">
                      {content.trim() ? (
                        <MarkdownContent content={content} />
                      ) : (
                        <p className="text-sm italic text-muted">
                          Your live preview will render here as you write.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {editorMode === "preview" && (
                <div className="min-h-[460px] rounded-xl border border-border/80 bg-surface-2/20 p-6 sm:p-8">
                  {content.trim() ? (
                    <MarkdownContent content={content} />
                  ) : (
                    <div className="flex h-64 flex-col items-center justify-center text-center text-muted">
                      <BookOpen size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-semibold">No content written yet</p>
                      <p className="mt-1 text-xs">Switch to Write mode to craft your project story.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STUDIO FOOTER STATS */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-2/40 px-4 py-2.5 text-xs text-muted font-mono">
              <div className="flex items-center gap-4">
                <span>{wordCount} words</span>
                <span>{content.length} characters</span>
                <span className="text-accent">~{readTimeMinutes} min read</span>
              </div>
              <div className="text-[11px]">
                Tip: Press <kbd className="rounded bg-surface px-1.5 py-0.5 border border-border">Ctrl+S</kbd> to quick save
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECT DETAILS & LAYOUT */}
      {activeTab === "details" && (
        <div className="flex flex-col gap-6">
          {/* CATEGORY SELECTOR */}
          <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight text-foreground mb-3">
              Classification
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setCategory("personal");
                  markDirty();
                }}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  category === "personal"
                    ? "border-accent bg-accent/10 hard-shadow-sm"
                    : "border-border bg-surface-2/30 hover:border-border-hover"
                }`}
              >
                <div
                  className={`rounded-lg p-2 ${
                    category === "personal" ? "bg-accent text-on-accent" : "bg-surface text-muted"
                  }`}
                >
                  <FolderGit2 size={20} />
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase text-foreground">
                    Personal Project
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Custom kernels, Linux tools, IoT builds, cybersecurity research, and open-source repos.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("school");
                  markDirty();
                }}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  category === "school"
                    ? "border-accent bg-accent/10 hard-shadow-sm"
                    : "border-border bg-surface-2/30 hover:border-border-hover"
                }`}
              >
                <div
                  className={`rounded-lg p-2 ${
                    category === "school" ? "bg-accent text-on-accent" : "bg-surface text-muted"
                  }`}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase text-foreground">
                    School Assignment (SMK)
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Praktikum jaringan, jobsheets, materi kelas X, XI, atau XII TKJ.
                  </p>
                </div>
              </button>
            </div>

            {/* CONDITIONAL DETAILS FOR SCHOOL */}
            {category === "school" && (
              <div className="mt-5 flex flex-col gap-5 border-t border-border pt-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Class Level *</Label>
                    <div className="flex gap-2">
                      {["x", "xi", "xii"].map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => {
                            setClassLevel(cls);
                            markDirty();
                          }}
                          className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold uppercase transition-all ${
                            classLevel === cls
                              ? "border-accent bg-accent text-on-accent"
                              : "border-border bg-surface-2/50 text-muted hover:text-foreground"
                          }`}
                        >
                          Kelas {cls.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="subject">Subject / Mapel</Label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSubject(subject.toUpperCase());
                            markDirty();
                          }}
                          className="rounded border border-border/70 bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-muted hover:text-accent hover:border-accent"
                          title="Format huruf kapital semua"
                        >
                          ALL CAPS
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tc = subject
                              .toLowerCase()
                              .split(" ")
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ");
                            setSubject(tc);
                            markDirty();
                          }}
                          className="rounded border border-border/70 bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-muted hover:text-accent hover:border-accent"
                          title="Format Title Case"
                        >
                          Title Case
                        </button>
                        {subject && (
                          <button
                            type="button"
                            onClick={() => {
                              setSubject("");
                              markDirty();
                            }}
                            className="rounded border border-border/70 bg-surface-2 px-1.5 py-0.5 text-[10px] text-danger hover:bg-danger/10"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    <Input
                      id="subject"
                      list="subject-datalist"
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        markDirty();
                      }}
                      placeholder="e.g. ADMINISTRASI SISTEM JARINGAN"
                      className="font-semibold text-foreground"
                    />
                    {subject.trim() && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        <span className="text-muted">Status:</span>
                        {existingSubjects.includes(subject.trim().toUpperCase()) ? (
                          <span className="inline-flex items-center gap-1 font-medium text-accent">
                            <Check size={12} /> Mapel sudah ada di daftar database
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-success">
                            ✨ Mapel baru (otomatis tersimpan ke DB saat proyek disimpan)
                          </span>
                        )}
                      </div>
                    )}
                    <datalist id="subject-datalist">
                      {existingSubjects.map((s) => (
                        <option key={s} value={s} />
                      ))}
                      {standardSubjectCatalog.map((s) => (
                        <option key={s.name} value={s.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* SECTION 1: Mapel Yang Sudah Pernah Digunakan di Database */}
                <div className="rounded-xl border border-accent/40 bg-accent/5 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-accent">
                      <span>📌</span>
                      Mapel di Database Kamu ({existingSubjects.length})
                    </span>
                    <span className="text-[11px] text-muted">
                      Klik pill untuk memilih persis
                    </span>
                  </div>

                  <p className="mb-2.5 text-[11px] leading-relaxed text-muted">
                    Portofolio kamu bebas dan dinamis. Kamu tidak dibatasi daftar ini. Cukup ketik mapel baru apa saja di bawah atau di input atas, mapel akan otomatis tersimpan permanen di database saat proyek disimpan.
                  </p>

                  {existingSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {existingSubjects.map((s) => {
                        const isSelected = subject === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setSubject(s);
                              markDirty();
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                              isSelected
                                ? "border-accent bg-accent text-on-accent hard-shadow-sm ring-1 ring-accent"
                                : "border-accent/30 bg-surface text-foreground hover:bg-accent/15 hover:border-accent"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted italic">Belum ada mapel tersimpan di database.</p>
                  )}

                  {/* FORM TAMBAH MAPEL BARU */}
                  <div className="mt-3.5 pt-3 border-t border-accent/20">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-accent">
                        <Plus size={13} />
                        Ketik / Tambah Mapel Baru:
                      </span>
                      <span className="text-[10px] text-muted">
                        Langsung aktif & otomatis terdaftar
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubjectInput}
                        onChange={(e) => setNewSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewCustomSubject();
                          }
                        }}
                        placeholder="Contoh: PEMROGRAMAN WEB, BASIS DATA, DLL..."
                        className="flex-1 rounded-lg border border-border/80 bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCustomSubject}
                        disabled={!newSubjectInput.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-on-accent transition-all hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={13} />
                        Tambah & Pilih
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Katalog Lengkap Mapel SMK TKJ & Umum */}
                <div className="rounded-xl border border-border bg-surface-2/30 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      Katalog Mapel Lengkap (SMK TKJ & Umum)
                    </span>

                    <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
                      <button
                        type="button"
                        onClick={() => setSubjectTab("all")}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                          subjectTab === "all"
                            ? "bg-accent text-on-accent"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        Semua ({standardSubjectCatalog.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubjectTab("produktif")}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                          subjectTab === "produktif"
                            ? "bg-accent text-on-accent"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        Produktif TKJ
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubjectTab("umum")}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                          subjectTab === "umum"
                            ? "bg-accent text-on-accent"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        Muatan Umum
                      </button>
                    </div>
                  </div>

                  {/* Search Filter for Catalog */}
                  <div className="mb-2.5">
                    <input
                      type="text"
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      placeholder="Cari nama mapel atau singkatan (misal: ASJ, AIJ, Jaringan, Sejarah)..."
                      className="w-full rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted/50 outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
                    {standardSubjectCatalog
                      .filter((item) => {
                        if (subjectTab !== "all" && item.group !== subjectTab) return false;
                        if (!subjectSearch.trim()) return true;
                        const q = subjectSearch.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(q) ||
                          item.hint.toLowerCase().includes(q)
                        );
                      })
                      .map((item) => {
                        const isSelected = subject === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              handleSelectOrAddSubject(item.name);
                              toast("success", `Mapel "${item.name}" dipilih!`);
                            }}
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-all ${
                              isSelected
                                ? "border-accent bg-accent text-on-accent font-bold"
                                : "border-border/60 bg-surface text-muted hover:text-foreground hover:border-accent/40"
                            }`}
                          >
                            {isSelected && <Check size={11} />}
                            {item.name}
                            <span className="text-[9px] opacity-60 font-mono">({item.hint})</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL DETAILS FOR PERSONAL */}
            {category === "personal" && (
              <div className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="language">Primary Language / Tech</Label>
                  <Input
                    id="language"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. C, Python, Shell, TypeScript..."
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {languageSuggestions.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguage(lang);
                          markDirty();
                        }}
                        className="rounded-md border border-border/60 bg-surface-2 px-2 py-0.5 text-[10px] text-muted hover:text-accent hover:border-accent"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="link">Project Repository / Demo Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      markDirty();
                    }}
                    placeholder="https://github.com/naidrahiqa/..."
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    GitHub URL or live website link shown on project details.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* DETAIL PAGE LAYOUT SELECTION */}
          <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight text-foreground mb-1">
              Detail Page Layout Variant
            </h3>
            <p className="text-xs text-muted mb-4">
              Choose how the story, media gallery, and hero visual are arranged on the public page.
            </p>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {LAYOUTS.map((opt) => {
                const isSelected = layout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setLayout(opt.value);
                      markDirty();
                    }}
                    className={`relative flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10 hard-shadow-sm ring-1 ring-accent"
                        : "border-border bg-surface-2/30 hover:border-border-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xs font-bold uppercase text-foreground">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <span className="rounded-full bg-accent p-0.5 text-on-accent">
                          <Check size={11} />
                        </span>
                      )}
                    </div>

                    <div className="rounded-lg border border-border/60 bg-surface p-2.5">
                      {opt.render()}
                    </div>

                    <p className="text-[11px] leading-tight text-muted">{opt.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA & GALLERY */}
      {activeTab === "media" && (
        <div className="flex flex-col gap-6">
          {/* COVER IMAGE */}
          <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight text-foreground mb-1">
              Cover Image
            </h3>
            <p className="text-xs text-muted mb-4">
              Main banner shown on cards, social previews, and top of the project page.
            </p>

            <FileUpload
              label="Cover Image File or URL"
              value={coverImage}
              onChange={(v) => {
                setCoverImage(v);
                markDirty();
              }}
              accept="image/*"
            />
          </div>

          {/* HERO VIDEO */}
          <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight text-foreground mb-1">
              Hero Video (Optional)
            </h3>
            <p className="text-xs text-muted mb-4">
              Video showcase featured prominently on the project detail page.
            </p>

            <VideoFields
              url={videoUrl}
              type={videoType}
              onChange={(f) => {
                setVideoUrl(f.video_url);
                setVideoType(f.video_type);
                markDirty();
              }}
            />
          </div>

          {/* MEDIA GALLERY */}
          <div className="rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
                Media Gallery
              </h3>
              {mediaLoading && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Loader2 size={13} className="animate-spin" />
                  Loading media...
                </div>
              )}
            </div>
            <p className="text-xs text-muted mb-4">
              Additional photos, diagrams, and video embeds displayed in the gallery section.
            </p>

            <MediaGallery
              items={media}
              onChange={(v) => {
                setMedia(v);
                markDirty();
              }}
              onInsertToStory={(item, index) => {
                const caption = item.caption || `Foto #${index + 1}`;
                insertMarkdown(`![${caption}](${item.url})\n\n`);
                setActiveTab("story");
                toast("success", `Disisipkan Media #${index + 1} ke cerita!`);
              }}
            />
          </div>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-foreground bg-surface p-4 hard-shadow">
        <div className="text-xs text-muted">
          {isDirty.current ? (
            <span className="font-semibold text-amber-400">● Unsaved changes in progress</span>
          ) : (
            <span>All changes saved</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (isDirty.current && !window.confirm("Discard unsaved changes?")) return;
              router.push("/admin/projects");
            }}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </div>

      {/* MODAL: STORY TEMPLATES */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border-2 border-foreground bg-surface p-6 hard-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold uppercase tracking-tight text-foreground">
                Choose a Story Template
              </h3>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted mb-4">
              Jumpstart your writing with pre-formatted structure tailored for your project type:
            </p>

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {storyTemplates.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-surface-2/40 p-4 hover:border-accent/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-sm font-bold text-foreground">{t.name}</p>
                    <button
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="rounded-lg bg-accent px-3 py-1 text-xs font-bold text-on-accent transition-all hover:bg-accent-hover"
                    >
                      Use Template
                    </button>
                  </div>
                  <p className="text-xs text-muted mb-2">{t.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowTemplateModal(false)}
                className="text-xs py-1.5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
