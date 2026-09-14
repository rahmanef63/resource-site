import type { SettingsValues } from "./adapter";

export type SettingsPageCtx = {
  values: SettingsValues | null;
  save: (patch: Partial<SettingsValues>) => Promise<void>;
};

type ObjectSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const noArgs: ObjectSchema = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
};

const setArgs: ObjectSchema = {
  type: "object",
  properties: {
    patch: {
      type: "string",
      description: "partial SettingsValues as JSON",
    },
  },
  required: ["patch"],
  additionalProperties: false,
};

const describe = (ctx: SettingsPageCtx): string =>
  ctx.values ? `settings loaded: ${JSON.stringify(ctx.values)}` : "settings loading";

/** Framework-neutral structural tool collection; register it with any compatible host. */
export const settingsPageTools = {
  namespace: "settings-page",
  instructions: "App settings. get before set; set persists immediately.",
  describe,
  tools: [
    {
      name: "get",
      description: "Read the current settings values (profile, preferences, notifications).",
      parameters: noArgs,
      run: (ctx: SettingsPageCtx) => (ctx.values ? JSON.stringify(ctx.values) : "still loading"),
    },
    {
      name: "set",
      description: "Save a settings patch encoded as partial SettingsValues JSON.",
      parameters: setArgs,
      run: async (ctx: SettingsPageCtx, args: Record<string, unknown>) => {
        const patch = JSON.parse(String(args.patch)) as Partial<SettingsValues>;
        await ctx.save(patch);
        return `saved: ${JSON.stringify(patch)}`;
      },
    },
  ],
};
