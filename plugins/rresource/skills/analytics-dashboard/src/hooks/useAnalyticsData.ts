// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";

export function useAnalyticsDataLocal(key: string, days = 30) {
  return React.useMemo(() => {
    const out: { date: string; signups: number; events: number }[] = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000);
      out.push({
        date: d.toISOString().slice(5, 10),
        signups: Math.round(8 + Math.sin((i + key.length) / 3) * 4 + Math.random() * 3),
        events: Math.round(40 + Math.cos((i + key.length) / 4) * 12 + Math.random() * 6),
      });
    }
    return out;
  }, [key, days]);
}
