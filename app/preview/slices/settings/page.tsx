"use client";

// audit-allow-hex: the accent swatch options are literal color DATA fed to
// AccentSwatches (the adapter contract), not themable chrome.

import * as React from "react";
import { useState } from "react";
import { Wifi } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  SettingsShell,
  createMemoryAdapter,
  AppearancePanel,
  SettingsSection,
  SettingsRow,
  type AppearanceAdapter,
  type SegSetting,
} from "@/features/settings";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

const ACCENTS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function useSeg(initial: string, values: string[]): SegSetting {
  const [value, onChange] = useState(initial);
  return { value, options: values.map((v) => ({ value: v, label: v })), onChange };
}

function AppearanceDemo() {
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
    <div className="mx-auto max-w-xl space-y-6">
      <AppearancePanel appearance={adapter} />
      <SettingsSection icon={<Wifi />} title="Custom section (raw primitives)">
        <SettingsRow label="Proxy host">
          <Input placeholder="proxy.local:8080" className="sm:w-56" />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

export default function Page() {
  const adapter = React.useMemo(
    () =>
      createMemoryAdapter({
        profile: {
          name: "Ada Lovelace",
          email: "ada@analytical.engine",
          bio: "Writing the first algorithm, one note at a time.",
        },
        preferences: { theme: "system", language: "en", density: "comfortable" },
        notifications: { emailDigest: true, productUpdates: false, mentions: true, sms: false },
      }),
    [],
  );

  return (
    <SlicePreviewLayout title="Settings" kind="ui" maxWidth="none">
      <PreviewSection title="account · SettingsShell" hint="async load+save memory adapter — changes persist in-session">
        <SettingsShell adapter={adapter} onDeleteAccount={() => {}} />
      </PreviewSection>
      <PreviewSection title="appearance · AppearancePanel" hint="sync per-setting adapter + raw Section/Row primitives">
        <AppearanceDemo />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
