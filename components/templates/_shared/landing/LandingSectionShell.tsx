"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LandingSection } from "./types";

interface Props {
  section: LandingSection;
  children: React.ReactNode;
  /** Optional template-default classes (e.g. "border-b py-12"). Merged
   *  before the section's user-provided className so admin overrides win. */
  defaultClassName?: string;
}

/**
 * DRY wrapper every LandingRenderer kind wraps its output in. Applies
 * the admin-editable `bgImageUrl` (full-bleed background + readability
 * overlay) and appends `section.className` (custom Tailwind) to the
 * outer container. Renderers don't need to know about those fields —
 * just pass `section` through.
 */
export function LandingSectionShell({ section, children, defaultClassName }: Props) {
  const hasBg = Boolean(section.bgImageUrl);
  return (
    <section
      className={cn(
        "relative",
        defaultClassName,
        section.className,
        hasBg && "isolate text-foreground",
      )}
    >
      {hasBg && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.bgImageUrl}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-background/70 backdrop-blur-sm"
          />
        </>
      )}
      {children}
    </section>
  );
}
