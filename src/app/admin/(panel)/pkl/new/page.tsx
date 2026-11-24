import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isPklProject, parsePklMeta } from "@/lib/pkl";
import { PklForm } from "@/components/admin/PklForm";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewPklPostPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("category, subject, title, language, description, content")
    .eq("category", "school");

  const existingPkl = ((data ?? []) as Project[]).filter((p) =>
    isPklProject(p)
  );
  const maxWeek = existingPkl.reduce((max, item) => {
    const num = parsePklMeta(item).weekNumber;
    return num && num > max ? num : max;
  }, 0);
  const nextWeek = maxWeek > 0 ? maxWeek + 1 : existingPkl.length + 1;

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted">
        <Link href="/admin/pkl" className="hover:text-accent">
          PKL / Jurnal
        </Link>
        <ChevronRight size={14} className="text-muted/50" />
        <span className="font-medium text-foreground">Tulis Catatan Baru</span>
      </nav>

      <header>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">
          Tulis Catatan Mingguan PKL
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pilih minggu, tulis cerita atau pakai template, lalu upload foto
          dokumentasi kegiatanmu.
        </p>
      </header>

      <PklForm defaultWeekNumber={nextWeek} />
    </div>
  );
}
