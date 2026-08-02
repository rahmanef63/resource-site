"use client";
import { registerCommands } from "@/features/appshell";
import { loadPresetRegistry, groupPresets } from "./registry";
import { setPreset } from "@/lib/shared/appearance";

/** Every visible preset becomes a ⌘K command ("Theme preset: Claude") plus a
 *  reset command — same zero-wiring pattern as the shell-switch commands.
 *  Call once from the page mount; lazy so the 240KB registry chunk only loads
 *  after first paint. */
export function registerPresetCommands(): void {
  void loadPresetRegistry().then((registry) => {
    const cmds = groupPresets(registry.items).flatMap((g) =>
      g.items.map((p) => ({
        id: `preset:${p.name}`,
        label: `Theme preset: ${p.title}`,
        hint: g.label,
        keywords: `theme color preset ${p.name}`,
        run: () => setPreset(p.name),
      })),
    );
    registerCommands("theme-presets", [
      ...cmds,
      {
        id: "preset:none",
        label: "Theme preset: Stock",
        hint: "Reset",
        keywords: "theme color preset default stock reset",
        run: () => setPreset(null),
      },
    ]);
  });
}
