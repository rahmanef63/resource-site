"use client";

import * as React from "react";
import { IconPickerPopover, DynamicIcon } from "@/features/icon-picker";

/** Live, interactive Notion-style icon picker preview.
 *
 *  Mirrors the notion-page-clone page-header pattern 1:1:
 *    - One big clickable page icon at the top.
 *    - Click → IconPickerPopover opens.
 *    - Pick an emoji or Lucide icon → popover closes, icon updates.
 *    - Pick a color → popover stays open, icon recolors. */
export default function Page() {
  const [icon, setIcon] = React.useState<string | null>("🪺");

  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-16 sm:pt-24">
        <IconPickerPopover
          value={icon}
          onChange={(next) => setIcon(next)}
          onClear={() => setIcon(null)}
          align="start"
        >
          <button
            type="button"
            aria-label="Change page icon"
            className="group/icon mb-3 inline-flex h-[78px] w-[78px] items-center justify-center rounded-md text-[64px] leading-none transition hover:bg-accent"
          >
            <DynamicIcon
              value={icon}
              className="size-[64px] text-[64px] leading-none transition group-hover/icon:scale-105"
              fallback="🪺"
            />
          </button>
        </IconPickerPopover>

        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Untitled
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Click the icon above to open the picker. Try emoji, Lucide icons,
          a custom color, or shuffle for a random pick. Same component the
          notion-page-clone ships in production — no mock, no facade.
        </p>

        <div className="mt-12 space-y-3 text-sm">
          {[
            "Type / to insert a block.",
            "Drag the handle on the left to reorder.",
            "Toggle headings to collapse a section.",
          ].map((line, i) => (
            <p key={i} className="text-muted-foreground/80">
              {line}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
