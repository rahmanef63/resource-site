"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { CrudFieldInput } from "./CrudFieldInput";
import type { FieldDef } from "./types";

/**
 * Field-grid body — used by both CrudFormView (full-page) and
 * CrudRowDialog (modal). No header, no save bar — chrome lives in the
 * caller so they can choose between page-level and dialog-level UX.
 */
export function CrudFormBody<T>({
  fields,
  draft,
  onChange,
}: {
  fields: FieldDef<T>[];
  draft: T;
  /** Called with the field key + the raw input value. The view widens
   *  to `unknown` so the parent doesn't have to thread the
   *  per-field-kind union through React.useState. */
  onChange: (key: keyof T & string, value: unknown) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <FieldRender
          key={f.key}
          field={f}
          value={(draft as Record<string, unknown>)[f.key]}
          onChange={(v) => onChange(f.key as keyof T & string, v)}
        />
      ))}
    </div>
  );
}

function FieldRender<T>({
  field,
  value,
  onChange,
}: {
  field: FieldDef<T>;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const wrapper =
    field.kind === "textarea" || field.kind === "tags" ? "sm:col-span-2" : "";
  return (
    <div className={`space-y-1.5 ${wrapper}`}>
      <Label className="text-xs">{field.label}</Label>
      <CrudFieldInput field={field} value={value} onChange={onChange} />
      {"hint" in field && field.hint && (
        <p className="text-[10px] text-muted-foreground">{field.hint}</p>
      )}
    </div>
  );
}
