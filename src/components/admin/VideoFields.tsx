"use client";

import { detectVideoType } from "@/lib/utils";
import { Input, Label, Select } from "@/components/admin/ui";

const videoTypes = ["none", "youtube", "drive", "storage"] as const;

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
  return m ? m[1] : null;
}

function VideoPreview({ url, type }: { url: string | null; type: string }) {
  if (!url || type === "none") return null;

  if (type === "youtube") {
    const id = getYouTubeId(url);
    if (!id) return null;
    return (
      <img
        src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
        alt="Video preview"
        className="mt-1 h-28 w-auto rounded-lg border border-border object-cover"
      />
    );
  }

  if (type === "drive") {
    const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    const id = m ? m[1] : url.match(/[?&]id=([^&]+)/)?.[1];
    if (!id) return null;
    return (
      <img
        src={`https://lh3.googleusercontent.com/d/${id}=w400`}
        alt="Video preview"
        className="mt-1 h-28 w-auto rounded-lg border border-border object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-muted">
      {url.split("/").pop()}
    </span>
  );
}

export function VideoFields({
  url,
  type,
  onChange,
}: {
  url: string | null | undefined;
  type: string | null | undefined;
  onChange: (fields: { video_url: string | null; video_type: string }) => void;
}) {
  const currentType = type ?? "none";
  const detected = detectVideoType(url ?? null);
  const isAuto = detected === currentType;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="video_url">Video URL</Label>
          {url && (
            <span className="font-mono text-[11px] text-accent">
              {currentType === "none" ? "no video type detected" : currentType}
            </span>
          )}
        </div>
        <Input
          id="video_url"
          type="url"
          placeholder="https://youtube.com/watch?v=... or https://drive.google.com/file/d/... or media/xxx.mp4"
          value={url ?? ""}
          onChange={(e) => {
            const value = e.target.value || null;
            onChange({
              video_url: value,
              video_type: value ? detectVideoType(value) : "none",
            });
          }}
        />
        <p className="mt-1 text-[11px] text-muted">
          Type is detected automatically as you paste. Preview appears below.
        </p>
        <VideoPreview url={url ?? null} type={currentType} />
      </div>

      <div>
        <Label htmlFor="video_type">
          Video type{" "}
          <span className="font-mono text-[10px] text-muted">
            {isAuto ? "(auto)" : "(manual override)"}
          </span>
        </Label>
        <Select
          id="video_type"
          value={currentType}
          onChange={(e) => onChange({ video_url: url ?? null, video_type: e.target.value })}
        >
          {videoTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
