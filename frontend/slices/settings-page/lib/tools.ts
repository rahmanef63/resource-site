// Agentic tool collection. Ctx = the live useSettings() result, so the agent
// edits exactly what the form edits (optimistic save + rollback included).

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import type { SettingsValues } from "./adapter";

export type SettingsPageCtx = {
  values: SettingsValues | null;
  save: (patch: Partial<SettingsValues>) => Promise<void>;
};

export const settingsPageTools = defineToolCollection<SettingsPageCtx>({
  namespace: "settings-page",
  describe: (ctx) => (ctx.values ? `settings loaded: ${JSON.stringify(ctx.values)}` : "settings loading"),
  tools: [
    {
      name: "get",
      description: "Read the current settings values (profile, preferences, notifications).",
      parameters: noArgs,
      run: (ctx) => (ctx.values ? JSON.stringify(ctx.values) : "still loading"),
    },
    {
      name: "set",
      description: "Save a settings patch (JSON, partial SettingsValues — e.g. {\"preferences\":{\"theme\":\"dark\"}}).",
      parameters: obj({ "patch!": str("partial SettingsValues as JSON") }),
      run: async (ctx, a) => {
        const patch = JSON.parse(a.patch as string) as Partial<SettingsValues>;
        await ctx.save(patch);
        return `saved: ${JSON.stringify(patch)}`;
      },
    },
  ],
});
