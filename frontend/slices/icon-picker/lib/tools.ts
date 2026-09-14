import { ALL_EMOJIS } from "./emoji-catalog";
import { ALL_LUCIDE } from "./lucide-catalog";
import { ALL_PHOSPHOR } from "./phosphor-catalog";
import { lucideValue, phosphorValue } from "./parse";

export type IconPickerCtx = {
  pick: (value: string) => void;
};

type ToolParams = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const schema = (properties: Record<string, unknown>, required: string[] = []): ToolParams => ({
  type: "object", properties, required, additionalProperties: false,
});
const text = (description: string, values?: readonly string[]) => ({
  type: "string",
  description,
  ...(values ? { enum: [...values] } : {}),
});
const number = (description: string, min: number, max: number) => ({
  type: "number", description, minimum: min, maximum: max,
});

const SETS = {
  lucide: ALL_LUCIDE,
  phosphor: ALL_PHOSPHOR,
  emoji: ALL_EMOJIS,
} as const;

export const iconPickerTools = {
  namespace: "icon-picker",
  instructions:
    "Icon chooser. Search by keyword across the icon sets, then pick the exact returned value; do not guess icon names.",
  tools: [
    {
      name: "search",
      description: "Search the icon catalogues (lucide, phosphor, emoji).",
      parameters: schema({
        query: text("search text (icon name substring)"),
        set: text("catalogue", ["lucide", "phosphor", "emoji"]),
        limit: number("max results (default 20)", 1, 100),
      }, ["query"]),
      run: (_ctx: IconPickerCtx, args: Record<string, unknown>) => {
        const query = String(args.query).toLowerCase();
        const max = typeof args.limit === "number" ? args.limit : 20;
        const keys = args.set
          ? [String(args.set) as keyof typeof SETS]
          : (Object.keys(SETS) as Array<keyof typeof SETS>);
        const hits = keys.flatMap((key) =>
          SETS[key]
            .filter((name) => name.toLowerCase().includes(query))
            .slice(0, max)
            .map((name) => `${key}:${name}`),
        );
        return hits.slice(0, max).join(", ") || "no matches";
      },
    },
    {
      name: "pick",
      description: "Pick an icon by set + name (applies it via the host's onChange).",
      parameters: schema({
        set: text("catalogue", ["lucide", "phosphor", "emoji"]),
        name: text("icon name (or the emoji character itself)"),
      }, ["set", "name"]),
      run: (ctx: IconPickerCtx, args: Record<string, unknown>) => {
        const name = String(args.name);
        const value = args.set === "lucide"
          ? lucideValue(name)
          : args.set === "phosphor"
            ? phosphorValue(name)
            : name;
        ctx.pick(value);
        return `picked ${value}`;
      },
    },
  ],
};
