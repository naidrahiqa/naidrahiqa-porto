import { afterEach, describe, expect, it, vi } from "vitest";
import {
  enrichGitHubRepos,
  fetchGitHubProfile,
  fetchGitHubRepos,
  fetchLatestCommit,
  fetchLatestRelease,
  fetchRepoLanguages,
  firstLine,
  formatRepoSize,
  languageBreakdown,
  normalizeHomepage,
  normalizeLicense,
  prettifyRepoName,
  repoCloneUrl,
  repoNameFromUrl,
  repoSlug,
  repoTimestamp,
  type GitHubRepo,
} from "@/lib/github";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => data,
  } as Response;
}

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

describe("normalizeHomepage", () => {
  it("adds https to bare domains", () => {
    expect(normalizeHomepage("kti-dashboard-opal.vercel.app")).toBe(
      "https://kti-dashboard-opal.vercel.app"
    );
    expect(normalizeHomepage("  aquasafemonitor.vercel.app  ")).toBe(
      "https://aquasafemonitor.vercel.app"
    );
  });

  it("keeps http and https URLs and rejects unsafe schemes", () => {
    expect(normalizeHomepage("https://naidrahiqa.vercel.app")).toBe(
      "https://naidrahiqa.vercel.app"
    );
    expect(normalizeHomepage("http://example.com")).toBe("http://example.com");
    expect(normalizeHomepage("javascript:alert(1)")).toBeNull();
    expect(normalizeHomepage("")).toBeNull();
    expect(normalizeHomepage(null)).toBeNull();
  });
});

describe("normalizeLicense", () => {
  it("returns SPDX ids and drops NOASSERTION", () => {
    expect(normalizeLicense({ spdx_id: "MIT", name: "MIT License" })).toBe("MIT");
    expect(normalizeLicense({ spdx_id: "NOASSERTION", name: null })).toBeNull();
    expect(normalizeLicense({ spdx_id: null, name: null })).toBeNull();
    expect(normalizeLicense(null)).toBeNull();
  });
});

describe("formatRepoSize", () => {
  it("formats KB, MB, and GB values", () => {
    expect(formatRepoSize(512)).toBe("512 KB");
    expect(formatRepoSize(2048)).toBe("2.0 MB");
    expect(formatRepoSize(1024 * 1024)).toBe("1.0 GB");
  });

  it("returns a dash for missing sizes", () => {
    expect(formatRepoSize(0)).toBe("-");
    expect(formatRepoSize(undefined)).toBe("-");
  });
});

describe("repoCloneUrl", () => {
  it("appends .git once", () => {
    expect(repoCloneUrl("https://github.com/naidrahiqa/catchido")).toBe(
      "https://github.com/naidrahiqa/catchido.git"
    );
    expect(repoCloneUrl("https://github.com/naidrahiqa/catchido.git")).toBe(
      "https://github.com/naidrahiqa/catchido.git"
    );
    expect(repoCloneUrl(null)).toBeNull();
  });
});

describe("firstLine", () => {
  it("keeps the subject line and truncates long messages", () => {
    expect(firstLine("feat: add MT6769 support\n\nBody text")).toBe(
      "feat: add MT6769 support"
    );
    expect(firstLine("x".repeat(200), 20)).toHaveLength(20);
  });
});

describe("languageBreakdown", () => {
  it("sorts by bytes, computes percentages, and groups the rest", () => {
    const slices = languageBreakdown({ C: 700, Shell: 200, Python: 100 }, 2);

    expect(slices.map((slice) => slice.name)).toEqual(["C", "Shell", "Other"]);
    expect(slices[0].percent).toBe(70);
    expect(slices[1].percent).toBe(20);
    expect(slices[2].percent).toBe(10);
  });

  it("rounds the last slice so percentages add up to 100", () => {
    const slices = languageBreakdown({ C: 1, Shell: 1, Python: 1 }, 3);
    const total = slices.reduce((sum, slice) => sum + slice.percent, 0);
    expect(total).toBe(100);
  });

  it("returns an empty list without language data", () => {
    expect(languageBreakdown({})).toEqual([]);
    expect(languageBreakdown(null)).toEqual([]);
    expect(languageBreakdown({ C: 0 })).toEqual([]);
  });
});

describe("fetchGitHubRepos", () => {
  it("stops after the first page when it is not full", async () => {
    const fetchMock = mockFetchPages([[makeRepo("reboisasi"), makeRepo("catchido")]]);
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchGitHubRepos();

    expect(repos.map((repo) => repo.name)).toEqual(["reboisasi", "catchido"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("follows pagination while a page is full", async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => makeRepo(`repo-${i}`));
    const fetchMock = mockFetchPages([firstPage, [makeRepo("last-repo")]]);
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchGitHubRepos();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(repos).toHaveLength(101);
    expect(repos.at(-1)?.name).toBe("last-repo");
  });

  it("skips dot repositories and duplicates", async () => {
    const fetchMock = mockFetchPages([
      [makeRepo("reboisasi"), makeRepo(".github"), makeRepo("reboisasi")],
    ]);
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchGitHubRepos();

    expect(repos.map((repo) => repo.name)).toEqual(["reboisasi"]);
  });

  it("throws when the GitHub API rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "Forbidden" }, 403))
    );

    await expect(fetchGitHubRepos()).rejects.toThrow("403");
  });
});

