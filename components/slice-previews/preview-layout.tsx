"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Standard chrome for every slice preview page. Iframed by PreviewFrame on
 * the slice detail page — so this layout intentionally has no extra app
 * shell. Just title + kind badge + content.
 */

interface SlicePreviewLayoutProps {
  title: string;
  kind: "ui" | "backend" | "full";
  description?: string;
  /** Optional source-code link (e.g. github tree). */
  sourceUrl?: string;
  children: React.ReactNode;
}

const KIND_COLORS: Record<SlicePreviewLayoutProps["kind"], string> = {
  ui: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  backend: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  full: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

export function SlicePreviewLayout({
  title,
  kind,
  description,
  sourceUrl,
  children,
}: SlicePreviewLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 px-4 py-2 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Slice preview
            </span>
            <Badge className={cn("text-[10px] uppercase", KIND_COLORS[kind])}>{kind}</Badge>
            <h1 className="text-sm font-medium">{title}</h1>
          </div>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
            >
              Source <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </div>
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
    <section className={cn("mb-8", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="rounded-lg border border-border/60 bg-card/30 p-4 sm:p-6">{children}</div>
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
          <div className="flex min-w-[140px] flex-1 flex-col rounded-md border border-border/60 bg-background p-3">
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
