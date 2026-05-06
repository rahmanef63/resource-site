"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

function viewportClass(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/**
 * Privacy-respecting page-view beacon. Fires once per pathname change.
 * No cookie, no fingerprint — just URL + referrer host + viewport bucket.
 * Skipped on /admin/* (mutation also rejects those server-side).
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const ingest = useMutation((api as any).slices.analytics.ingest);
  const lastSent = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const send = () => {
      ingest({
        path: pathname,
        referrer: document.referrer || undefined,
        viewport: viewportClass(),
        // Country hint via Intl — coarse but cookieless.
        country: (() => {
          try {
            const region = new Intl.Locale(navigator.language).region;
            return region && /^[A-Z]{2}$/.test(region) ? region : undefined;
          } catch {
            return undefined;
          }
        })(),
      }).catch(() => {});
    };

    // Defer so the beacon doesn't compete with first paint.
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(send, { timeout: 2000 });
    } else {
      setTimeout(send, 1500);
    }
  }, [pathname, ingest]);

  return null;
}
