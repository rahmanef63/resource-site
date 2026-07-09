"use client";
// glass-desktop — device-audio (media, W). Ported from Lucent v4. Rows of output
// devices, each a lucide glyph + label + a shadcn Slider that drives the shown
// level (the sliders move visually). Levels are local UI state, per-device accent
// colours the range via an inline --primary override. Content only — the canvas
// supplies the glass shell.
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Laptop, Headphones, Monitor } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  deviceAudio,
  type DeviceKey,
} from "@/features/glass-desktop/lib/seeds/media-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const ICONS: Record<DeviceKey, LucideIcon> = {
  laptop: Laptop,
  buds: Headphones,
  display: Monitor,
};

export function DeviceAudio(_props: WidgetProps) {
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(deviceAudio.map((d) => [d.key, d.level])),
  );

  return (
    <div className="flex h-full w-full flex-col justify-between gap-2">
      {deviceAudio.map((d) => {
        const Icon = ICONS[d.key];
        const level = levels[d.key] ?? d.level;
        return (
          <div key={d.key} className="flex items-center gap-2.5">
            <Icon
              aria-hidden
              className="size-4 shrink-0"
              style={{ color: "var(--color-ink-mid)" }}
            />
            <span
              className="w-12 shrink-0 truncate text-xs font-medium"
              style={{ color: "var(--color-ink-hi)" }}
            >
              {d.label}
            </span>
            <Slider
              value={[level]}
              min={0}
              max={100}
              step={1}
              aria-label={`${d.label} level`}
              onValueChange={([v]) => setLevels((prev) => ({ ...prev, [d.key]: v }))}
              className="flex-1"
              style={{ ["--primary" as string]: d.accent }}
            />
            <span
              className="w-9 shrink-0 text-right text-[11px] tabular-nums"
              style={{ fontFamily: "var(--font-numeric)", color: "var(--color-ink-mid)" }}
            >
              {level}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
