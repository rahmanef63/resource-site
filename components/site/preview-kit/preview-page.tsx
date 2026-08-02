import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard chrome for every kitab preview page. Each preview iframes
 * at its own canvas width — so the page must stretch full-screen,
 * never assume a centered max-width unless the author opts in.
 */

type PreviewPageProps = {
  children: React.ReactNode;
  /** Page tone — neutral for content previews, dark for hero/video. */
  tone?: "default" | "dark";
  className?: string;
};

export function PreviewPage({ children, tone = "default", className }: PreviewPageProps) {
  return (
    <main
      className={cn(
        "min-h-screen w-full",
        tone === "dark" ? "bg-zinc-950 text-white" : "bg-background",
        className,
      )}
    >
      {children}
    </main>
  );
}

type PreviewHeaderProps = {
  icon?: LucideIcon;
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

/**
 * Reusable page header: icon-box left + title + subtitle.
 * `actions` slot floats right (use for badges, view-mode pills, etc.).
 */
export function PreviewHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  actions,
  align = "left",
  className,
}: PreviewHeaderProps) {
  if (align === "center") {
    return (
      <header className={cn("mb-8 text-center", className)}>
        {badge && <div className="mb-3 inline-block">{badge}</div>}
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-balance text-muted-foreground">{subtitle}</p>}
      </header>
    );
  }
  return (
    <header className={cn("mb-6 flex flex-wrap items-center gap-3", className)}>
      {Icon && (
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Constrained content container — use INSIDE PreviewPage when content
 *  should be readable (text-heavy blocks like FAQ, blog post). */
export function PreviewContainer({
  children,
  size = "wide",
  className,
}: {
  children: React.ReactNode;
  size?: "narrow" | "reading" | "wide" | "full";
  className?: string;
}) {
  const max = {
    narrow: "max-w-md",
    reading: "max-w-2xl",
    wide: "max-w-6xl",
    full: "max-w-none",
  }[size];
  return <div className={cn("mx-auto px-4 py-8 sm:px-6 sm:py-10", max, className)}>{children}</div>;
}
