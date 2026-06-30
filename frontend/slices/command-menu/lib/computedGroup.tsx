import { Equal, ArrowLeftRight } from "lucide-react";
import { evaluate } from "./calc";
import { convert } from "./convert";
import type { CommandGroup, CommandItem } from "./types";

/** Inline "Result" group for the live query: a math answer (= 42) or a unit
    conversion (10 km becomes 6.21 mi). Reuses the pure, dependency-free
    calc/convert helpers. The query is embedded in `value` so the cmdk fuzzy
    filter always surfaces the row. Returns null when the query is not
    computable, so consumers can spread `[...(buildComputedGroup(q) ? [g] : [])]`
    onto their groups without a junk row appearing on plain search text. */
export function buildComputedGroup(query: string): CommandGroup | null {
  const q = query.trim();
  if (!q) return null;
  const items: CommandItem[] = [];

  const n = evaluate(q);
  if (n !== null) {
    items.push({
      id: "calc:result",
      value: `${q} = ${n}`,
      label: `= ${n}`,
      icon: <Equal className="size-4" />,
      trailing: <span className="text-xs text-muted-foreground">Copy</span>,
      onSelect: () => { void navigator.clipboard?.writeText(String(n)); },
    });
  }

  const c = convert(q);
  if (c !== null) {
    items.push({
      id: "calc:convert",
      value: `${q} ${c}`,
      label: c,
      icon: <ArrowLeftRight className="size-4" />,
      trailing: <span className="text-xs text-muted-foreground">Copy</span>,
      onSelect: () => { void navigator.clipboard?.writeText(c); },
    });
  }

  return items.length ? { id: "result", heading: "Result", items } : null;
}
