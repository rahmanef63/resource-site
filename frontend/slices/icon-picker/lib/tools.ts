// Agentic tool collection. Catalogue search is pure; pick forwards to the
// host's onChange (the same seam the picker components use).

import { defineToolCollection, num, obj, str } from "@/shared/agentic";
import { ALL_LUCIDE } from "./lucide-catalog";
import { ALL_PHOSPHOR } from "./phosphor-catalog";
import { ALL_EMOJIS } from "./emoji-catalog";
import { lucideValue, phosphorValue } from "./parse";

export type IconPickerCtx = {
  /** Apply an IconValue (lucide:<name> / phosphor:<name> / raw emoji). */
  pick: (value: string) => void;
};

const SETS = { lucide: ALL_LUCIDE, phosphor: ALL_PHOSPHOR, emoji: ALL_EMOJIS } as const;

export const iconPickerTools = defineToolCollection<IconPickerCtx>({
  namespace: "icon-picker",
  tools: [
    {
      name: "search",
      description: "Search the icon catalogues (lucide, phosphor, emoji).",
      parameters: obj({
        "query!": str("search text (icon name substring)"),
        set: str("catalogue", { enum: ["lucide", "phosphor", "emoji"] }),
        limit: num("max results (default 20)", { min: 1, max: 100 }),
      }),
      run: (_ctx, a) => {
        const q = (a.query as string).toLowerCase();
        const max = (a.limit as number | undefined) ?? 20;
        const sets = a.set ? [a.set as keyof typeof SETS] : (Object.keys(SETS) as Array<keyof typeof SETS>);
        const hits = sets.flatMap((s) =>
          SETS[s].filter((n) => n.toLowerCase().includes(q)).slice(0, max).map((n) => `${s}:${n}`),
        );
        return hits.slice(0, max).join(", ") || "no matches";
      },
    },
    {
      name: "pick",
      description: "Pick an icon by set + name (applies it via the host's onChange).",
      parameters: obj({
        "set!": str("catalogue", { enum: ["lucide", "phosphor", "emoji"] }),
        "name!": str("icon name (or the emoji character itself)"),
      }),
      run: (ctx, a) => {
        const n = a.name as string;
        const v = a.set === "lucide" ? lucideValue(n) : a.set === "phosphor" ? phosphorValue(n) : n;
        ctx.pick(v);
        return `picked ${v}`;
      },
    },
  ],
});
