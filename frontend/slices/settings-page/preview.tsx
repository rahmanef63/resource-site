"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import * as React from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { SettingsShell, type SettingsSection } from "./components/SettingsShell";
import type { SettingsAdapter, SettingsValues } from "./lib/adapter";

const SEED: SettingsValues = {
  profile: {
    name: "Ada Lovelace",
    email: "ada@analytical.engine",
    avatarUrl: undefined,
    bio: "Writing the first algorithm, one note at a time.",
  },
  preferences: { theme: "system", language: "en", density: "comfortable" },
  notifications: {
    emailDigest: true,
    productUpdates: false,
    mentions: true,
    sms: false,
  },
};

const { useDemoStore } = createDemoStore<SettingsValues>({
  slug: "settings-page",
  seed: SEED,
});

/** Bridges the localStorage-backed demo store to the SettingsAdapter shape. */
function useDemoAdapter(): { adapter: SettingsAdapter; ready: boolean } {
  const [values, setValues, { ready }] = useDemoStore();
  const ref = React.useRef(values);
  ref.current = values;

  const adapter = React.useMemo<SettingsAdapter>(
    () => ({
      async load() {
        return ref.current;
      },
      async save(patch) {
        setValues((prev) => ({
          profile: { ...prev.profile, ...patch.profile },
          preferences: { ...prev.preferences, ...patch.preferences },
          notifications: { ...prev.notifications, ...patch.notifications },
        }));
      },
    }),
    [setValues],
  );

  return { adapter, ready };
}

const Demo: SlicePreviewModule["SettingsShell"] = ({ variant }) => {
  const section = (variant.scenario as SettingsSection) ?? "profile";
  const { adapter, ready } = useDemoAdapter();
  if (!ready) return null;
  return (
    <div className="p-4">
      <SettingsShell
        adapter={adapter}
        active={section}
        onDeleteAccount={() => {
          /* demo no-op */
        }}
      />
    </div>
  );
};

const preview: SlicePreviewModule = { SettingsShell: Demo };
export default preview;
