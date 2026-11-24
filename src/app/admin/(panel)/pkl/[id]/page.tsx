import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PklForm } from "@/components/admin/PklForm";
import type { Project } from "@/lib/types";

export default async function EditPklPostPage({
  params,
}: PageProps<"/admin/pkl/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted">
        <Link href="/admin/pkl" className="hover:text-accent">
          PKL / Jurnal
        </Link>
        <ChevronRight size={14} className="text-muted/50" />
        <span className="max-w-[240px] truncate font-medium text-foreground">
          {project.title}
        </span>
      </nav>

      <header>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">
          Edit Catatan PKL
        </h1>
      </header>

      <PklForm initial={project as Project} />
    </div>
  );
}
