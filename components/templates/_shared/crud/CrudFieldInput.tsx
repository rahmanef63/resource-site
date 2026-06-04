"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconPickerPopover, DynamicIcon } from "@/features/icon-picker";
import {
  ImagePickerButton,
  ImageBanner,
  parseImage,
  imageRef,
  unsplashSearchVia,
} from "@/features/image-picker";
import type { FieldDef } from "./types";

export function CrudFieldInput<T>({
  field,
  value,
  onChange,
  ctx,
}: {
  field: FieldDef<T>;
  value: unknown;
  onChange: (next: unknown) => void;
  /** Sibling-aware context for kinds that need it (e.g. `position`).
   *  `total` = current count of items; `editing` = true if editing an
   *  existing row (so range is 1..total instead of 1..total+1). */
  ctx?: { total: number; editing: boolean };
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
    case "position": {
      const total = ctx?.total ?? 1;
      const max = ctx?.editing ? Math.max(total, 1) : total + 1;
      const positions = Array.from({ length: max }, (_, i) => i + 1);
      const current = value == null ? 1 : Number(value);
      return (
        <Select
          value={String(current)}
          onValueChange={(v) => onChange(Number(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {positions.map((p) => (
              <SelectItem key={p} value={String(p)}>
                {p === 1 ? "1 (top)" : p === max && !ctx?.editing ? `${p} (bottom — new)` : String(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
    case "imagePicker": {
      const cover = String(value ?? "");
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-end">
            <ImagePickerButton
              label={cover ? "Change image" : "Pick image"}
              title={field.label}
              searchUnsplash={unsplashSearchVia("/api/unsplash")}
              onChange={(img) => onChange(imageRef(img) ?? "")}
            />
          </div>
          {cover ? (
            <ImageBanner
              image={parseImage(cover)}
              searchUnsplash={unsplashSearchVia("/api/unsplash")}
              onChange={(next) => onChange(next ? imageRef(next) ?? "" : "")}
              className="h-32 w-full overflow-hidden rounded-md border border-border/60"
            />
          ) : (
            <p className="rounded-md border border-dashed border-border/60 px-3 py-5 text-center text-xs text-muted-foreground">
              No image yet — pick a color, gradient, paste a URL, or search Unsplash.
            </p>
          )}
        </div>
      );
    }
    case "icon": {
      const icon = String(value ?? "");
      return (
        <div className="flex items-center gap-2">
          <IconPickerPopover value={icon} onChange={(next) => onChange(next)}>
            <Button type="button" variant="outline" size="icon" aria-label={`Pick ${field.label}`}>
              {icon ? <DynamicIcon value={icon} size={18} /> : "+"}
            </Button>
          </IconPickerPopover>
          <span className="text-xs text-muted-foreground">
            {icon ? icon : "No icon yet"}
          </span>
        </div>
      );
    }
  }
}
