// glass-desktop — localStorage LayoutStore (Build Plan §6.2).
// SSR-safe (typeof window guard); every read safe-parses; reset scopes to the
// slice's own namespaced keys only.
import { STORAGE } from "@/features/glass-desktop/config/constants";
import type { LayoutStateV1, LayoutStore } from "@/features/glass-desktop/types";

/** Prefix every key the slice owns (STORAGE.* all start with this). */
const NS = "rr:glass-desktop:";

function isLayoutStateV1(value: unknown): value is LayoutStateV1 {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.version === 1 && Array.isArray(v.instances);
}

/** localStorage-backed implementation of the frozen LayoutStore contract. */
export function createLocalStorageStore(): LayoutStore {
  return {
    load(): LayoutStateV1 | null {
      if (typeof window === "undefined") return null;
      try {
        const raw = window.localStorage.getItem(STORAGE.layout);
        if (raw == null) return null;
        const parsed: unknown = JSON.parse(raw);
        // null on corrupt shape OR version !== 1.
        return isLayoutStateV1(parsed) ? parsed : null;
      } catch {
        return null; // corrupt JSON, blocked storage, etc.
      }
    },

    save(state: LayoutStateV1): void {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(STORAGE.layout, JSON.stringify(state));
      } catch {
        // quota / private-mode — silently no-op, layout is non-critical.
      }
    },

    reset(): void {
      if (typeof window === "undefined") return;
      try {
        const ls = window.localStorage;
        const doomed: string[] = [];
        for (let i = 0; i < ls.length; i++) {
          const k = ls.key(i);
          if (k && k.startsWith(NS)) doomed.push(k);
        }
        for (const k of doomed) ls.removeItem(k);
      } catch {
        // ignore — nothing to clean if storage is unreachable.
      }
    },
  };
}
