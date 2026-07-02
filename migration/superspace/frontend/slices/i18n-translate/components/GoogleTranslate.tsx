"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { GoogleTranslateProps } from "../lib/types";
import {
  DEFAULT_LANGUAGES,
  DEFAULT_TRIGGER_CLASS,
  DEFAULT_MENU_CLASS,
  DEFAULT_ITEM_CLASS,
  DEFAULT_ACTIVE_ITEM_CLASS,
} from "../lib/defaults";
import { useGoogleTranslate } from "../hooks/useGoogleTranslate";

/**
 * Google Translate widget — drop-in language switcher with on-the-fly
 * translation to any of a curated locale list. All project-specific
 * styling is prop-driven; defaults use plain Tailwind utilities so the
 * widget renders sanely without any preset.
 *
 * See README.md for the CSP allowlist the consumer's middleware/proxy
 * must add for Google's scripts to load.
 */
export function GoogleTranslate({
  pageLanguage = "id",
  languages = DEFAULT_LANGUAGES,
  storageKey = "google-translate-lang",
  triggerClassName = DEFAULT_TRIGGER_CLASS,
  menuClassName = DEFAULT_MENU_CLASS,
  itemClassName = DEFAULT_ITEM_CLASS,
  activeItemClassName = DEFAULT_ACTIVE_ITEM_CLASS,
  ariaLabelPrefix = "Language:",
  fallbackRefresh = "reload",
}: GoogleTranslateProps) {
  const { current, setLang, mountId } = useGoogleTranslate({
    pageLanguage,
    languages,
    storageKey,
  });
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handlePick(lang: string) {
    setOpen(false);
    void setLang(lang, fallbackRefresh);
  }

  const currentEntry = languages.find((l) => l.code === current);
  const currentShort =
    current === pageLanguage
      ? pageLanguage.toUpperCase()
      : current.split("-")[0].toUpperCase();

  return (
    // `notranslate` + `translate="no"` keep Google from re-translating our
    // own dropdown labels — otherwise "Bahasa Indonesia" would get rewritten
    // when the user picked Japanese.
    <div ref={wrapperRef} className="relative notranslate" translate="no">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${ariaLabelPrefix} ${currentEntry?.label ?? current}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={triggerClassName}
      >
        {currentShort}
        <ChevronDown className="size-3" aria-hidden />
      </button>
      {open && (
        <ul role="menu" className={menuClassName}>
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.code === current}
                onClick={() => handlePick(l.code)}
                className={
                  itemClassName +
                  (l.code === current ? ` ${activeItemClassName}` : "")
                }
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Google injects the actual combo + iframe into this hidden mount. */}
      <div id={mountId} aria-hidden="true" className="sr-only" />
    </div>
  );
}
