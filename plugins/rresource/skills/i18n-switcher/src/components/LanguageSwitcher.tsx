// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import { useI18n } from "../i18n/Provider";

type Props = { locales: { code: string; label: string }[]; className?: string };

export function LanguageSwitcher({ locales, className }: Props) {
  const { lang, setLang } = useI18n();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className={className ?? "rounded border bg-background px-2 py-1 text-sm"}
    >
      {locales.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );
}
