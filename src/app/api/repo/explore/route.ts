import { NextRequest, NextResponse } from "next/server";
import type { RepoProvider } from "@/lib/github-meta";
import {
  fetchRepoCommitDetail,
  fetchRepoCommits,
  fetchRepoFileContent,
  fetchRepoOverview,
  fetchRepoTree,
} from "@/lib/repo-explorer";

const REPO_PATH_PATTERN = /^[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)+$/;

function isValidProvider(value: string | null): value is RepoProvider {
  return value === "github" || value === "gitlab";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const provider = searchParams.get("provider");
  const repo = searchParams.get("repo")?.trim() ?? "";
  const action = searchParams.get("action") ?? "overview";
  const branch = searchParams.get("branch")?.trim() || "main";
  const path = searchParams.get("path")?.trim() || "";

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  if (!REPO_PATH_PATTERN.test(repo) || repo.includes("..")) {
    return NextResponse.json({ error: "Invalid repository path" }, { status: 400 });
  }

  try {
    if (action === "overview") {
      const data = await fetchRepoOverview(provider, repo, branch, path);
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      });
    }

    if (action === "tree") {
      const tree = await fetchRepoTree(provider, repo, branch, path);
      const readmeItem = tree.find(
        (item) => item.type === "file" && /^readme(\.(md|txt|rst))?$/i.test(item.name)
      );
      let readme: { path: string; content: string } | null = null;
      if (readmeItem) {
        const file = await fetchRepoFileContent(
          provider,
          repo,
          branch,
          readmeItem.path
        );
        if (file?.content) {
          readme = { path: readmeItem.path, content: file.content };
        }
      }

      return NextResponse.json(
        { tree, readme, path },
        {
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
          },
        }
      );
    }

    if (action === "commits") {
      const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
      const commits = await fetchRepoCommits(provider, repo, branch, page, 15, path);
      return NextResponse.json(
        { commits, page },
        {
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
          },
        }
      );
    }

    if (action === "commit") {
      const sha = searchParams.get("sha")?.trim() || "";
      if (!/^[a-fA-F0-9]{6,64}$/.test(sha)) {
        return NextResponse.json({ error: "Invalid commit SHA" }, { status: 400 });
      }
      const commit = await fetchRepoCommitDetail(provider, repo, sha);
      if (!commit) {
        return NextResponse.json({ error: "Commit not found" }, { status: 404 });
      }
      return NextResponse.json(
        { commit },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    if (action === "file") {
      if (!path) {
        return NextResponse.json({ error: "File path required" }, { status: 400 });
      }
      const file = await fetchRepoFileContent(provider, repo, branch, path);
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      return NextResponse.json(
        { file },
        {
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
          },
        }
      );
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[repo/explore] error", error);
    return NextResponse.json(
      { error: "Failed to fetch repository data" },
      { status: 502 }
    );
  }
}
