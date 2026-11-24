import { describe, expect, it } from "vitest";
import {
  isGitHubUrl,
  isGitLabUrl,
  isTelegramUrl,
  linkActionLabel,
  repoProvider,
} from "./github-meta";
import {
  gitLabCommitTitle,
  gitlabPathFromUrl,
  gitLabSizeKb,
  isUsableGitLabProject,
  normalizeGitLabLicense,
  topGitLabLanguage,
  type GitLabProject,
} from "./gitlab";

describe("provider helpers in github-meta", () => {
  it("detects GitLab, GitHub, and Telegram URLs", () => {
    expect(isGitLabUrl("https://gitlab.com/naidrahiqa/kernel")).toBe(true);
    expect(isGitLabUrl("https://self.gitlab.com/group/repo")).toBe(true);
    expect(isGitLabUrl("https://github.com/naidrahiqa/kernel")).toBe(false);

    expect(isGitHubUrl("https://github.com/naidrahiqa/kernel")).toBe(true);
    expect(isGitHubUrl("https://gitlab.com/naidrahiqa/kernel")).toBe(false);

    expect(isTelegramUrl("https://t.me/naidrahiqa")).toBe(true);
    expect(isTelegramUrl("https://telegram.me/naidrahiqa")).toBe(true);
    expect(isTelegramUrl("https://github.com/naidrahiqa")).toBe(false);
  });

  it("resolves repoProvider from link or repoName fallback", () => {
    expect(repoProvider("https://gitlab.com/naidrahiqa/app")).toBe("gitlab");
    expect(repoProvider("https://github.com/naidrahiqa/app")).toBe("github");
    expect(repoProvider("https://t.me/channel", null)).toBeNull();
    expect(repoProvider(null, "legacy-repo")).toBe("github");
    expect(repoProvider(null, null)).toBeNull();
  });

  it("returns provider-aware link labels", () => {
    expect(linkActionLabel("https://github.com/a/b")).toBe("View on GitHub");
    expect(linkActionLabel("https://gitlab.com/a/b")).toBe("View on GitLab");
    expect(linkActionLabel("https://t.me/channel")).toBe("View on Telegram");
    expect(linkActionLabel("https://example.com")).toBe("Open link");
    expect(linkActionLabel(null)).toBe("Open link");
  });
});

describe("gitlab helpers", () => {
  it("extracts namespace path from GitLab URLs and shorthand", () => {
    expect(gitlabPathFromUrl("https://gitlab.com/naidrahiqa/my-repo")).toBe(
      "naidrahiqa/my-repo"
    );
    expect(
      gitlabPathFromUrl("https://gitlab.com/group/sub/repo/-/tree/main")
    ).toBe("group/sub/repo");
    expect(gitlabPathFromUrl("https://gitlab.com/naidrahiqa/repo.git")).toBe(
      "naidrahiqa/repo"
    );
    expect(gitlabPathFromUrl("naidrahiqa/repo.git")).toBe("naidrahiqa/repo");
    expect(gitlabPathFromUrl("https://github.com/naidrahiqa/repo")).toBeNull();
    expect(gitlabPathFromUrl("single-segment")).toBeNull();
  });

  it("normalizes GitLab license objects", () => {
    expect(
      normalizeGitLabLicense({ key: "mit", name: "MIT License", nickname: "MIT" })
    ).toBe("MIT");
    expect(
      normalizeGitLabLicense({ key: "other", name: "Other", nickname: null })
    ).toBeNull();
    expect(normalizeGitLabLicense(null)).toBeNull();
  });

  it("picks the highest-percentage GitLab language", () => {
    expect(topGitLabLanguage({ TypeScript: 62.5, CSS: 37.5 })).toBe(
      "TypeScript"
    );
    expect(topGitLabLanguage(null)).toBe("");
  });

  it("computes repository size in KB from statistics", () => {
    const base = { statistics: { repository_size: 2048 } } as GitLabProject;
    expect(gitLabSizeKb(base)).toBe(2);
    expect(gitLabSizeKb({ statistics: { repository_size: 100 } } as GitLabProject)).toBe(1);
    expect(gitLabSizeKb({ statistics: null } as GitLabProject)).toBe(0);
  });

  it("extracts first line of GitLab commit title or message", () => {
    expect(
      gitLabCommitTitle({
        id: "abc",
        title: "feat: add support\n\nbody",
        message: "ignored",
        committed_date: null,
        created_at: null,
      })
    ).toBe("feat: add support");
    expect(gitLabCommitTitle(null)).toBeNull();
  });

  it("filters out empty or deletion-scheduled GitLab projects", () => {
    expect(
      isUsableGitLabProject({
        path_with_namespace: "mt6768-dev/kernel-modules-6.6",
        path: "kernel-modules-6.6",
        name: "Kernel Modules 6.6",
        visibility: "public",
      })
    ).toBe(true);

    expect(
      isUsableGitLabProject({
        path_with_namespace: "mt6768-dev/kernel-6.6-deletion_scheduled-89243076",
        path: "kernel-6.6-deletion_scheduled-89243076",
        marked_for_deletion_on: "2026-11-20",
      })
    ).toBe(false);

    expect(
      isUsableGitLabProject({
        path_with_namespace: "mt6768-dev/empty",
        empty_repo: true,
      })
    ).toBe(false);
  });
});
