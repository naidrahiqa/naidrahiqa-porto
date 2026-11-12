import { describe, expect, it, vi, afterEach } from "vitest";
import {
  classLabel,
  cn,
  detectVideoType,
  formatRelativeTime,
  getDriveId,
  getStoragePath,
  getYouTubeId,
  isTrustedImageHost,
  languageColor,
  resolveImageUrl,
  slugify,
} from "@/lib/utils";

describe("cn", () => {
  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Phrolova Kernel Selene")).toBe("phrolova-kernel-selene");
  });

  it("strips punctuation", () => {
    expect(slugify("LKS-SMK Ke-34 KAB.JEPARA!")).toBe("lks-smk-ke-34-kabjepara");
  });

  it("collapses repeated separators", () => {
    expect(slugify("a   b -- c")).toBe("a-b-c");
  });
});

describe("classLabel", () => {
  it("uppercases the class level", () => {
    expect(classLabel("xii")).toBe("XII");
  });
});

describe("getYouTubeId", () => {
  it("reads watch, short and embed URLs", () => {
    expect(getYouTubeId("https://www.youtube.com/watch?v=abc123def45")).toBe("abc123def45");
    expect(getYouTubeId("https://youtu.be/abc123def45")).toBe("abc123def45");
    expect(getYouTubeId("https://www.youtube.com/embed/abc123def45")).toBe("abc123def45");
  });

  it("returns null for non-YouTube URLs", () => {
    expect(getYouTubeId("https://example.com/video")).toBeNull();
  });
});

describe("getDriveId", () => {
  it("reads file and open URLs", () => {
    const id = "1AbCdEfGhIjKlMnOpQrStUvWxYz01234";
    expect(getDriveId(`https://drive.google.com/file/d/${id}/view`)).toBe(id);
    expect(getDriveId(`https://drive.google.com/open?id=${id}`)).toBe(id);
  });

  it("returns null for short values", () => {
    expect(getDriveId("https://drive.google.com/file/d/short/view")).toBeNull();
  });
});

describe("getStoragePath", () => {
  it("extracts the media path from a public storage URL", () => {
    expect(
      getStoragePath(
        "https://demo.supabase.co/storage/v1/object/public/media/covers/shot.png"
      )
    ).toBe("covers/shot.png");
  });

  it("passes bare paths through", () => {
    expect(getStoragePath("covers/shot.png")).toBe("covers/shot.png");
  });

  it("returns null for unrelated HTTP urls", () => {
    expect(getStoragePath("https://example.com/shot.png")).toBeNull();
  });
});

describe("resolveImageUrl", () => {
  it("returns an empty string for empty input", () => {
    expect(resolveImageUrl(null)).toBe("");
    expect(resolveImageUrl(undefined)).toBe("");
  });

  it("passes regular http urls through", () => {
    expect(resolveImageUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
  });

  it("converts Google Drive links to direct images", () => {
    const id = "1AbCdEfGhIjKlMnOpQrStUvWxYz01234";
    expect(resolveImageUrl(`https://drive.google.com/file/d/${id}/view`)).toBe(
      `https://lh3.googleusercontent.com/d/${id}=s0`
    );
  });

  it("unwraps the Next.js image proxy", () => {
    const inner = "https://cdn.example.com/photo.jpg";
    const wrapped = `https://site.example/_next/image?url=${encodeURIComponent(inner)}&w=640`;
    expect(resolveImageUrl(wrapped)).toBe(inner);
  });

  it("builds a storage URL for bare filenames", () => {
    expect(resolveImageUrl("covers/shot.png")).toContain(
      "/storage/v1/object/public/media/covers/shot.png"
    );
  });
});

describe("detectVideoType", () => {
  it("detects each supported source", () => {
    expect(detectVideoType(null)).toBe("none");
    expect(detectVideoType("https://youtu.be/abc123def45")).toBe("youtube");
    expect(
      detectVideoType("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz01234/view")
    ).toBe("drive");
    expect(
      detectVideoType("https://demo.supabase.co/storage/v1/object/public/media/clip.mp4")
    ).toBe("storage");
    expect(detectVideoType("media/clip.mp4")).toBe("storage");
    expect(detectVideoType("https://example.com/clip.mp4")).toBe("none");
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an empty string for missing or invalid dates", () => {
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime("not-a-date")).toBe("");
  });

  it("formats recent timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-12T12:00:00Z"));
    expect(formatRelativeTime("2026-11-12T11:59:40Z")).toBe("just now");
    expect(formatRelativeTime("2026-11-12T11:30:00Z")).toBe("30m ago");
    expect(formatRelativeTime("2026-11-12T09:00:00Z")).toBe("3h ago");
    expect(formatRelativeTime("2026-11-09T12:00:00Z")).toBe("3d ago");
    expect(formatRelativeTime("2026-09-12T12:00:00Z")).toBe("2mo ago");
    expect(formatRelativeTime("2024-11-12T12:00:00Z")).toBe("2y ago");
  });
});

describe("languageColor", () => {
  it("returns known colors and a fallback", () => {
    expect(languageColor("TypeScript")).toBe("#3178c6");
    expect(languageColor(null)).toBe("#8b8b93");
    expect(languageColor("Brainfuck")).toBe("#8b8b93");
  });
});

describe("isTrustedImageHost", () => {
  it("trusts local, data and blob sources", () => {
    expect(isTrustedImageHost("/logo.png")).toBe(true);
    expect(isTrustedImageHost("data:image/png;base64,abc")).toBe(true);
    expect(isTrustedImageHost("blob:https://example.com/id")).toBe(true);
  });

  it("trusts Supabase, Google and YouTube hosts", () => {
    expect(isTrustedImageHost("https://demo.supabase.co/storage/v1/a.png")).toBe(true);
    expect(isTrustedImageHost("https://lh3.googleusercontent.com/d/id=s0")).toBe(true);
    expect(isTrustedImageHost("https://img.youtube.com/vi/id/0.jpg")).toBe(true);
  });

  it("rejects unknown hosts", () => {
    expect(isTrustedImageHost("https://example.com/a.png")).toBe(false);
    expect(isTrustedImageHost("https://notsupabase.co/a.png")).toBe(false);
  });
});
