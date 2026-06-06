"use client";

import * as React from "react";
import { SettingsShell, createMemoryAdapter } from "@/features/settings-page";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

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
        notifications: {
          emailDigest: true,
          productUpdates: false,
          mentions: true,
          sms: false,
        },
      }),
    [],
  );

  return (
    <SlicePreviewLayout title="Settings Page" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint="memory adapter — changes persist in-session">
        <SettingsShell
          adapter={adapter}
          onDeleteAccount={() => {
            /* wire to your delete-account mutation */
          }}
        />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
