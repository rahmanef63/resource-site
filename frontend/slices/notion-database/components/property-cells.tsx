"use client";

/** Per-type property cell renderers. Split out of NotionProperty so
 *  each type's UI fits in one section and new types can be added
 *  without ballooning the parent. Pure controlled inputs — every
 *  cell takes `value` + `onChange` + `prop` (for options) +
 *  `readOnly`. Returns a ReactNode the host slots inline. */

import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Database, Page, Property, PropertyValue } from "../types";
import { FilesCell } from "./cells/FilesCell";
import { PersonCell } from "./cells/PersonCell";
import { FormulaCell } from "./cells/FormulaCell";
import { MultiSelectCell } from "./cells/MultiSelectCell";
import { SelectCell } from "./cells/SelectCell";
import {
  CreatedTimeCell, LastEditedTimeCell, UniqueIdCell,
} from "./cells/timestamps";

interface CellArgs {
  prop: Property;
  value: PropertyValue;
  readOnly: boolean;
  onChange?: (next: PropertyValue) => void;
  /** Required by formula / created_time / last_edited_time / unique_id
   *  cells (they read row + db metadata, not just value). NotionDatabase
   *  passes these via renderCell — host can omit when rendering cells
   *  outside a row context. */
  row?: Page;
  db?: Database;
  onPropertyChange?: (patch: Partial<Property>) => void;
}

export function renderPropertyCell({
  prop, value, readOnly, onChange, row, db, onPropertyChange,
}: CellArgs): ReactNode {
  switch (prop.type) {
    case "checkbox":
      return (
        <Checkbox
          checked={!!value}
          disabled={readOnly}
          onCheckedChange={(v) => onChange?.(!!v)}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={(value as number | null) ?? ""}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value === "" ? null : Number(e.target.value))}
          className="h-7 text-sm"
        />
      );

    case "select":
    case "status":
      return (
        <SelectCell
          options={prop.options ?? []}
          value={value as string | null}
          readOnly={readOnly}
          onChange={onChange ? (next) => onChange(next) : undefined}
        />
      );

    case "multi_select":
      return (
        <MultiSelectCell
          options={prop.options ?? []}
          value={(Array.isArray(value) ? value : []) as string[]}
          readOnly={readOnly}
          onChange={onChange ? (next) => onChange(next) : undefined}
        />
      );

    case "date": {
      const v = (value && typeof value === "object" && "date" in value ? value.date : null) ?? "";
      return (
        <Input
          type="date"
          value={String(v)}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value ? { date: e.target.value } : null)}
          className="h-7 text-sm"
        />
      );
    }

    case "url":
      return (
        <Input
          type="url"
          inputMode="url"
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="https://…"
          className="h-7 text-sm"
        />
      );

    case "email":
      return (
        <Input
          type="email"
          inputMode="email"
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="name@example.com"
          className="h-7 text-sm"
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          inputMode="tel"
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="+62…"
          className="h-7 text-sm"
        />
      );

    case "files":
      return (
        <FilesCell
          value={(Array.isArray(value) ? value : []) as string[]}
          readOnly={readOnly}
          onChange={onChange ? (next) => onChange(next) : undefined}
        />
      );

    case "person":
      return (
        <PersonCell
          value={(Array.isArray(value) ? value : []) as string[]}
          readOnly={readOnly}
          onChange={onChange ? (next) => onChange(next) : undefined}
        />
      );

    case "formula":
      if (!row || !db) return <span className="text-xs text-muted-foreground/60">—</span>;
      return (
        <FormulaCell
          db={db}
          row={row}
          prop={prop}
          readOnly={readOnly}
          onExpressionChange={onPropertyChange ? (formulaExpression) => onPropertyChange({ formulaExpression }) : undefined}
        />
      );

    case "created_time":
      if (!row) return <span className="text-xs text-muted-foreground/60">—</span>;
      return <CreatedTimeCell row={row} />;

    case "last_edited_time":
      if (!row) return <span className="text-xs text-muted-foreground/60">—</span>;
      return <LastEditedTimeCell row={row} />;

    case "unique_id":
      if (!row || !db) return <span className="text-xs text-muted-foreground/60">—</span>;
      return <UniqueIdCell db={db} row={row} prop={prop} />;

    default:
      return (
        <Input
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-7 text-sm"
        />
      );
  }
}
