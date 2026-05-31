"use client";

/** DateCell — Notion-canonical date picker.
 *  - Click trigger → opens Popover with shadcn Calendar.
 *  - Single mode = pick one date.
 *  - Range mode = toggle to "Include end date" → pick start + end.
 *  - Value shape: { date: "YYYY-MM-DD", end?: "YYYY-MM-DD" }.
 *  - readOnly = just renders formatted span. */

import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Property } from "../../types";
import { formatDateValue } from "../../lib/dateFormat";

interface DateValue { date?: string; end?: string; time?: string; endTime?: string }

function toISO(d: Date | undefined): string | undefined {
  if (!d) return undefined;
  return format(d, "yyyy-MM-dd");
}

function fromISO(s: string | null | undefined): Date | undefined {
  if (!s) return undefined;
  try { return parseISO(s); } catch { return undefined; }
}

function defaultDisplay(v: DateValue | null): string {
  if (!v?.date) return "";
  const start = fromISO(v.date);
  if (!start) return v.date;
  const startFmt = format(start, "LLL d, yyyy");
  if (v.end) {
    const end = fromISO(v.end);
    if (end) return `${startFmt} → ${format(end, "LLL d, yyyy")}`;
  }
  return startFmt;
}

/** Display preference precedence: when the host passes `prop` and any
 *  date-related setting (`dateFormat`, `timeFormat`, `dateIncludeTime`)
 *  is set on it, route through the typed formatter; otherwise fall back
 *  to the date-fns "LLL d, yyyy" rendering preserved from earlier rr
 *  releases. Keeps Phase-7 changes opt-in. */
function display(v: DateValue | null, prop?: Property): string {
  if (!v?.date) return "";
  const hasPropFmt = !!(prop && (prop.dateFormat || prop.timeFormat || prop.dateIncludeTime));
  if (hasPropFmt) return formatDateValue(v, prop);
  return defaultDisplay(v);
}

interface DateCellProps {
  value: DateValue | null;
  readOnly?: boolean;
  onChange?: (next: DateValue | null) => void;
  /** When provided, dateFormat / timeFormat / dateIncludeTime on the
   *  property drive the display string. */
  prop?: Property;
}

export function DateCell({ value, readOnly, onChange, prop }: DateCellProps) {
  const [open, setOpen] = useState(false);
  const v = value && typeof value === "object" ? value : null;
  const isRange = !!v?.end;
  const [rangeMode, setRangeMode] = useState(isRange || !!prop?.dateRange);

  const selected = useMemo(() => {
    if (rangeMode) return { from: fromISO(v?.date), to: fromISO(v?.end) };
    return fromISO(v?.date);
  }, [rangeMode, v?.date, v?.end]);

  const label = display(v, prop);

  if (readOnly) {
    return label
      ? <span className="text-sm text-foreground">{label}</span>
      : <span className="text-muted-foreground/60">—</span>;
  }

  const handleSingle = (d: Date | undefined) => {
    const iso = toISO(d);
    onChange?.(iso ? { date: iso } : null);
    if (d) setOpen(false);
  };
  const handleRange = (r: { from?: Date; to?: Date } | undefined) => {
    if (!r?.from) { onChange?.(null); return; }
    const startIso = toISO(r.from);
    const endIso = toISO(r.to);
    if (!startIso) { onChange?.(null); return; }
    onChange?.(endIso ? { date: startIso, end: endIso } : { date: startIso });
    if (r.from && r.to) setOpen(false);
  };
  const clear = () => { onChange?.(null); setOpen(false); };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button" className={cn(
          "flex h-7 w-full items-center justify-start gap-1.5 rounded-md border-border bg-background px-2 text-left text-sm font-normal hover:bg-accent",
        )} aria-label="Pick a date">
          <CalendarIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
          {label
            ? <span className="truncate">{label}</span>
            : <span className="text-muted-foreground/60">Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <Switch checked={rangeMode} onCheckedChange={(c) => setRangeMode(!!c)} />
            Include end date
          </label>
          {v?.date && (
            <Button variant="ghost" size="sm" onClick={clear} className="h-6 gap-1 px-2 text-xs">
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
        {rangeMode ? (
          <Calendar mode="range" selected={selected as never} onSelect={handleRange as never} numberOfMonths={1} />
        ) : (
          <Calendar mode="single" selected={selected as Date | undefined} onSelect={handleSingle} numberOfMonths={1} />
        )}
      </PopoverContent>
    </Popover>
  );
}
