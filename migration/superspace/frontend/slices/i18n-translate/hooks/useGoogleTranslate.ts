"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "../lib/types";
import { setCookieLang } from "../lib/cookie";
import {
  persistLang,
  readPersistedLang,
  detectBrowserLang,
} from "../lib/storage";
import { ensureStyles } from "../lib/styles";
import { applyWithRetry, ensureScript } from "../lib/widget";

export function useGoogleTranslate(args: {
  pageLanguage: string;
  languages: Lang[];
  storageKey: string;
}): {
  current: string;
  setLang: (
    lang: string,
    fallback?: "router" | "reload" | "none",
  ) => Promise<void>;
  ready: boolean;
  mountId: string;
} {
  const { pageLanguage, languages, storageKey } = args;
  const router = useRouter();
  const [current, setCurrent] = React.useState<string>(pageLanguage);
  const [ready, setReady] = React.useState(false);
  // Per-instance mount id so multiple <GoogleTranslate> instances don't
  // collide. Stable across re-renders via useRef.
  const mountIdRef = React.useRef<string>(
    `google_translate_mount_${Math.random().toString(36).slice(2, 8)}`,
  );

  React.useEffect(() => {
    ensureStyles();
    const initial =
      readPersistedLang(storageKey, languages) ??
      detectBrowserLang(languages, pageLanguage);
    setCurrent(initial);
    setCookieLang(pageLanguage, initial);
    persistLang(storageKey, initial);

    const includedCodes = languages.map((l) => l.code).join(",");
    ensureScript(pageLanguage, includedCodes, mountIdRef.current, () => {
      void applyWithRetry(initial, pageLanguage, 2000).then(() =>
        setReady(true),
      );
    });
  }, [pageLanguage, languages, storageKey]);

  const setLang = React.useCallback(
    async (
      lang: string,
      strategy: "reload" | "router" | "none" = "reload",
    ): Promise<void> => {
      setCookieLang(pageLanguage, lang);
      persistLang(storageKey, lang);
      setCurrent(lang);
      // "reload" — the only path that works reliably across Cache
      // Components static HTML, React re-renders, and Google's fragile
      // in-place dispatch. The cookie we just set is read by Google's
      // widget at init time on the next page load.
      if (strategy === "reload") {
        window.location.reload();
        return;
      }
      // "router" — soft Next refresh. Translation only applies on next
      // hard reload (the surviving widget instance ignores the new cookie).
      if (strategy === "router") {
        router.refresh();
        return;
      }
      // "none" — fragile programmatic dispatch.
      void applyWithRetry(lang, pageLanguage, 1500);
    },
    [pageLanguage, storageKey, router],
  );

  return { current, setLang, ready, mountId: mountIdRef.current };
}
