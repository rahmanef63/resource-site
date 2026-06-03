"use client";

/** DateCellEditor — popover body for DateCell, matching notion-page-clone's
 *  date editor: a date+time HEADER ROW, one calendar, an inline End section
 *  when range mode is on, then the options list (End date · Date format ·
 *  Include time · Time format · Remind · Clear) via <DateCellSettings>.
 *
 *  The calendar is the date picker, so the header shows a read-only FORMATTED
 *  display (a native date input is forbidden here). Times use the shadcn time
 *  input and appear only when `dateIncludeTime` is on.
 *  Value shape: `{ date, end?, time?, endTime? }`. */

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Property } from "../../types";
import { formatYmd } from "../../lib/dateFormat";
import { DateCellSettings } from "./DateCellSettings";

export interface DateEditorValue { date?: string; end?: string; time?: string; endTime?: string }

function pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function toISO(d: Date | undefined): string | undefined {
  if (!d) return undefined;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromISO(s?: string): Date | undefined {
  if (!s) return undefined;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1]!, +m[2]! - 1, +m[3]!) : undefined;
}

interface Props {
  value: DateEditorValue | null;
  includeTime: boolean;
  rangeMode: boolean;
  onRangeToggle: (next: boolean) => void;
  onChange: (next: DateEditorValue | null) => void;
  /** Fired after a terminal pick so the host can close the popover. */
  onAfterPick?: () => void;
  /** The date property — drives the settings list (format / remind). */
  prop?: Property;
  /** Patch property-level date settings (format / include time / remind). */
  onPropPatch?: (patch: Partial<Property>) => void;
}

export function DateCellEditor({
  value, includeTime, rangeMode, onRangeToggle, onChange, onAfterPick, prop, onPropPatch,
}: Props) {
  const v = value ?? {};
  const fmt = prop?.dateFormat ?? "full";
  const start = fromISO(v.date);
  const end = fromISO(v.end);

  const patch = (p: Partial<DateEditorValue>) => {
    const next = { ...v, ...p };
    if (!next.date) { onChange(null); return; }
    onChange(next);
  };

  const setStart = (d: Date | undefined) => {
    const iso = toISO(d);
    if (!iso) { onChange(null); return; }
    patch({ date: iso });
    if (!rangeMode && !includeTime) onAfterPick?.();
  };
  const setEnd = (d: Date | undefined) => {
    if (!v.date) return; // no end without a start
    patch({ end: toISO(d) });
    if (d && !includeTime) onAfterPick?.();
  };

  const toggleRange = (on: boolean) => {
    onRangeToggle(on);
    if (!on && (v.end || v.endTime)) patch({ end: undefined, endTime: undefined });
  };

  const dateBox = (label: string, placeholder: string) => (
    <div className={cn(
      "flex h-8 flex-1 items-center truncate rounded-md border border-border bg-background px-2 text-sm",
      !label && "text-muted-foreground/60",
    )}>
      {label || placeholder}
    </div>
  );

  return (
    <div className="w-[18rem] p-2">
      {/* Start — date display + Today + optional time */}
      <div className="mb-2 flex items-center gap-2">
        {dateBox(v.date ? formatYmd(v.date, fmt) : "", rangeMode ? "Start date" : "Empty")}
        <Button
          variant="ghost" type="button"
          onClick={() => setStart(new Date())}
          className="h-8 px-2 text-xs font-normal text-muted-foreground"
        >
          Today
        </Button>
        {includeTime && (
          <Input
            type="time" value={v.time ?? ""} disabled={!v.date}
            onChange={(e) => patch({ time: e.target.value || undefined })}
            aria-label="Start time" className="h-8 w-24 text-xs"
          />
        )}
      </div>
      <Calendar mode="single" selected={start} onSelect={setStart} defaultMonth={start} numberOfMonths={1} />

      {/* End — inline, only when range mode is on */}
      {rangeMode && (
        <div className="mt-2 border-t border-border pt-2">
          <div className="mb-1 px-1 text-[11px] text-muted-foreground">End</div>
          <div className="mb-2 flex items-center gap-2">
            {dateBox(v.end ? formatYmd(v.end, fmt) : "", "End date")}
            {includeTime && (
              <Input
                type="time" value={v.endTime ?? ""} disabled={!v.date}
                onChange={(e) => patch({ endTime: e.target.value || undefined })}
                aria-label="End time" className="h-8 w-24 text-xs"
              />
            )}
          </div>
          <Calendar
            mode="single" selected={end} onSelect={setEnd}
            defaultMonth={end ?? start} numberOfMonths={1}
            disabled={start ? { before: start } : undefined}
          />
        </div>
      )}

      <DateCellSettings
        prop={prop}
        rangeMode={rangeMode}
        includeTime={includeTime}
        hasValue={!!v.date}
        onRangeToggle={toggleRange}
        onPropPatch={onPropPatch}
        onClear={() => onChange(null)}
      />
    </div>
  );
}
