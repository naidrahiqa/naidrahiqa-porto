import { LanguageBar } from "@/components/LanguageBar";
import { formatRelativeTime } from "@/lib/utils";
import type { GitHubProfile, Project } from "@/lib/types";

export function GitHubOverview({
  projects,
  profile,
}: {
  projects: Project[];
  profile: GitHubProfile | null;
}) {
  const repoProjects = projects.filter((project) => project.repo_name);
  if (repoProjects.length === 0) return null;

  const totalStars = repoProjects.reduce(
    (sum, project) => sum + (project.repo_stars ?? 0),
    0
  );
  const totalForks = repoProjects.reduce(
    (sum, project) => sum + (project.repo_forks ?? 0),
    0
  );

  const hasBreakdown = repoProjects.some(
    (project) => Object.keys(project.repo_languages ?? {}).length > 0
  );

  const totals: Record<string, number> = {};
  if (hasBreakdown) {
    for (const project of repoProjects) {
      for (const [language, bytes] of Object.entries(
        project.repo_languages ?? {}
      )) {
        if (Number.isFinite(bytes) && bytes > 0) {
          totals[language] = (totals[language] ?? 0) + bytes;
        }
      }
    }
  } else {
    for (const project of repoProjects) {
      if (project.language) {
        totals[project.language] = (totals[project.language] ?? 0) + 1;
      }
    }
  }

  const languageCount = Object.keys(totals).length;
  const lastSynced =
    repoProjects.reduce<string | null>((latest, project) => {
      const value = project.repo_synced_at ?? null;
      return value && (!latest || value > latest) ? value : latest;
    }, null) ?? profile?.synced_at ?? null;

  const parsedYear = profile?.member_since
    ? new Date(profile.member_since).getFullYear()
    : null;
  const memberSince =
    parsedYear !== null && Number.isFinite(parsedYear) ? parsedYear : null;

  const stats = [
    {
      label: "Repositories",
      value: profile?.public_repos ?? repoProjects.length,
    },
    { label: "Stars", value: totalStars },
    { label: "Forks", value: totalForks },
    { label: "Languages", value: languageCount },
  ];

  const numberFormat = new Intl.NumberFormat("en-US");

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface px-4 py-3.5">
            <p className="font-display text-xl font-extrabold tracking-tight text-foreground">
              {numberFormat.format(stat.value)}
            </p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {languageCount > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
              Language mix
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
              {lastSynced
                ? `Synced ${formatRelativeTime(lastSynced)}`
                : "Awaiting first sync"}
              {memberSince ? ` / GitHub since ${memberSince}` : ""}
            </span>
          </div>
          <LanguageBar languages={totals} max={6} showLegend />
        </div>
      )}
    </div>
  );
}
