import React from 'react';
/**
 * Checkbox Property - Renderer Component
 *
 * Displays checkbox property as checked/unchecked.
 *
 * @module frontend/slices/database/properties/checkbox
 */

import { Checkbox } from "@/components/ui/checkbox";
import type { PropertyRendererProps } from "../../registry/types";
import { cn } from "@/lib/utils";

/**
 * Checkbox Property Renderer
 *
 * Renders checkbox in read-only mode.
 */
export function CheckboxRenderer({
  value,
  readOnly,
  className,
}: PropertyRendererProps<boolean>) {
  const checked = Boolean(value);

  return (
    <Checkbox
      checked={checked}
      disabled
      className={cn("cursor-default", className)}
      aria-label={checked ? "Checked" : "Unchecked"}
    />
  );
}

