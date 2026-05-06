/**
 * SearchBar Component
 * Reusable search input with icon
 * @module shared/ui/components/SearchBar
 */

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Disable input */
  disabled?: boolean;
}

export function SearchBar({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  className,
  autoFocus,
  disabled,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        autoFocus={autoFocus}
        disabled={disabled}
        className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
      />
    </div>
  );
}
