"use client";
// glass-desktop — quick-toggles (WP). Five system toggles (Wi-Fi / Bluetooth /
// Focus / Night Shift / Hotspot) persisted to STORAGE.toggles. Ported from
// Lucent v4. Each toggle is a shadcn Toggle (no bare button element).
import { Toggle } from "@/components/ui/toggle";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import {
  TONES,
  quickTogglesDefault,
  quickTogglesSeed,
  type ToggleId,
} from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function QuickToggles(_props: WidgetProps) {
  const [state, setState] = usePersistentState<Record<ToggleId, boolean>>(
    STORAGE.toggles,
    quickTogglesDefault,
  );

  const set = (id: ToggleId, on: boolean) => setState((prev) => ({ ...prev, [id]: on }));

  return (
    <div className="flex h-full items-center justify-between gap-1.5">
      {quickTogglesSeed.map((t) => {
        const on = state[t.id];
        return (
          <Toggle
            key={t.id}
            pressed={on}
            onPressedChange={(v) => set(t.id, v)}
            aria-label={t.label}
            className="flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] border-0 [background:var(--color-glass-lo)] data-[state=on]:[background:var(--color-glass-hi)]"
          >
            <span
              aria-hidden
              className="text-base leading-none"
              style={{ color: on ? TONES[t.tone] : "var(--color-ink-low)" }}
            >
              {t.glyph}
            </span>
            <span
              className="max-w-full truncate text-[10px] font-medium"
              style={{ color: on ? "var(--color-ink-hi)" : "var(--color-ink-low)" }}
            >
              {t.label}
            </span>
          </Toggle>
        );
      })}
    </div>
  );
}
