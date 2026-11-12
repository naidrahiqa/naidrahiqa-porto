import { BrandIcon } from "@/components/BrandIcon";

export function SocialIcon({
  platform,
  size = 18,
}: {
  platform: string;
  size?: number;
}) {
  return <BrandIcon platform={platform} size={size} />;
}

export function SocialLink({
  platform,
  handle,
  url,
}: {
  platform: string;
  handle: string;
  url: string;
}) {
  const href = platform === "email" 
    ? (url.startsWith("mailto:") ? url : `mailto:${handle || url}`)
    : url;

  return (
    <a
      href={href}
      target={platform === "email" ? undefined : "_blank"}
      rel={platform === "email" ? undefined : "noopener noreferrer"}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-foreground/25"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-accent-fill text-accent transition-colors duration-200 group-hover:border-accent/40">
        <BrandIcon platform={platform} size={20} />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {platform}
        </span>
        <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
          {handle || url}
        </span>
      </span>
    </a>
  );
}