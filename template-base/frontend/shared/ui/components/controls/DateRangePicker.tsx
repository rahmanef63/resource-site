import * as React from "react";
import { format, parseISO } from "date-fns";

import { SharedDatePicker } from "@/frontend/shared/foundation/utils/datepicker";
import { cn } from "@/lib/utils";

export interface DateRange {
  start: string | null; // "YYYY-MM-DD"
  end: string | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (next: DateRange) => void;
  className?: string;
  labels?: { start?: string; end?: string };
}

function toDate(raw: string | null): Date | undefined {
  return raw ? parseISO(raw) : undefined;
}

function toIso(d: Date | undefined): string | null {
  return d ? format(d, "yyyy-MM-dd") : null;
}

export default function DateRangePicker({
  value = { start: null, end: null },
  onChange,
  className,
  labels = {},
}: DateRangePickerProps) {
  const [start, setStart] = React.useState<string | null>(value.start);
  const [end, setEnd] = React.useState<string | null>(value.end);

  React.useEffect(() => {
    onChange?.({ start, end });
  }, [start, end, onChange]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {labels.start ?? "Start"}
        </span>
        <SharedDatePicker
          date={toDate(start)}
          onChange={(d) => setStart(toIso(d))}
          placeholder={labels.start ?? "Start"}
          className="w-[180px]"
        />
      </div>
      <span className="text-muted-foreground">—</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {labels.end ?? "End"}
        </span>
        <SharedDatePicker
          date={toDate(end)}
          onChange={(d) => setEnd(toIso(d))}
          placeholder={labels.end ?? "End"}
          className="w-[180px]"
        />
      </div>
    </div>
  );
}
