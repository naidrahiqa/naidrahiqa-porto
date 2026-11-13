import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AchievementFilter } from "@/components/AchievementFilter";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Competitions, certifications, and seminars along the learning trajectory of Faqih Ardian Syah.",
};

export default async function AchievementsPage() {
  const supabase = await createClient();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order");

  const total = achievements?.length ?? 0;

  return (
    <div className="flex flex-col gap-10 pt-12 sm:pt-16">
      <header className="max-w-2xl">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Archive
          </span>
          <span className="h-px w-8 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {total} entries
          </span>
        </div>
        <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-foreground sm:text-6xl">
          Awards &amp;{" "}
          <span className="text-foreground/30">milestones</span>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          Competitions, technical certifications, and seminars collected along
          the way.
        </p>
      </header>

      {total > 0 ? (
        <AchievementFilter items={achievements ?? []} />
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-surface/50 p-8">
          <p className="font-display text-sm font-bold text-foreground">
            No achievements listed yet
          </p>
          <p className="max-w-md text-[13px] leading-relaxed text-muted">
            Competitions, trainings, and seminars will appear here once they are
            added from the admin panel.
          </p>
        </div>
      )}
    </div>
  );
}
