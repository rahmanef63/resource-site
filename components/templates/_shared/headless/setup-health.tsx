"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell, StepRow, EnvBlock, HealthFooter } from "./setup-health-ui";
import type { SetupStatus } from "./types";

/**
 * Self-diagnosing setup page (`/setup`). A non-coder opens this and sees, in
 * plain language, exactly what's done and what's left — no terminal, no docs
 * hunting. Each unfinished step links straight to the fix.
 *
 * Detection ladder:
 *  1. convexUrl present?                    (build-time env, host passes it in)
 *  2. Backend deployed? (functions answer)  (useStatus resolves vs throws)
 *  3. Owner claimed / 4. Seeded / 5. Onboarded  (from setup.status)
 *
 * Props-driven (R3): the host supplies `useStatus` — typically
 * `() => useQuery(api.setup.status)` — called INSIDE the error boundary here
 * so a "functions not deployed" throw is still caught and explained.
 */
export function SetupHealth({
  convexUrl,
  useStatus,
  productName,
  coreVersion,
  adminPath = "/admin",
}: {
  convexUrl: string | null | undefined;
  useStatus: () => SetupStatus | undefined;
  productName: string;
  coreVersion: string;
  adminPath?: string;
}) {
  const footer = <HealthFooter productName={productName} coreVersion={coreVersion} adminPath={adminPath} />;
  if (!convexUrl || convexUrl.includes("placeholder")) {
    return (
      <Shell>
        <StepRow state="todo" title="Hubungkan database (Convex)">
          <p className="text-sm text-muted-foreground">
            Website belum tahu alamat database-nya. Di <b>Vercel → Settings →
            Environment Variables</b>, isi dua ini lalu <b>Redeploy</b>:
          </p>
          <EnvBlock />
          <p className="text-xs text-muted-foreground">
            Belum punya nilainya? Buat project di{" "}
            <a className="text-primary underline" href="https://convex.dev" target="_blank" rel="noreferrer">convex.dev</a>{" "}
            — URL ada di Settings, deploy key di Settings → Deploy Keys.
          </p>
        </StepRow>
        {footer}
      </Shell>
    );
  }
  return (
    <Shell>
      <BackendBoundary>
        <Checklist useStatus={useStatus} adminPath={adminPath} />
      </BackendBoundary>
      {footer}
    </Shell>
  );
}

function Checklist({ useStatus, adminPath }: { useStatus: () => SetupStatus | undefined; adminPath: string }) {
  const status = useStatus();
  if (status === undefined) {
    return (
      <div className="grid h-32 place-items-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  const allDone = status.ownerClaimed && status.seeded && status.onboarded;
  return (
    <>
      {allDone && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <CheckCircle2 className="size-5 text-primary" />
          <span>Semua beres — website kamu siap. 🎉</span>
        </div>
      )}
      <StepRow state="done" title="Database terhubung">
        <p className="text-sm text-muted-foreground">Website tersambung ke Convex.</p>
      </StepRow>
      <StepRow state="done" title="Backend ter-deploy">
        <p className="text-sm text-muted-foreground">Fungsi & tabel database aktif.</p>
      </StepRow>
      <StepRow state={status.ownerClaimed ? "done" : "todo"} title="Akun admin diklaim">
        {status.ownerClaimed ? (
          <p className="text-sm text-muted-foreground">Pemilik sudah terdaftar. Pendaftaran admin tertutup.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Daftar sebagai pemilik. Akun pertama otomatis jadi admin — tidak perlu kunci.
            </p>
            <Button asChild size="sm" className="w-fit">
              <Link href={adminPath}>Daftar sebagai pemilik <ArrowRight className="size-4" /></Link>
            </Button>
          </>
        )}
      </StepRow>
      <StepRow state={status.seeded ? "done" : "todo"} title="Konten terisi">
        {status.seeded ? (
          <p className="text-sm text-muted-foreground">Sudah ada konten.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Isi konten contoh dari dashboard (tombol "Isi konten contoh"), atau lewat wizard onboarding.
            </p>
            <Button asChild size="sm" variant="outline" className="w-fit">
              <Link href="/dashboard">Buka dashboard <ArrowRight className="size-4" /></Link>
            </Button>
          </>
        )}
      </StepRow>
      <StepRow state={status.onboarded ? "done" : "todo"} title="Onboarding selesai">
        <p className="text-sm text-muted-foreground">
          {status.onboarded
            ? "Identitas situs sudah diisi."
            : "Lengkapi nama situs, branding, dan kontak di wizard (muncul saat pertama masuk dashboard)."}
        </p>
      </StepRow>
    </>
  );
}

// --- error boundary: backend reachable but functions not deployed ----------
class BackendBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <StepRow state="warn" title="Backend belum ter-deploy">
          <p className="text-sm text-muted-foreground">
            Database tersambung tapi fungsinya belum ada (error <code>Server Error</code>).
            Pastikan <b>CONVEX_DEPLOY_KEY</b> terisi di Vercel, lalu <b>Redeploy</b> —
            build otomatis push fungsi & tabel ke Convex.
          </p>
          <EnvBlock />
        </StepRow>
      );
    }
    return this.props.children;
  }
}
