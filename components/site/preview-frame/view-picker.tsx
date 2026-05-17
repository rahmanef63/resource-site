"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PREVIEW_PRESETS, PREVIEW_VIEW_ORDER, type PreviewView } from "@/lib/preview-presets";
import { VIEW_ICONS } from "./view-icons";

export function ViewButtonStrip({
  view,
  setView,
}: {
  view: PreviewView;
  setView: (v: PreviewView) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
      {PREVIEW_VIEW_ORDER.map((k) => {
        const Icon = VIEW_ICONS[k];
        const p = PREVIEW_PRESETS[k];
        const on = view === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => setView(k)}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors",
              on ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            title={`${p.label} (${p.width}×${p.height})${p.description ? " — " + p.description : ""}`}
          >
            <Icon className="size-3" />
            <span className="hidden md:inline">{p.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ViewDropdown({
  view,
  setView,
}: {
  view: PreviewView;
  setView: (v: PreviewView) => void;
}) {
  return (
    <Select value={view} onValueChange={(v) => setView(v as PreviewView)}>
      <SelectTrigger className="h-7 w-[170px] gap-1.5 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PREVIEW_VIEW_ORDER.map((k) => {
          const Icon = VIEW_ICONS[k];
          const p = PREVIEW_PRESETS[k];
          return (
            <SelectItem key={k} value={k} className="text-xs">
              <div className="flex w-full items-center gap-2">
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{p.label}</span>
                <span className="ml-auto pl-3 font-mono text-[10px] text-muted-foreground">
                  {p.width}×{p.height}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
