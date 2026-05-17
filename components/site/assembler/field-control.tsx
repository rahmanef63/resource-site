"use client";

import * as React from "react";
import { Check } from "lucide-react";
import type { ConfigField } from "../feature-context";

export function FieldControl({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string | boolean | string[] | undefined;
  onChange: (v: string | boolean | string[]) => void;
}) {
  if (field.type === "radio") {
    const cur = (value as string) ?? field.default;
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium">{field.label}</p>
        <div className="space-y-1">
          {field.options.map((o) => (
            <label key={o.id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2 hover:bg-accent/40">
              <input
                type="radio"
                name={field.id}
                value={o.id}
                checked={cur === o.id}
                onChange={() => onChange(o.id)}
                className="mt-0.5 accent-foreground"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{o.label}</p>
                {o.desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{o.desc}</p>}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-medium">{field.label}</span>
        <select
          value={(value as string) ?? field.default}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border bg-background px-2 py-1.5 text-xs"
        >
          {field.options.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "check") {
    const cur = (value as boolean) ?? field.default ?? false;
    return (
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={cur}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 accent-foreground"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">{field.label}</p>
          {field.desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{field.desc}</p>}
        </div>
      </label>
    );
  }

  if (field.type === "multi") {
    const cur = (value as string[]) ?? field.default ?? [];
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium">{field.label}</p>
        <div className="flex flex-wrap gap-1">
          {field.options.map((o) => {
            const on = cur.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => onChange(on ? cur.filter((x) => x !== o.id) : [...cur, o.id])}
                className={
                  "rounded-full border px-2 py-0.5 text-[11px] transition-colors " +
                  (on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")
                }
              >
                {on && <Check className="-ml-0.5 mr-0.5 inline size-2.5" />}
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
