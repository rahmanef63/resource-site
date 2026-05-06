import * as React from "react";
import { Button } from "@/components/ui/button";

export type SortOption = { label: string; value: string; direction?: "asc" | "desc" };

export interface SortProps {
  options: SortOption[];
  value?: string;
  direction?: "asc" | "desc";
  onChange?: (value: string, direction: "asc" | "desc") => void;
  className?: string;
}

export default function Sort({ options, value, direction = "asc", onChange, className }: SortProps) {
  const [field, setField] = React.useState(value ?? options[0]?.value);
  const [dir, setDir] = React.useState<"asc" | "desc">(direction);

  React.useEffect(() => {
    if (value) setField(value);
  }, [value]);

  React.useEffect(() => {
    onChange?.(field!, dir);
  }, [field, dir, onChange]);

  return (
    <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <select
        className="rounded-md border px-2 py-1"
        value={field}
        onChange={(e) => setField(e.target.value)}
        aria-label="Sort field"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
        aria-label="Toggle sort direction"
        title="Toggle sort direction"
      >
        {dir === "asc" ? "↑ Asc" : "↓ Desc"}
      </Button>
    </div>
  );
}
