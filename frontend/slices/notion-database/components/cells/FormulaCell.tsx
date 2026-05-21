"use client";

/** FormulaCell — readonly display of evaluated formula expression.
 *  Click to edit expression in popover; host owns persistence via
 *  onExpressionChange (typically wired to onPropertyUpdate).
 *
 *  Expression syntax: `{{title}}` / `{{Property Name}}` interpolation
 *  plus fn(arg, …) syntax (concat, upper, if, round, …) and `=expr` for
 *  arithmetic. See lib/formula.ts. */

import { useState } from "react";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import type { Database, Page, Property } from "../../types";
import { evaluateFormula } from "../../lib/formula";

interface FormulaCellProps {
  db: Database;
  row: Page;
  prop: Property;
  readOnly?: boolean;
  onExpressionChange?: (next: string) => void;
}

export function FormulaCell({ db, row, prop, readOnly, onExpressionChange }: FormulaCellProps) {
  const expression = prop.formulaExpression ?? "{{title}}";
  const [draft, setDraft] = useState(expression);
  const value = evaluateFormula(expression, row, db);

  const save = () => {
    const next = draft.trim() || "{{title}}";
    if (next !== expression) onExpressionChange?.(next);
  };

  const display = (
    <span className="flex items-center gap-1 text-xs">
      <Calculator className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate">{value || "—"}</span>
    </span>
  );

  if (readOnly || !onExpressionChange) return display;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("flex w-full items-center gap-1 rounded px-2 py-1 text-left hover:bg-accent/50")}
        >
          {display}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Expression</div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-20 w-full resize-none rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
            placeholder="{{title}} · {{Property name}} · upper(x) · =1+2"
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Preview: <span className="font-mono text-foreground">{evaluateFormula(draft, row, db) || "—"}</span></span>
            <button type="submit" className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent">
              Save
            </button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
