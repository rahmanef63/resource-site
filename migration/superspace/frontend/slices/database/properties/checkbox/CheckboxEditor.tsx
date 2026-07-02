/**
 * Checkbox Property - Editor Component
 *
 * Editable checkbox for boolean values.
 *
 * @module frontend/slices/database/properties/checkbox
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { PropertyEditorProps } from "../../registry/types";
import { cn } from "@/lib/utils";

/**
 * Checkbox Property Editor
 *
 * Provides editable checkbox input.
 */
export function CheckboxEditor({
  value,
  onChange,
  className,
}: PropertyEditorProps<boolean>) {
  const checked = Boolean(value);

  const handleChange = (newChecked: boolean) => {
    onChange(newChecked);
  };

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={handleChange}
      className={cn(className)}
      aria-label={checked ? "Checked" : "Unchecked"}
    />
  );
}

