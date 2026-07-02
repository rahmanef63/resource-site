/**
 * Title Property - Renderer Component
 *
 * Displays the title property value in read-only mode.
 * Shows "Untitled" placeholder when empty.
 *
 * @module frontend/slices/database/properties/title
 */

import React from "react";
import type { PropertyRendererProps } from "../../registry/types";
import { cn } from "@/lib/utils";

/**
 * Title Property Renderer
 *
 * Renders a title property value with appropriate styling.
 * Primary text field for database records.
 *
 * @param value - Title string value
 * @param readOnly - Whether in read-only mode (unused, always read-only)
 * @param className - Additional CSS classes
 */
export function TitleRenderer({
  value,
  readOnly,
  className,
}: PropertyRendererProps<string>) {
  const displayValue = typeof value === "string" ? value.trim() : "";

  if (!displayValue) {
    return (
      <span className={cn("text-sm text-muted-foreground italic", className)}>
        Untitled
      </span>
    );
  }

  return (
    <span className={cn("text-sm font-medium text-foreground", className)}>
      {displayValue}
    </span>
  );
}

