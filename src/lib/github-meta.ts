export interface LanguageSlice {
  name: string;
  bytes: number;
  percent: number;
}

export function languageBreakdown(
  languages: Record<string, number> | null | undefined,
  max = 6
): LanguageSlice[] {
  const entries = Object.entries(languages ?? {})
    .filter(([, bytes]) => Number.isFinite(bytes) && bytes > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total <= 0) return [];

  const limit = Math.max(1, Math.floor(max));
  const top = entries.slice(0, limit);
  const rest = entries.slice(limit);

  const slices: LanguageSlice[] = top.map(([name, bytes]) => ({
    name,
    bytes,
    percent: Math.round((bytes / total) * 1000) / 10,
  }));

  if (rest.length > 0) {
    const bytes = rest.reduce((sum, [, value]) => sum + value, 0);
    slices.push({
      name: "Other",
      bytes,
      percent: Math.round((bytes / total) * 1000) / 10,
    });
  }

  if (slices.length > 0) {
    const rounded = slices.reduce((sum, slice) => sum + slice.percent, 0);
    const last = slices[slices.length - 1];
    last.percent = Math.round((last.percent + (100 - rounded)) * 10) / 10;
  }

  return slices;
}
