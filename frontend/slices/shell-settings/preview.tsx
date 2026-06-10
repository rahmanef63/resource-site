"use client";

// audit-allow-hex: the accent swatch options are literal color DATA fed to
// AccentSwatches (the adapter contract), not themable chrome.
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import { useState } from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { AppearancePanel } from "./index";
import type { AppearanceAdapter, SegSetting } from "./lib/types";

const ACCENTS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function useSeg(initial: string, values: string[]): SegSetting {
  const [value, onChange] = useState(initial);
  return { value, options: values.map((v) => ({ value: v, label: v })), onChange };
}

function PanelDemo({ scenario }: { scenario: string }) {
  const style = useSeg("macOS", ["macOS", "Windows", "Flat"]);
  const theme = useSeg("dark", ["light", "dark", "auto"]);
  const wallpaper = useSeg("aurora", ["aurora", "dunes", "mono"]);
  const device = useSeg("auto", ["auto", "desktop", "mobile"]);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [reduce, setReduce] = useState(false);

  const adapter: AppearanceAdapter =
    scenario === "minimal"
      ? { style, theme }
      : {
          style,
          theme,
          accent: { value: accent, options: ACCENTS, onChange: setAccent },
          wallpaper,
          device,
          reduceTransparency: { value: reduce, onChange: setReduce },
        };
  return <AppearancePanel appearance={adapter} />;
}

const preview: SlicePreviewModule = {
  AppearancePanel: ({ variant }) => {
    const scenario = variant.scenario ?? "full-adapter";
    return (
      <div className="p-4">
        <div className="max-w-md space-y-6 rounded-lg border border-border p-4">
          <PanelDemo key={scenario} scenario={scenario} />
        </div>
      </div>
    );
  },
};

export default preview;
