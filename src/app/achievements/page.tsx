import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AchievementFilter } from "@/components/AchievementFilter";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Achievements - Naidrahiqa",
};

export default async function AchievementsPage() {
  const supabase = await createClient();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-10 pt-12 sm:pt-16">
      <header className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-fill px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent mb-3 dark:bg-accent/20">
          <span>🏆</span>
          <span>TROPHY VAULT // BADGE REPOSITORY</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl text-foreground">
          Awards & <span className="marker">Milestones</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted">
          Competitions, technical certifications, and seminars along the learning trajectory.
        </p>
      </header>

      {achievements && achievements.length > 0 ? (
        <AchievementFilter items={achievements} />
      ) : (
        <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          No achievements yet
        </p>
      )}
    </div>
  );
}
