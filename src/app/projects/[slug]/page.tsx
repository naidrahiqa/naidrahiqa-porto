import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn, formatDate, slugify } from "@/lib/utils";
import { ProjectLayout } from "@/components/ProjectLayout";
import type { Project, ProjectMedia } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("title, description")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const description =
    data?.description ||
    (slug === "penerapan-sila-pancasila-pada-kehidupan-sehari-hari"
      ? "Dokumentasi aksi nyata pengamalan nilai-nilai luhur Pancasila (Sila ke-1 sampai ke-5) dalam kehidupan sehari-hari siswa di lingkungan SMK Negeri 3 Jepara, mulai dari ibadah bersama, kepedulian berbagi makanan, mendukung produk lokal, musyawarah kelompok, hingga distribusi Program Makan Bergizi Gratis (MBG)."
      : undefined);

  return {
    title: data?.title ?? "Project",
    description,
  };
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!project) notFound();

  const { data: media } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", project.id)
    .order("sort_order");

  let resolvedProject = project;
  if (slug === "penerapan-sila-pancasila-pada-kehidupan-sehari-hari") {
    let resolvedContent = project.content;
    if (resolvedContent) {
      try {
        const parsed = JSON.parse(resolvedContent);
        if (Array.isArray(parsed.points)) {
          parsed.points = parsed.points.map((pt: any) => {
            if (pt.id === "sila-1") {
              return {
                ...pt,
                text: "* **Simbol**: Bintang emas berlatar perisai hitam.\n* **Makna Nilai**: Mengakui keberadaan Tuhan Yang Maha Esa, menjunjung tinggi toleransi antarumat beragama, dan menjalankan perintah agama dengan ikhlas dan penuh kedisiplinan.\n* **Aksi Nyata di Sekolah**: Mendengarkan khutbah sholat Jumat dengan khusyuk, tenang, dan tertib di mushola sekolah bersama teman-teman, menjaga adab dengan tidak berbicara saat khatib menyampaikan khutbah sebagai wujud ketaatan beribadah kepada Tuhan Yang Maha Esa.",
                images: pt.images?.map((img: any) => {
                  if (img.url?.includes("1_0GQozFV4Xs5FzfgyKYXJbl9427WOi0e")) {
                    return {
                      ...img,
                      caption:
                        "Penerapan Sila ke-1: Mendengarkan khutbah sholat Jumat dengan khusyuk di mushola sekolah",
                    };
                  }
                  return img;
                }),
              };
            }
            if (pt.id === "sila-5") {
              return {
                ...pt,
                text: "* **Simbol**: Padi dan Kapas.\n* **Makna Nilai**: Mengembangkan sikap adil terhadap sesama, menjaga keseimbangan antara hak dan kewajiban, serta menghormati hak orang lain demi mewujudkan kesejahteraan dan keadilan sosial yang merata.\n* **Aksi Nyata di Sekolah**: Pembagian dan pendistribusian makanan Program Makan Bergizi Gratis (MBG) secara tertib dan merata kepada seluruh siswa di kelas menggunakan wadah omprengan stainless steel, memastikan setiap teman memperoleh hak porsi makanan sehat dan bergizi yang sama tanpa ada yang terlewatkan.",
                images: pt.images?.map((img: any) => {
                  if (img.url?.includes("17BeH00qmGdqIDDoDR9991rKANoxHBV3I")) {
                    return {
                      ...img,
                      caption:
                        "Penerapan Sila ke-5: Pembagian makanan Program Makan Bergizi Gratis (MBG) secara adil dan merata di kelas",
                    };
                  }
                  return img;
                }),
              };
            }
            return pt;
          });
          resolvedContent = JSON.stringify(parsed);
        }
      } catch {
        // preserve existing if parse fails
      }
    }
    resolvedProject = {
      ...project,
      description:
        project.description ||
        "Dokumentasi aksi nyata pengamalan nilai-nilai luhur Pancasila (Sila ke-1 sampai ke-5) dalam kehidupan sehari-hari siswa di lingkungan SMK Negeri 3 Jepara, mulai dari mendengarkan khutbah Jumat, kepedulian berbagi makanan, mendukung produk lokal, musyawarah kelompok, hingga distribusi Program Makan Bergizi Gratis (MBG).",
      content: resolvedContent,
    };
  }

  const resolvedMedia = (media ?? []).map((m) => {
    if (m.url?.includes("1_0GQozFV4Xs5FzfgyKYXJbl9427WOi0e")) {
      return {
        ...m,
        caption:
          "Penerapan Sila ke-1: Mendengarkan khutbah sholat Jumat dengan khusyuk di mushola sekolah",
      };
    }
    if (m.url?.includes("17BeH00qmGdqIDDoDR9991rKANoxHBV3I")) {
      return {
        ...m,
        caption:
          "Penerapan Sila ke-5: Pembagian makanan Program Makan Bergizi Gratis (MBG) secara adil dan merata di kelas",
      };
    }
    return m;
  });

  const backHref =
    resolvedProject.category === "school" && resolvedProject.class_level
      ? resolvedProject.subject
        ? `/projects/school/${resolvedProject.class_level}/${slugify(resolvedProject.subject)}`
        : `/projects/school/${resolvedProject.class_level}`
      : "/projects";
  const backLabel =
    resolvedProject.category === "school" && resolvedProject.class_level
      ? resolvedProject.subject
        ? resolvedProject.subject
        : `Kelas ${resolvedProject.class_level.toUpperCase()}`
      : "Projects";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 pt-12 sm:pt-16">
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wider",
              resolvedProject.category === "school"
                ? "border-accent/30 text-accent"
                : "border-accent-2/30 text-accent-2"
            )}
          >
            {resolvedProject.category}
          </span>
          {resolvedProject.category === "school" && resolvedProject.class_level && (
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] uppercase text-muted">
              class {resolvedProject.class_level}
            </span>
          )}
          {resolvedProject.category === "school" && resolvedProject.subject && (
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted">
              {resolvedProject.subject}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {resolvedProject.title}
        </h1>
        {resolvedProject.description && (
          <p className="text-lg leading-relaxed text-muted">
            {resolvedProject.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <time>{formatDate(resolvedProject.created_at)}</time>
          {resolvedProject.link && (
            <a
              href={resolvedProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent hover:underline"
            >
              <ExternalLink size={13} />
              GitHub
            </a>
          )}
        </div>
      </header>

      {/* Layout content */}
      <ProjectLayout
        project={resolvedProject as Project}
        media={resolvedMedia as ProjectMedia[]}
      />
    </div>
  );
}