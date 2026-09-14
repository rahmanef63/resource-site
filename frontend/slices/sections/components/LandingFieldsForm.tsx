"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LANDING_FIELDS_CORE } from "../lib/fields";
import type { LandingSection } from "../types";

export function LandingFieldsForm({ value, onChange, positions }: {
  value: LandingSection;
  onChange: (key: keyof LandingSection, value: unknown) => void;
  positions: number[];
}) {
  return <div className="grid gap-4 sm:grid-cols-2">
    {LANDING_FIELDS_CORE.map((field) => {
      const wide = field.kind === "textarea" || field.wide;
      return <label key={field.key} className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
        <span className="text-sm font-medium">{field.label}</span>
        {field.kind === "switch" ? (
          <div className="flex h-9 items-center"><Switch checked={Boolean(value[field.key])} onCheckedChange={(checked) => onChange(field.key, checked)} /></div>
        ) : field.kind === "select" ? (
          <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(value[field.key] ?? "")} onChange={(event) => onChange(field.key, event.target.value)}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        ) : field.kind === "position" ? (
          <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={value.order} onChange={(event) => onChange("order", Number(event.target.value))}>{positions.map((position) => <option key={position} value={position}>{position}</option>)}</select>
        ) : field.kind === "textarea" ? (
          <Textarea rows={field.rows ?? 3} className={("mono" in field && field.mono) ? "font-mono" : undefined} placeholder={("placeholder" in field ? field.placeholder : undefined)} value={String(value[field.key] ?? "")} onChange={(event) => onChange(field.key, event.target.value)} />
        ) : (
          <Input className={("mono" in field && field.mono) ? "font-mono" : undefined} placeholder={("placeholder" in field ? field.placeholder : undefined)} value={String(value[field.key] ?? "")} onChange={(event) => onChange(field.key, event.target.value)} />
        )}
        {field.hint ? <span className="block text-xs text-muted-foreground">{field.hint}</span> : null}
      </label>;
    })}
  </div>;
}
