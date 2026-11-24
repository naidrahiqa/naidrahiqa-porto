import { describe, expect, it } from "vitest";
import {
  countDiffLines,
  extractRepoPathFromUrl,
  isLikelyBinaryContent,
  resolveRepoIdentity,
  sortTreeItems,
  splitCommitMessage,
} from "@/lib/repo-explorer";

describe("repo-explorer helpers", () => {
  it("extracts repo path from GitHub and GitLab URLs", () => {
    expect(
      extractRepoPathFromUrl("https://github.com/naidrahiqa/porto-web")
    ).toBe("naidrahiqa/porto-web");
    expect(
      extractRepoPathFromUrl(
        "https://gitlab.com/mt6768-dev/kernel-modules-6.6/-/tree/dev/xiaomi"
      )
    ).toBe("mt6768-dev/kernel-modules-6.6");
    expect(extractRepoPathFromUrl("https://example.com/foo/bar")).toBeNull();
  });

  it("resolves repo identity for GitHub and GitLab projects", () => {
    const gitlabIdentity = resolveRepoIdentity({
      link: "https://gitlab.com/mt6768-dev/kernel-modules-6.6",
      repo_name: "mt6768-dev/kernel-modules-6.6",
      repo_default_branch: "dev/xiaomi",
    });
    expect(gitlabIdentity).toEqual({
      provider: "gitlab",
      fullPath: "mt6768-dev/kernel-modules-6.6",
      defaultBranch: "dev/xiaomi",
      webUrl: "https://gitlab.com/mt6768-dev/kernel-modules-6.6",
    });

    const githubIdentity = resolveRepoIdentity({
      link: "https://github.com/naidrahiqa/my-tool",
      repo_name: "my-tool",
      repo_default_branch: null,
    });
    expect(githubIdentity).toEqual({
      provider: "github",
      fullPath: "naidrahiqa/my-tool",
      defaultBranch: "main",
      webUrl: "https://github.com/naidrahiqa/my-tool",
    });
  });

  it("splits commit messages into title and body", () => {
    expect(
      splitCommitMessage(
        "usb: typec: tcpc: Fix PD guards\n\nSigned-off-by: Naidrahiqa <naidra@dev>"
      )
    ).toEqual({
      title: "usb: typec: tcpc: Fix PD guards",
      body: "Signed-off-by: Naidrahiqa <naidra@dev>",
    });

    expect(splitCommitMessage("Initial commit")).toEqual({
      title: "Initial commit",
      body: null,
    });
  });

  it("counts diff additions and deletions while ignoring file headers", () => {
    const patch = [
      "--- a/drivers/usb/fusb30x.c",
      "+++ b/drivers/usb/fusb30x.c",
      "@@ -10,4 +10,5 @@",
      " int init_chip(void) {",
      "-  return -1;",
      "+  int ret = probe();",
      "+  return ret;",
      " }",
    ].join("\n");

    expect(countDiffLines(patch)).toEqual({
      additions: 2,
      deletions: 1,
    });
  });

  it("sorts directories before files alphabetically", () => {
    const sorted = sortTreeItems([
      { name: "Makefile", path: "Makefile", type: "file", webUrl: "#" },
      { name: "drivers", path: "drivers", type: "dir", webUrl: "#" },
      { name: "arch", path: "arch", type: "dir", webUrl: "#" },
      { name: "Kconfig", path: "Kconfig", type: "file", webUrl: "#" },
    ]);

    expect(sorted.map((item) => `${item.type}:${item.name}`)).toEqual([
      "dir:arch",
      "dir:drivers",
      "file:Kconfig",
      "file:Makefile",
    ]);
  });

  it("detects binary content by null byte presence", () => {
    expect(isLikelyBinaryContent("int main() { return 0; }")).toBe(false);
    expect(isLikelyBinaryContent("ELF\u0000\u0001\u0002")).toBe(true);
  });
});
