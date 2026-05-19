"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const POLL_MS = 5 * 60 * 1000;
const TOAST_ID = "rr:version-update";

/** Polls `/api/version` and prompts the user to reload when the deployed
 *  build id differs from the one the client booted with. Prevents the
 *  "Failed to load chunk /_next/static/chunks/<hash>.js" class of errors
 *  that hit long-lived tabs after a redeploy.
 *
 *  Mount once near the root. No-op when NEXT_PUBLIC_BUILD_ID isn't set. */
export function VersionWatcher() {
  const bootBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
  const promptedRef = useRef(false);

  useEffect(() => {
    if (!bootBuildId) return;
    let stopped = false;

    async function check() {
      if (stopped || promptedRef.current) return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const { buildId } = (await res.json()) as { buildId: string };
        if (buildId && buildId !== bootBuildId) {
          promptedRef.current = true;
          toast.message("Versi baru tersedia", {
            id: TOAST_ID,
            description: "Muat ulang untuk pakai update terbaru.",
            duration: Infinity,
            icon: <RefreshCw className="h-4 w-4" />,
            action: { label: "Muat ulang", onClick: () => hardReload() },
          });
        }
      } catch {
        // network blip — retry next tick
      }
    }

    const interval = window.setInterval(check, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    const t = window.setTimeout(check, 1500);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, [bootBuildId]);

  return null;
}

/** Hard-reload that defeats HTTP cache + CacheStorage. Adds a transient
 *  query string so HTML is re-fetched from origin, clears any CacheStorage
 *  entries left by stale service workers, then forces a navigation. */
export async function hardReload() {
  try {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    }
  } catch {
    /* ignore */
  }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("_v", String(Date.now()));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}
