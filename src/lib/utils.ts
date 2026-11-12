export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const CLASS_LEVELS = ["x", "xi", "xii"] as const;

export function classLabel(value: string): string {
  return value.toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export const LANGUAGE_COLORS: Record<string, string> = {
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  Kotlin: "#A97BFF",
  Python: "#3572A5",
  QML: "#44a51c",
  Shell: "#89e051",
  TypeScript: "#3178c6",
  Blade: "#f7523f",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

export function languageColor(language: string | null | undefined): string {
  if (!language) return "#8b8b93";
  return LANGUAGE_COLORS[language] ?? "#8b8b93";
}

const TRUSTED_IMAGE_HOSTS = ["lh3.googleusercontent.com", "img.youtube.com"];

export function isTrustedImageHost(src: string): boolean {
  if (!src) return true;
  if (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return true;
  }
  try {
    const host = new URL(src).hostname;
    return host.endsWith("supabase.co") || TRUSTED_IMAGE_HOSTS.includes(host);
  } catch {
    return true;
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/
  );
  return match ? match[1] : null;
}

export function getDriveId(url: string): string | null {
  const match = url.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([\w-]{20,})/
  );
  return match ? match[1] : null;
}

export function getStoragePath(url: string): string | null {
  if (url.startsWith("http")) {
    const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
    return match ? match[1] : null;
  }
  // Bare filename or media/... path
  return url;
}

export function storagePublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/media/${path.replace(/^media\//, "")}`;
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) {
    // Unwrap Next.js image proxy (e.g. kpopping.com/_next/image?url=<real>)
    if (url.includes("/_next/image")) {
      try {
        const inner = new URL(url).searchParams.get("url");
        if (inner) return inner;
      } catch {}
    }
    const driveId = getDriveId(url);
    if (driveId && (url.includes("drive.google.com") || url.includes("docs.google.com")))
      return `https://lh3.googleusercontent.com/d/${driveId}=s0`;
    return url;
  }
  // Bare filename or media/... path → Supabase Storage URL
  return storagePublicUrl(url);
}

export function getSourceHref(url: string): string {
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) return url;
  if (url.startsWith("media/")) return storagePublicUrl(url);
  return url;
}

export function detectVideoType(
  url: string | null | undefined
): "none" | "youtube" | "drive" | "storage" {
  if (!url) return "none";
  if (getYouTubeId(url)) return "youtube";
  if (getDriveId(url)) return "drive";
  if (url.startsWith("http") && url.includes("/storage/v1/object/public/media/")) return "storage";
  if (url.startsWith("media/")) return "storage";
  return "none";
}
