import type { Lang } from "./types";

export function persistLang(storageKey: string, lang: string): void {
  try {
    localStorage.setItem(storageKey, lang);
  } catch {
    /* incognito or storage disabled — ignore */
  }
}

export function readPersistedLang(
  storageKey: string,
  allowed: Lang[],
): string | null {
  try {
    const v = localStorage.getItem(storageKey);
    if (v && allowed.some((l) => l.code === v)) return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function detectBrowserLang(allowed: Lang[], pageLang: string): string {
  if (typeof navigator === "undefined") return pageLang;
  const nav = (navigator.language || pageLang).toLowerCase();
  if (nav.startsWith(pageLang.toLowerCase())) return pageLang;
  const exact = allowed.find((l) => l.code.toLowerCase() === nav);
  if (exact) return exact.code;
  const base = nav.split("-")[0];
  const partial = allowed.find(
    (l) => l.code.toLowerCase().split("-")[0] === base,
  );
  if (partial) return partial.code;
  return allowed.find((l) => l.code === "en")?.code ?? pageLang;
}
