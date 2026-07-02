import React from 'react';
/**
 * URL Property - Renderer Component
 *
 * Displays URL as clickable link with icon.
 *
 * @module frontend/slices/database/properties/url
 */

import { Link as LinkIcon } from "lucide-react";
import type { PropertyRendererProps } from "../../registry/types";
import { cn } from "@/lib/utils";

/**
 * URL Property Renderer
 */
export function UrlRenderer({
  value,
  className,
}: PropertyRendererProps<string>) {
  if (!value || typeof value !== "string") {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>—</span>
    );
  }

  try {
    const url = new URL(value);
    const label = url.hostname.replace(/^www\./, "");

    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline",
          className
        )}
      >
        <LinkIcon className="h-3.5 w-3.5" />
        {label}
      </a>
    );
  } catch {
    // Invalid URL, show as plain text
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {value}
      </span>
    );
  }
}

