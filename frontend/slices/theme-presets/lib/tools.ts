// Agentic tool collection. Ctx = the ThemePresetProvider surface (what
// useThemePreset() exposes): current preset name + setter. The registry
// itself loads lazily via the slice's own loader (pure read).

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import { loadTweakcnRegistry } from "./tweakcn";

export type ThemePresetsCtx = {
  presetName: string | null;
  setPreset: (name: string | null) => void;
};

export const themePresetsTools = defineToolCollection<ThemePresetsCtx>({
  namespace: "theme-presets",
  instructions: "Theme presets. list_presets/current to read; set_preset applies a theme and clear reverts to default. Visual only.",
  describe: (ctx) => `theme preset: ${ctx.presetName ?? "site default"}`,
  tools: [
    {
      name: "list_presets",
      description: "List the available tweakcn theme presets.",
      parameters: noArgs,
      run: async () => {
        const reg = await loadTweakcnRegistry();
        return reg.items.map((p) => p.name).join(", ");
      },
    },
    {
      name: "current",
      description: "Read the active preset name (null = site default).",
      parameters: noArgs,
      run: (ctx) => ctx.presetName ?? "site default",
    },
    {
      name: "set_preset",
      description: "Apply a theme preset by name.",
      parameters: obj({ "name!": str("preset name (see list_presets)") }),
      run: (ctx, a) => {
        ctx.setPreset(a.name as string);
        return `preset → ${a.name}`;
      },
    },
    {
      name: "clear",
      description: "Clear the visitor preset (back to the site default).",
      parameters: noArgs,
      run: (ctx) => {
        ctx.setPreset(null);
        return "preset cleared";
      },
    },
  ],
});
