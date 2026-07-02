import React from 'react';
/**
 * Email Property - Renderer Component
 */

import { Mail } from "lucide-react";
import type { PropertyRendererProps } from "../../registry/types";
import { cn } from "@/lib/utils";

export function EmailRenderer({
  value,
  className,
}: PropertyRendererProps<string>) {
  if (!value || typeof value !== "string") {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>—</span>
    );
  }

  return (
    <a
      href={`mailto:${value}`}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline",
        className
      )}
    >
      <Mail className="h-3.5 w-3.5" />
      {value}
    </a>
  );
}

