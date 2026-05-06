import * as React from "react";
import { Button } from "@/components/ui/button";

export interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
}

export default function SearchBox({
  value = "",
  placeholder = "Search…",
  debounceMs = 250,
  autoFocus,
  onChange,
  onSubmit,
  className,
}: SearchBoxProps) {
  const [q, setQ] = React.useState(value);

  React.useEffect(() => setQ(value), [value]);

  React.useEffect(() => {
    const id = setTimeout(() => onChange?.(q), debounceMs);
    return () => clearTimeout(id);
  }, [q, debounceMs, onChange]);

  return (
    <form
      className={["relative w-full max-w-lg", className].filter(Boolean).join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(q);
      }}
      role="search"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-md border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-neutral-300"
        aria-label="Search"
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2"
        aria-label="Submit search"
      >
        ⌕
      </Button>
    </form>
  );
}
