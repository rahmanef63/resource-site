"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal chrome for slice preview pages. Iframed by PreviewFrame on the
 * slice detail page — so layout intentionally has no header / no nested
 * card padding. Edge-to-edge full-width like template previews.
 */

interface SlicePreviewLayoutProps {
  title: string;
  kind: "ui" | "backend" | "full";
  description?: string;
  /** Optional source-code link (e.g. github tree). */
  sourceUrl?: string;
  /** Constrain inner content. Default "screen-2xl". Pass "none" for edge-to-edge. */
  maxWidth?: "screen-2xl" | "7xl" | "6xl" | "none";
  children: React.ReactNode;
}

const MAXW: Record<NonNullable<SlicePreviewLayoutProps["maxWidth"]>, string> = {
  "screen-2xl": "max-w-screen-2xl",
  "7xl": "max-w-7xl",
  "6xl": "max-w-6xl",
  none: "max-w-none",
};

export function SlicePreviewLayout({
  children,
  maxWidth = "screen-2xl",
}: SlicePreviewLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className={cn("mx-auto px-6 py-8", MAXW[maxWidth])}>{children}</div>
    </main>
  );
}

interface SectionProps {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PreviewSection({ title, hint, children, className }: SectionProps) {
  return (
    <section className={cn("mb-10", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-[11px] leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

interface DiagramProps {
  steps: { title: string; detail?: string; arrow?: boolean }[];
}

/** Simple horizontal flow diagram for backend slices. */
export function FlowDiagram({ steps }: DiagramProps) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex min-w-[140px] flex-1 flex-col rounded-md border border-border/60 bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Step {i + 1}
            </div>
            <div className="mt-1 text-sm font-medium">{s.title}</div>
            {s.detail && (
              <div className="mt-1 text-xs text-muted-foreground">{s.detail}</div>
            )}
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-center text-muted-foreground">→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
