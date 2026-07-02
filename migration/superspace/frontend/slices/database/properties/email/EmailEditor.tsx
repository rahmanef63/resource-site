/**
 * Email Property - Editor Component
 */

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { PropertyEditorProps } from "../../registry/types";
import { cn } from "@/lib/utils";

export function EmailEditor({
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
      type="email"
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      autoFocus={autoFocus}
      placeholder="email@example.com"
      className={cn("text-sm", className)}
    />
  );
}

