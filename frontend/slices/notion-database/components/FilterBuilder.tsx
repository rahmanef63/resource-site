"use client";

/** FilterBuilder — popover UI for a view's filter list. Pure props —
 *  parent owns persistence (DatabaseViewConfig.filters). Filters apply
 *  AND-style (every row must match every filter).
 *
 *  Op picker is scoped to the chosen property's type. Value input
 *  switches per type (text / number / date / select multi-checkbox /
 *  none for is_empty/checked/etc). When a between op is picked, the
 *  value renders as two inputs (joined with `|` in storage). */

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import type {
  Database,
  DatabaseFilter,
  DatabaseFilterOp,
  Property,
  PropertyType,
} from "../types";

type OpDef = { value: DatabaseFilterOp; label: string; needsValue: "none" | "single" | "between" | "select" };

const TEXT_OPS: OpDef[] = [
  { value: "contains",         label: "contains",        needsValue: "single" },
  { value: "does_not_contain", label: "does not contain", needsValue: "single" },
  { value: "starts_with",      label: "starts with",     needsValue: "single" },
  { value: "ends_with",        label: "ends with",       needsValue: "single" },
  { value: "equals",           label: "equals",          needsValue: "single" },
  { value: "not_equals",       label: "does not equal",  needsValue: "single" },
  { value: "is_empty",         label: "is empty",        needsValue: "none" },
  { value: "not_empty",        label: "is not empty",    needsValue: "none" },
];

const NUMBER_OPS: OpDef[] = [
  { value: "equals",     label: "=",                 needsValue: "single" },
  { value: "not_equals", label: "≠",                 needsValue: "single" },
  { value: "gt",         label: ">",                 needsValue: "single" },
  { value: "gte",        label: "≥",                 needsValue: "single" },
  { value: "lt",         label: "<",                 needsValue: "single" },
  { value: "lte",        label: "≤",                 needsValue: "single" },
  { value: "between",    label: "between",           needsValue: "between" },
  { value: "is_empty",   label: "is empty",          needsValue: "none" },
  { value: "not_empty",  label: "is not empty",      needsValue: "none" },
];

const DATE_OPS: OpDef[] = [
  { value: "on",         label: "on",                needsValue: "single" },
  { value: "before",     label: "before",            needsValue: "single" },
  { value: "after",      label: "after",             needsValue: "single" },
  { value: "between",    label: "between",           needsValue: "between" },
  { value: "is_today",   label: "is today",          needsValue: "none" },
  { value: "past_week",  label: "in past week",      needsValue: "none" },
  { value: "next_week",  label: "in next week",      needsValue: "none" },
  { value: "is_empty",   label: "is empty",          needsValue: "none" },
  { value: "not_empty",  label: "is not empty",      needsValue: "none" },
];

const SELECT_OPS: OpDef[] = [
  { value: "is_any_of",  label: "is any of",         needsValue: "select" },
  { value: "is_none_of", label: "is none of",        needsValue: "select" },
  { value: "equals",     label: "equals",            needsValue: "select" },
  { value: "is_empty",   label: "is empty",          needsValue: "none" },
  { value: "not_empty",  label: "is not empty",      needsValue: "none" },
];

const CHECKBOX_OPS: OpDef[] = [
  { value: "checked",    label: "is checked",        needsValue: "none" },
  { value: "unchecked",  label: "is unchecked",      needsValue: "none" },
];

function opsForType(t: PropertyType | undefined): OpDef[] {
  switch (t) {
    case "number":       return NUMBER_OPS;
    case "date":         return DATE_OPS;
    case "select":
    case "multi_select":
    case "status":       return SELECT_OPS;
    case "checkbox":     return CHECKBOX_OPS;
    default:             return TEXT_OPS;
  }
}

function inputTypeForProp(t: PropertyType | undefined): string {
  if (t === "number")   return "number";
  if (t === "date")     return "date";
  if (t === "url")      return "url";
  if (t === "email")    return "email";
  if (t === "phone")    return "tel";
  return "text";
}

export interface FilterBuilderProps {
  db: Database;
  filters: DatabaseFilter[];
  onChange: (next: DatabaseFilter[]) => void;
}

