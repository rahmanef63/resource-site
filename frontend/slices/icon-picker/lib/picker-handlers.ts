/** Pick / commit handler factory for IconPickerInline. Extracted so the
 *  component file stays under the 200 LOC cap. */

import * as React from "react";
import { lucideValue, phosphorValue, parseIconValue, withColor, type IconValue } from "./parse";
import { pushRecent } from "./recents";
import { ALL_EMOJIS } from "./emoji-catalog";
import { ALL_LUCIDE } from "./lucide-catalog";
import { ALL_PHOSPHOR } from "./phosphor-catalog";

export type TopTab = "emoji" | "icon";
export type IconVariant = "lucide" | "phosphor";

export interface PickerHandlerDeps {
  parsed: IconValue;
  tab: TopTab;
  iconVariant: IconVariant;
  currentColor: string | undefined;
  colorEnabled: boolean;
  onChange: (next: string) => void;
  onClear?: () => void;
  onSelect?: () => void;
}

export interface PickerHandlers {
  pickEmoji: (e: string) => void;
  pickLucide: (n: string) => void;
  pickPhosphor: (n: string) => void;
  pickRecent: (v: string) => void;
  pickColor: (hex: string) => void;
  pickRandom: () => void;
  handleClear: () => void;
}

export function buildPickerHandlers(deps: PickerHandlerDeps & { currentValue: string }): PickerHandlers {
  const { parsed, tab, iconVariant, currentColor, colorEnabled, onChange, onClear, onSelect, currentValue } = deps;

  // Commit: fire onChange + close popover synchronously so the user
  // sees an instant response, then push to recents in a low-priority
  // transition so the recents-driven re-render doesn't compete with
  // the close animation. Noop commits (re-picking the active value)
  // short-circuit — keeps cells from re-rendering for nothing.
  function commit(nextValue: string) {
    if (nextValue === currentValue) {
      onSelect?.();
      return;
    }
    onChange(nextValue);
    onSelect?.();
    React.startTransition(() => pushRecent(nextValue));
  }

  return {
    pickEmoji: (e) => commit(withColor(e, undefined)),
    pickLucide: (n) => commit(lucideValue(n, currentColor)),
    pickPhosphor: (n) => commit(phosphorValue(n, currentColor)),
    pickRecent: (v) => {
      const re = parseIconValue(v);
      if (re.kind === "empty") return;
      if (re.color) {
        if (v === currentValue) { onSelect?.(); return; }
        onChange(v);
        onSelect?.();
        React.startTransition(() => pushRecent(v));
        return;
      }
      if (re.kind === "lucide") commit(lucideValue(re.name, currentColor));
      else if (re.kind === "phosphor") commit(phosphorValue(re.name, currentColor));
      else commit(withColor(re.emoji, undefined));
    },
    pickColor: (hex) => {
      if (!colorEnabled) return;
      if (parsed.kind === "lucide") onChange(withColor(`lucide:${parsed.name}`, hex || undefined));
      else if (parsed.kind === "phosphor") onChange(withColor(`phosphor:${parsed.name}`, hex || undefined));
    },
    pickRandom: () => {
      if (tab === "icon") {
        if (iconVariant === "phosphor") {
          const n = ALL_PHOSPHOR[Math.floor(Math.random() * ALL_PHOSPHOR.length)];
          commit(phosphorValue(n, currentColor));
        } else {
          const n = ALL_LUCIDE[Math.floor(Math.random() * ALL_LUCIDE.length)];
          commit(lucideValue(n, currentColor));
        }
      } else {
        const e = ALL_EMOJIS[Math.floor(Math.random() * ALL_EMOJIS.length)];
        commit(withColor(e, undefined));
      }
    },
    handleClear: () => { onClear?.(); onSelect?.(); },
  };
}

export function getSearchPlaceholder(tab: TopTab, iconVariant: IconVariant, iconStyle: "twemoji" | "native"): string {
  if (tab === "icon") {
    return iconVariant === "phosphor" ? "Search phosphor icons (fill)…" : "Search lucide icons (outline)…";
  }
  return iconStyle === "twemoji" ? "Search emoji (twemoji)…" : "Search emoji (native)…";
}

/** Handle arrow-key navigation over data-icon-cell-index siblings. */
export function handleGridArrowKey(
  e: React.KeyboardEvent<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement | null>,
): void {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  const target = e.target as HTMLElement;
  const idxStr = target.getAttribute("data-icon-cell-index");
  if (!idxStr) return;
  const cells = containerRef.current?.querySelectorAll<HTMLElement>("[data-icon-cell-index]");
  if (!cells || cells.length === 0) return;
  const idx = Number(idxStr);
  const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? 8 : -8;
  const next = Math.max(0, Math.min(cells.length - 1, idx + delta));
  if (next === idx) return;
  e.preventDefault();
  cells[next]?.focus();
}