describe("fetchGitHubProfile", () => {
  it("maps the public profile fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          login: "naidrahiqa",
          name: "Naidra",
          bio: "EsTehAnget",
          avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
          html_url: "https://github.com/naidrahiqa",
          followers: 3,
          following: 4,
          public_repos: 27,
          created_at: "2023-04-03T09:41:51Z",
        })
      )
    );

    const profile = await fetchGitHubProfile();

    expect(profile.login).toBe("naidrahiqa");
    expect(profile.public_repos).toBe(27);
    expect(profile.created_at).toBe("2023-04-03T09:41:51Z");
  });
});

describe("fetchRepoLanguages", () => {
  it("keeps only positive byte counts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ C: 100, Shell: 25, Empty: 0 }))
    );

    const languages = await fetchRepoLanguages("reboisasi");

    expect(languages).toEqual({ C: 100, Shell: 25 });
  });
});

describe("fetchLatestRelease", () => {
  it("returns release metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          tag_name: "v1.2.0",
          html_url: "https://github.com/naidrahiqa/selene-releases/releases/tag/v1.2.0",
          name: "v1.2.0",
          published_at: "2026-11-01T00:00:00Z",
        })
      )
    );

    const release = await fetchLatestRelease("selene-releases");

    expect(release?.tag_name).toBe("v1.2.0");
    expect(release?.published_at).toBe("2026-11-01T00:00:00Z");
  });

  it("returns null when a repository has no releases", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "Not Found" }, 404))
    );

    await expect(fetchLatestRelease("reboisasi")).resolves.toBeNull();
  });
});

describe("fetchLatestCommit", () => {
  it("keeps the subject line and commit date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([
          {
            sha: "abc123",
            commit: {
              message: "feat: add MT6769 support\n\nLong body",
              committer: { date: "2026-11-20T22:11:51Z" },
            },
          },
        ])
      )
    );

    const commit = await fetchLatestCommit("android_kernel_xiaomi_mt6769");

    expect(commit).toEqual({
      sha: "abc123",
      message: "feat: add MT6769 support",
      committed_at: "2026-11-20T22:11:51Z",
    });
  });

  it("returns null for empty repositories", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([])));

    await expect(fetchLatestCommit("empty-repo")).resolves.toBeNull();
  });
});

describe("enrichGitHubRepos", () => {
  it("spends the budget on languages first", async () => {
    const fetchMock = mockEnrichmentFetch();
    vi.stubGlobal("fetch", fetchMock);

    const repos = [makeRepo("a"), makeRepo("b")];
    const result = await enrichGitHubRepos(repos, { budget: 2 });

    expect(result.completed).toBe(2);
    expect(result.requested).toBe(2);
    expect(result.skipped).toBe(4);
    expect(result.byRepo.get("a")?.languages).toEqual({ C: 100, Shell: 25 });
    expect(result.byRepo.get("a")?.releaseFetched).toBe(false);
    expect(result.byRepo.get("b")?.languages).toEqual({ C: 100, Shell: 25 });
  });

  it("fills releases and commits when the budget allows", async () => {
    vi.stubGlobal("fetch", mockEnrichmentFetch());

    const result = await enrichGitHubRepos([makeRepo("a")], { budget: 3 });
    const entry = result.byRepo.get("a");

    expect(result.completed).toBe(3);
    expect(entry?.release?.tag_name).toBe("v1");
    expect(entry?.releaseFetched).toBe(true);
    expect(entry?.commit?.message).toBe("feat: x");
    expect(entry?.commitFetched).toBe(true);
  });

  it("marks a missing release as fetched instead of failing", async () => {
    vi.stubGlobal("fetch", mockEnrichmentFetch({ failRelease: true }));

    const result = await enrichGitHubRepos([makeRepo("a")], { budget: 3 });
    const entry = result.byRepo.get("a");

    expect(entry?.release).toBeNull();
    expect(entry?.releaseFetched).toBe(true);
    expect(result.failed).toBe(0);
  });

  it("keeps partial data when an enrichment request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.endsWith("/languages")) return jsonResponse({ C: 1 });
        return jsonResponse({ message: "Server Error" }, 500);
      })
    );

    const result = await enrichGitHubRepos([makeRepo("a")], { budget: 3 });

    expect(result.byRepo.get("a")?.languages).toEqual({ C: 1 });
    expect(result.failed).toBe(2);
  });
});

function makeRepo(name: string): GitHubRepo {
  return {
    name,
    description: null,
    html_url: `https://github.com/naidrahiqa/${name}`,
    homepage: null,
    language: null,
    topics: [],
    stargazers_count: 0,
    watchers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    size: 0,
    license: null,
    default_branch: "main",
    fork: false,
    archived: false,
    created_at: "2026-01-01T00:00:00Z",
    pushed_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  };
}

function mockFetchPages(pages: GitHubRepo[][]) {
  return vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const page = Number(url.searchParams.get("page") ?? "1");
    return jsonResponse(pages[page - 1] ?? []);
  });
}

function mockEnrichmentFetch(options: { failRelease?: boolean } = {}) {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith("/languages")) {
      return jsonResponse({ C: 100, Shell: 25 });
    }

    if (url.includes("/releases/latest")) {
      if (options.failRelease) {
        return jsonResponse({ message: "Not Found" }, 404);
      }
      return jsonResponse({
        tag_name: "v1",
        html_url: "https://github.com/naidrahiqa/a/releases/tag/v1",
        name: "v1",
        published_at: "2026-11-01T00:00:00Z",
      });
    }

    if (url.includes("/commits")) {
      return jsonResponse([
        {
          sha: "abc",
          commit: {
            message: "feat: x",
            committer: { date: "2026-11-20T00:00:00Z" },
          },
        },
      ]);
    }

    throw new Error(`Unexpected URL: ${url}`);
  });
}
