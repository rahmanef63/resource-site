"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "./types";

export function CrudFieldInput<T>({
  field,
  value,
  onChange,
}: {
  field: FieldDef<T>;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  switch (field.kind) {
    case "text":
      return (
        <Input
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={field.mono ? "font-mono text-xs" : ""}
          placeholder={field.placeholder}
        />
      );
    case "textarea":
      return (
        <Textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows ?? 4}
          className={field.mono ? "font-mono text-xs" : ""}
          placeholder={field.placeholder}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={value == null ? "" : Number(value)}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );
    case "select":
      return (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "tags": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <Input
          value={arr.join(", ")}
          onChange={(e) =>
            onChange(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
          }
        />
      );
    }
    case "switch":
      return <Switch checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} />;
    case "date": {
      const ms = typeof value === "number" ? value : Date.now();
      const iso = new Date(ms).toISOString().slice(0, 10);
      return (
        <Input
          type="date"
          value={iso}
          onChange={(e) => onChange(new Date(e.target.value).getTime())}
        />
      );
    }
    case "image": {
      const url = String(value ?? "");
      const showPreview = /^(https?:\/\/|\/)/i.test(url);
      return (
        <div className="space-y-2">
          <Input
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? "https://… or /path.jpg"}
            className="font-mono text-xs"
          />
          {showPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="preview"
              className="h-20 w-32 rounded-md border border-border/60 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </div>
      );
    }
  }
}
