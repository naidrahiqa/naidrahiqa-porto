import { languageBreakdown } from "@/lib/github-meta";
import { cn, languageColor } from "@/lib/utils";

interface LanguageBarProps {
  languages: Record<string, number> | null | undefined;
  fallback?: string | null;
  max?: number;
  showLegend?: boolean;
  className?: string;
}

export function LanguageBar({
  languages,
  fallback,
  max = 5,
  showLegend = false,
  className,
}: LanguageBarProps) {
  const breakdown = languageBreakdown(languages, max);
  const slices =
    breakdown.length > 0
      ? breakdown
      : fallback
        ? [{ name: fallback, bytes: 1, percent: 100 }]
        : [];

  if (slices.length === 0) return null;

  const label = slices
    .map((slice) => `${slice.name} ${slice.percent}%`)
    .join(", ");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="img"
        aria-label={`Languages: ${label}`}
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      >
        {slices.map((slice, index) => (
          <span
            key={`${slice.name}-${index}`}
            className="h-full min-w-[2px]"
            style={{
              flexGrow: slice.percent,
              flexBasis: 0,
              backgroundColor: languageColor(slice.name),
            }}
          />
        ))}
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted">
          {slices.map((slice, index) => (
            <span
              key={`${slice.name}-${index}`}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: languageColor(slice.name) }}
              />
              <span>{slice.name}</span>
              <span className="text-muted/70">{slice.percent}%</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
