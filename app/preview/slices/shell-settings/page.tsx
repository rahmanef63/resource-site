"use client";

// audit-allow-hex: the accent swatch options are literal color DATA fed to
// AccentSwatches (the adapter contract), not themable chrome.

import { useState } from "react";
import { Wifi } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AppearancePanel,
  SettingsSection,
  SettingsRow,
  type AppearanceAdapter,
  type SegSetting,
} from "@/features/shell-settings";

// Live preview: the composed AppearancePanel on an in-page useState adapter
// (every control works), plus a custom section built from the raw primitives.
// Real host: build the AppearanceAdapter from your own appearance store.

const ACCENTS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function useSeg(initial: string, values: string[]): SegSetting {
  const [value, onChange] = useState(initial);
  return { value, options: values.map((v) => ({ value: v, label: v })), onChange };
}

export default function ShellSettingsPreview() {
  const style = useSeg("macOS", ["macOS", "Windows", "Flat"]);
  const theme = useSeg("dark", ["light", "dark", "auto"]);
  const wallpaper = useSeg("aurora", ["aurora", "dunes", "mono"]);
  const device = useSeg("auto", ["auto", "desktop", "mobile"]);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [reduce, setReduce] = useState(false);

  const adapter: AppearanceAdapter = {
    style,
    theme,
    accent: { value: accent, options: ACCENTS, onChange: setAccent },
    wallpaper,
    device,
    reduceTransparency: { value: reduce, onChange: setReduce },
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <AppearancePanel appearance={adapter} />

      <SettingsSection icon={<Wifi />} title="Custom section (raw primitives)">
        <SettingsRow label="Proxy host">
          <Input placeholder="proxy.local:8080" className="sm:w-56" />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
