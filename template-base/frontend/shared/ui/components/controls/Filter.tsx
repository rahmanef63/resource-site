import * as React from "react";
import { Button } from "@/components/ui/button";

export type FilterChip = { key: string; label: string; value: string | number | boolean };

export interface FilterProps {
  /** daftar filter aktif yang ditampilkan sebagai chip */
  chips?: FilterChip[];
  /** render kontrol filter kustom (selects, checkboxes, dsb.) */
  children?: React.ReactNode;
  /** dipanggil ketika chip dihapus */
  onRemoveChip?: (key: string) => void;
  className?: string;
}

export default function Filter({ chips = [], children, onRemoveChip, className }: FilterProps) {
  return (
    <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <Button
            key={c.key}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemoveChip?.(c.key)}
            className="rounded-full"
            aria-label={`Remove ${c.label}`}
            title={`Remove ${c.label}`}
          >
            <span className="font-medium">{c.label}:</span>
            <span className="opacity-80 ml-1">{String(c.value)}</span>
            <span aria-hidden className="ml-1">×</span>
          </Button>
        ))}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
