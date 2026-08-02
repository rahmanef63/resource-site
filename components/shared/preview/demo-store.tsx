"use client";

import * as React from "react";

/**
 * createDemoStore — localStorage-backed demo data for variant previews.
 *
 * Lighter sibling of components/templates/_shared createTemplateStore:
 * no reducer, no BroadcastChannel — a preview widget is a single mount.
 * State lives at `rr-demo:<slug>:v<version>`; first mount seeds it, edits
 * write through, reset() clears + reseeds. Client-only (mount previews with
 * `ssr: false`) so the VPS never computes a preview — it just serves the
 * static chunk.
 *
 * ```ts
 * const { useDemoStore } = createDemoStore({ slug: "markdown", seed: SEED });
 * const [doc, setDoc, { ready, reset }] = useDemoStore();
 * ```
 */
export function createDemoStore<S>(opts: {
  slug: string;
  seed: S;
  /** Bump to invalidate stale localStorage shapes after a seed change. */
  version?: number;
}) {
  const key = `rr-demo:${opts.slug}:v${opts.version ?? 1}`;

  function useDemoStore(): [
    S,
    (next: S | ((prev: S) => S)) => void,
    { ready: boolean; reset: () => void },
  ] {
    const [state, setState] = React.useState<S>(opts.seed);
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw != null) setState(JSON.parse(raw) as S);
      } catch {
        // corrupt entry — fall back to seed
      }
      setReady(true);
    }, []);

    const set = React.useCallback((next: S | ((prev: S) => S)) => {
      setState((prev) => {
        const value =
          typeof next === "function" ? (next as (p: S) => S)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // quota / private mode — keep in-memory state
        }
        return value;
      });
    }, []);

    const reset = React.useCallback(() => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
      setState(opts.seed);
    }, []);

    return [state, set, { ready, reset }];
  }

  return { key, useDemoStore };
}
