/**
 * Title Property - Editor Component
 *
 * Editable input component for title property values.
 * Supports auto-focus, blur events, and maxLength validation.
 *
 * @module frontend/slices/database/properties/title
 */

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { PropertyEditorProps } from "../../registry/types";
import { cn } from "@/lib/utils";

/**
 * Title Property Editor
 *
 * Provides an editable input for title property values.
 * Syncs local state with parent value prop.
 *
 * @param value - Current title value
 * @param onChange - Callback when value changes
 * @param onBlur - Callback when input loses focus
 * @param autoFocus - Whether to auto-focus on mount
 * @param className - Additional CSS classes
 */
export function TitleEditor({
  value,
  onChange,
  onBlur,
  autoFocus,
  className,
}: PropertyEditorProps<string>) {
  const [localValue, setLocalValue] = useState(value || "");

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      autoFocus={autoFocus}
      placeholder="Enter title..."
      maxLength={200}
      className={cn("text-sm", className)}
    />
  );
}
