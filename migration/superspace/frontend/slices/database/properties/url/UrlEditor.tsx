/**
 * URL Property - Editor Component
 *
 * Input for URL values with validation.
 *
 * @module frontend/slices/database/properties/url
 */

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { PropertyEditorProps } from "../../registry/types";
import { cn } from "@/lib/utils";

/**
 * URL Property Editor
 */
export function UrlEditor({
  value,
  onChange,
  onBlur,
  autoFocus,
  className,
}: PropertyEditorProps<string>) {
  const [localValue, setLocalValue] = useState(value || "");

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
      type="url"
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      autoFocus={autoFocus}
      placeholder="https://example.com"
      className={cn("text-sm", className)}
    />
  );
}