export function FilterBuilder({ db, filters, onChange }: FilterBuilderProps) {
  const addFilter = () => {
    const prop = db.properties[0];
    if (!prop) return;
    const ops = opsForType(prop.type);
    onChange([...filters, { propertyId: prop.id, op: ops[0]!.value, value: "" }]);
  };
  const remove = (i: number) => onChange(filters.filter((_, j) => j !== i));
  const update = (i: number, patch: Partial<DatabaseFilter>) =>
    onChange(filters.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  return (
    <div className="min-w-[360px] space-y-2 p-2">
      <div className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Filters
      </div>
      {filters.length === 0 && (
        <div className="px-1 text-xs text-muted-foreground">No filters applied.</div>
      )}
      {filters.map((f, i) => {
        const prop = db.properties.find((p) => p.id === f.propertyId);
        const ops = opsForType(prop?.type);
        const opMeta = ops.find((o) => o.value === f.op) ?? ops[0];
        return (
          <div key={i} className="flex flex-wrap items-center gap-1.5">
            <Select
              value={f.propertyId}
              onValueChange={(v) => {
                const next = db.properties.find((p) => p.id === v);
                const allowed = opsForType(next?.type);
                const opStillValid = allowed.some((o) => o.value === f.op);
                update(i, {
                  propertyId: v,
                  op: opStillValid ? f.op : allowed[0]!.value,
                  value: "",
                });
              }}
            >
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                {db.properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={f.op} onValueChange={(v) => update(i, { op: v as DatabaseFilterOp, value: "" })}>
              <SelectTrigger className="h-7 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ops.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ValueInput
              prop={prop}
              op={f.op}
              kind={opMeta?.needsValue ?? "single"}
              value={f.value ?? ""}
              onChange={(value) => update(i, { value })}
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => remove(i)}
              className="h-auto w-auto rounded p-1 text-muted-foreground hover:bg-accent"
              aria-label="Remove filter"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={addFilter}
        className="mt-1 h-auto gap-1 px-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        <Plus className="h-3 w-3" /> Add filter
      </Button>
    </div>
  );
}

function ValueInput({
  prop, op, kind, value, onChange,
}: {
  prop: Property | undefined;
  op: DatabaseFilterOp;
  kind: "none" | "single" | "between" | "select";
  value: string;
  onChange: (next: string) => void;
}) {
  if (kind === "none") return null;
  if (kind === "between") {
    const [a = "", b = ""] = value.split("|");
    const inputType = inputTypeForProp(prop?.type);
    return (
      <div className="flex items-center gap-1">
        <Input
          type={inputType}
          value={a}
          onChange={(e) => onChange(`${e.target.value}|${b}`)}
          className="h-7 w-20 text-xs"
          placeholder="min"
        />
        <span className="text-[10px] text-muted-foreground">to</span>
        <Input
          type={inputType}
          value={b}
          onChange={(e) => onChange(`${a}|${e.target.value}`)}
          className="h-7 w-20 text-xs"
          placeholder="max"
        />
      </div>
    );
  }
  if (kind === "select" && (prop?.type === "select" || prop?.type === "multi_select" || prop?.type === "status")) {
    return <SelectOptionPicker prop={prop} value={value} onChange={onChange} multi={op !== "equals"} />;
  }
  return (
    <Input
      type={inputTypeForProp(prop?.type)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-32 text-xs"
      placeholder="value"
    />
  );
}

function SelectOptionPicker({
  prop, value, onChange, multi,
}: {
  prop: Property;
  value: string;
  onChange: (next: string) => void;
  multi: boolean;
}) {
  const selected = value ? value.split(",").filter(Boolean) : [];
  const options = prop.options ?? [];
  const toggle = (id: string) => {
    if (!multi) {
      onChange(selected[0] === id ? "" : id);
      return;
    }
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next.join(","));
  };
  const label = selected.length === 0
    ? "Pick options"
    : selected
        .map((id) => options.find((o) => o.id === id)?.name ?? id)
        .join(", ");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 w-40 justify-start truncate px-2 text-xs font-normal">
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        {options.length === 0 && (
          <div className="px-2 py-2 text-[11px] text-muted-foreground">No options defined.</div>
        )}
        {options.map((opt) => {
          const id = `filter-opt-${prop.id}-${opt.id}`;
          return (
            <label
              key={opt.id}
              htmlFor={id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent"
            >
              <Checkbox
                id={id}
                checked={selected.includes(opt.id)}
                onCheckedChange={() => toggle(opt.id)}
              />
              <span className="truncate">{opt.name}</span>
            </label>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
