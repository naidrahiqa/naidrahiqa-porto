"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { Button } from "@/components/admin/ui";

interface SyncResult {
  ok?: boolean;
  total?: number;
  created?: number;
  updated?: number;
  archived?: number;
  enriched?: number;
  profile?: boolean;
  warnings?: string[];
  error?: string;
}

interface RepoSyncButtonProps {
  endpoint: string;
  label: string;
  providerName: string;
}

function RepoSyncButton({ endpoint, label, providerName }: RepoSyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function sync() {
    setLoading(true);
    try {
      const response = await fetch(endpoint, { method: "POST" });
      const data = (await response.json()) as SyncResult;

      if (!response.ok || !data.ok) {
        toast("error", data.error ?? `${providerName} sync failed`);
        return;
      }

      const parts = [
        `${data.created ?? 0} new`,
        `${data.updated ?? 0} updated`,
        ...(typeof data.archived === "number" ? [`${data.archived} archived`] : []),
      ];
      const enriched =
        (data.enriched ?? 0) > 0 ? `, ${data.enriched} enriched` : "";

      toast("success", `${providerName} sync: ${parts.join(", ")}${enriched}`);

      const blocking = (data.warnings ?? []).filter(
        (warning) =>
          warning.includes("failed") ||
          warning.includes("skipped") ||
          warning.includes("could not be refreshed")
      );
      if (blocking.length > 0) {
        toast("error", blocking.join(" "));
      }
      router.refresh();
    } catch {
      toast("error", `${providerName} sync failed`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={sync} disabled={loading}>
      <RefreshCw size={15} className={loading ? "animate-spin" : undefined} />
      {loading ? "Syncing..." : label}
    </Button>
  );
}

export function GitHubSyncButton() {
  return (
    <RepoSyncButton
      endpoint="/api/admin/github/sync"
      label="Sync GitHub"
      providerName="GitHub"
    />
  );
}

export function GitLabSyncButton() {
  return (
    <RepoSyncButton
      endpoint="/api/admin/gitlab/sync"
      label="Sync GitLab"
      providerName="GitLab"
    />
  );
}
