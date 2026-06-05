"use client";

import * as React from "react";
import { ArrowUpCircle, CheckCircle2, ExternalLink, Loader2, RefreshCw, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { compareVersions } from "./version";
import type { DeployResult, UpstreamVersion } from "./types";

/**
 * In-app update channel. Compares the running version against the upstream
 * template manifest, and offers a one-click rebuild if the owner wired a
 * Vercel deploy hook.
 *
 * Props-driven (R3): the host injects the two backend calls — typically
 * `useAction(api.update.fetchUpstreamVersion)` and
 * `useAction(api.update.triggerDeploy)` — plus its version constants from
 * lib/headless-core/version.ts.
 *
 * Note: a "Use this template" copy doesn't auto-receive upstream code.
 * Updating the CODE means syncing the GitHub copy (link provided); the
 * Rebuild button re-deploys once that's done (or picks up Convex/env changes).
 */
export function UpdateCard({
  currentVersion,
  upstreamRepoUrl,
  fetchUpstream,
  triggerDeploy,
}: {
  currentVersion: string;
  upstreamRepoUrl: string;
  fetchUpstream: () => Promise<UpstreamVersion | null>;
  triggerDeploy: () => Promise<DeployResult>;
}) {
  const [latest, setLatest] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(true);
  const [deploying, setDeploying] = React.useState(false);

  const check = React.useCallback(async () => {
    setChecking(true);
    try {
      const r = await fetchUpstream();
      setLatest(r?.core ?? null);
    } finally {
      setChecking(false);
    }
  }, [fetchUpstream]);

  React.useEffect(() => {
    void check();
  }, [check]);

  const behind = latest != null && compareVersions(latest, currentVersion) > 0;

  async function rebuild() {
    setDeploying(true);
    try {
      const r = await triggerDeploy();
      if (r.ok) toast.success("Rebuild dimulai — situs akan update dalam beberapa menit.");
      else if (r.reason === "no-hook")
        toast.error("Deploy hook belum di-set. Set VERCEL_DEPLOY_HOOK_URL di Convex env.");
      else toast.error("Gagal memicu rebuild.");
    } finally {
      setDeploying(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-medium">
              <Rocket className="size-4 text-primary" /> Versi & Update
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Versi kamu: <b>v{currentVersion}</b>
              {checking ? (
                <span className="ml-2 inline-flex items-center gap-1 text-xs">
                  <Loader2 className="size-3 animate-spin" /> cek terbaru…
                </span>
              ) : latest ? (
                <span className="ml-2 text-xs">· terbaru: v{latest}</span>
              ) : (
                <span className="ml-2 text-xs">· gagal cek versi terbaru</span>
              )}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void check()} disabled={checking}>
            <RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {behind ? (
          <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <ArrowUpCircle className="size-4" /> Update tersedia (v{latest})
            </p>
            <p className="text-xs text-muted-foreground">
              Update kode: sinkronkan salinan GitHub kamu dengan template asli, lalu
              rebuild. Data Convex kamu tetap aman.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={`${upstreamRepoUrl}/releases`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-1">
                  Lihat rilis <ExternalLink className="size-3" />
                </Button>
              </a>
              <Button size="sm" onClick={rebuild} disabled={deploying} className="gap-1">
                {deploying ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                Rebuild sekarang
              </Button>
            </div>
          </div>
        ) : latest ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" /> Sudah versi terbaru.
          </p>
        ) : null}

        <p className="text-[11px] text-muted-foreground">
          Tombol "Rebuild" butuh <code>VERCEL_DEPLOY_HOOK_URL</code> di Convex env
          (Vercel → Settings → Git → Deploy Hooks → buat hook → salin URL).
        </p>
      </CardContent>
    </Card>
  );
}
