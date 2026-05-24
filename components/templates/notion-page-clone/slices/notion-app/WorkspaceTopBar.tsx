"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  MoreHorizontal,
  Share2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "rahman-shared/lib/utils";

export type Crumb = { label: string; href?: string; icon?: string };

export interface WorkspaceTopBarProps {
  crumbs: Crumb[];
  /** Workspace root href — rendered as the leading Home icon link.
   *  Caller passes the template's `PUBLIC_BASE` so the slice stays
   *  portable across slugs. */
  homeHref: string;
  /** When set, star button renders pressed. */
  starred?: boolean;
  onToggleStar?: () => void;
  onShare?: () => void;
  /** Extra right-side slot (page-actions menu, etc). */
  extras?: React.ReactNode;
  className?: string;
}

/** Workspace chrome above page content. Breadcrumb left, action cluster
 *  right (share / star / more). Sits between sidebar and NotionPage —
 *  matches Notion's app shell, not the page header. */
export function WorkspaceTopBar({
  crumbs,
  homeHref,
  starred,
  onToggleStar,
  onShare,
  extras,
  className,
}: WorkspaceTopBarProps) {
  return (
    <header
      className={cn(
        "flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur",
        className,
      )}
    >
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
        <Link
          href={homeHref}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Workspace home"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>
        {crumbs.map((c, i) => (
          <React.Fragment key={`${c.href ?? c.label}-${i}`}>
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden />
            {c.href ? (
              <Link
                href={c.href}
                className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {c.icon && <span aria-hidden>{c.icon}</span>}
                <span className="truncate">{c.label}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 truncate px-1 py-0.5 font-medium text-foreground">
                {c.icon && <span aria-hidden>{c.icon}</span>}
                <span className="truncate">{c.label || "Untitled"}</span>
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-1">
        {onShare && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onShare}>
            <Share2 className="mr-1 h-3.5 w-3.5" />
            Share
          </Button>
        )}
        {onToggleStar && (
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={starred}
            aria-label={starred ? "Unstar" : "Star"}
            className="h-7 w-7"
            onClick={onToggleStar}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                starred && "fill-amber-400 stroke-amber-400",
              )}
            />
          </Button>
        )}
        {extras}
        <Button variant="ghost" size="icon" aria-label="More" className="h-7 w-7">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
