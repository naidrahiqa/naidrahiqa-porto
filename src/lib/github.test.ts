import { describe, expect, it } from "vitest";
import {
  prettifyRepoName,
  repoNameFromUrl,
  repoSlug,
  repoTimestamp,
} from "@/lib/github";

describe("repoNameFromUrl", () => {
  it("reads the repository name from GitHub URLs", () => {
    expect(repoNameFromUrl("https://github.com/naidrahiqa/catchido")).toBe("catchido");
    expect(repoNameFromUrl("https://github.com/naidrahiqa/catchido.git")).toBe("catchido");
    expect(repoNameFromUrl("https://github.com/naidrahiqa/catchido/tree/main")).toBe("catchido");
  });

  it("returns null for other hosts and empty input", () => {
    expect(repoNameFromUrl("https://gitlab.com/naidrahiqa/catchido")).toBeNull();
    expect(repoNameFromUrl(null)).toBeNull();
    expect(repoNameFromUrl(undefined)).toBeNull();
  });
});

describe("repoSlug", () => {
  it("slugifies snake_case and dots", () => {
    expect(repoSlug("android_kernel_xiaomi_selene")).toBe("android-kernel-xiaomi-selene");
    expect(repoSlug("LKS-SMK-Ke-34-KAB.JEPARA-ITNSA.")).toBe("lks-smk-ke-34-kab-jepara-itnsa");
  });

  it("keeps lowercase names stable", () => {
    expect(repoSlug("reboisasi")).toBe("reboisasi");
  });
});

describe("prettifyRepoName", () => {
  it("turns separators into spaces and title-cases words", () => {
    expect(prettifyRepoName("kernel-ci-kit")).toBe("Kernel Ci Kit");
    expect(prettifyRepoName("aqua_safe_monitor")).toBe("Aqua Safe Monitor");
  });

  it("falls back to the original name for empty input", () => {
    expect(prettifyRepoName("---")).toBe("---");
  });
});

describe("repoTimestamp", () => {
  it("normalizes valid dates to ISO strings", () => {
    expect(repoTimestamp("2026-11-05T13:34:28Z")).toBe("2026-11-05T13:34:28.000Z");
  });

  it("returns null for missing or invalid values", () => {
    expect(repoTimestamp(null)).toBeNull();
    expect(repoTimestamp("nope")).toBeNull();
  });
});
