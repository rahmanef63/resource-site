"use client";

/** Row multi-select checkboxes — `HeaderCheckboxGutter` (header
 *  "select all" w/ indeterminate state) + `RowCheckbox` (per-row
 *  toggle). Both require RowSelectionProvider in the tree.
 *
 *  Why raw <button> not shadcn Button: these need `role="checkbox"` +
 *  `aria-checked="mixed"` for tri-state semantics. Wrapping in
 *  shadcn's <Button> erases the role context, breaking screen reader
 *  announcements. The audit:slices gate carves an exception via
 *  `role="checkbox"` on these two elements only.
 *
 *  Lifted from notion-page-clone CK-1D Phase 5. */

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRowSelection } from "./RowSelectionProvider";

export function HeaderCheckboxGutter({ rowIds }: { rowIds: string[] }) {
  const sel = useRowSelection();
  const total = rowIds.length;
  const selectedCount = rowIds.filter((id) => sel.isSelected(id)).length;
  const state: "checked" | "indeterminate" | "unchecked" =
    selectedCount === 0 ? "unchecked" : selectedCount === total ? "checked" : "indeterminate";
  const onClick = () => {
    if (state === "checked") sel.clear();
    else sel.setIds(rowIds);
  };
  return (
    // eslint-disable-next-line @rr/no-raw-button -- tri-state checkbox semantics
    <button
      type="button"
      role="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state === "checked"}
      aria-label={state === "checked" ? "Clear selection" : "Select all rows"}
      title={state === "checked" ? "Clear selection" : "Select all"}
      onClick={onClick}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-sm border transition",
        state !== "unchecked"
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/40 hover:border-foreground",
      )}
    >
      {state === "checked" && <Check className="h-3 w-3" />}
      {state === "indeterminate" && <Minus className="h-3 w-3" />}
    </button>
  );
}

export function RowCheckbox({ rowId }: { rowId: string }) {
  const sel = useRowSelection();
  const checked = sel.isSelected(rowId);
  const onClick = (e: React.MouseEvent) => { e.stopPropagation(); sel.toggle(rowId); };
  return (
    // eslint-disable-next-line @rr/no-raw-button -- tri-state checkbox semantics
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? "Deselect row" : "Select row"}
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/40 opacity-60 hover:border-foreground group-hover/row:opacity-100",
      )}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );
}
