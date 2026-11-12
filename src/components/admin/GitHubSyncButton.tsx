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
  error?: string;
}

export function GitHubSyncButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function sync() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/github/sync", {
        method: "POST",
      });
      const data = (await response.json()) as SyncResult;

      if (!response.ok || !data.ok) {
        toast("error", data.error ?? "GitHub sync failed");
        return;
      }

      toast(
        "success",
        `GitHub sync: ${data.created ?? 0} new, ${data.updated ?? 0} updated, ${data.archived ?? 0} archived`
      );
      router.refresh();
    } catch {
      toast("error", "GitHub sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={sync} disabled={loading}>
      <RefreshCw size={15} className={loading ? "animate-spin" : undefined} />
      {loading ? "Syncing..." : "Sync GitHub"}
    </Button>
  );
}
