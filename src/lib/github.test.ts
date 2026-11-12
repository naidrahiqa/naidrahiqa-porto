import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchGitHubRepos,
  prettifyRepoName,
  repoNameFromUrl,
  repoSlug,
  repoTimestamp,
  type GitHubRepo,
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

function makeRepo(name: string): GitHubRepo {
  return {
    name,
    description: null,
    html_url: `https://github.com/naidrahiqa/${name}`,
    homepage: null,
    language: null,
    topics: [],
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    archived: false,
    pushed_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  };
}

function mockFetchPages(pages: GitHubRepo[][]) {
  return vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const page = Number(url.searchParams.get("page") ?? "1");
    return {
      ok: true,
      status: 200,
      json: async () => pages[page - 1] ?? [],
    } as Response;
  });
}

describe("fetchGitHubRepos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
      vi.fn(async () => ({ ok: false, status: 403 }) as Response)
    );

    await expect(fetchGitHubRepos()).rejects.toThrow("403");
  });
});
