// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";

type Dict = Record<string, string>;
type Loader = () => Promise<Dict> | Dict;

type Ctx = {
  lang: string;
  setLang: (l: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = React.createContext<Ctx | null>(null);

const KEY = "rresource:i18n:lang";

export function I18nProvider({
  defaultLang,
  loaders,
  children,
}: {
  defaultLang: string;
  loaders: Record<string, Loader>;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = React.useState<string>(() => {
    if (typeof window === "undefined") return defaultLang;
    return window.localStorage.getItem(KEY) ?? defaultLang;
  });
  const [dict, setDict] = React.useState<Dict>({});

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const loader = loaders[lang];
      if (!loader) return;
      const d = await loader();
      if (!cancelled) setDict(d);
    })();
    return () => { cancelled = true; };
  }, [lang, loaders]);

  const setLang = React.useCallback((l: string) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, l);
    if (typeof document !== "undefined") document.cookie = `lang=${l}; path=/; max-age=31536000`;
  }, []);

  const t = React.useCallback((key: string, vars?: Record<string, string | number>) => {
    let s = dict[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    return s;
  }, [dict]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside <I18nProvider>");
  return ctx;
}

export function useT() { return useI18n().t; }
