"use client";

/** DateCellEditor — DateCell popover body, the canonical shadcn date picker
 *  (Popover + Calendar). Single mode picks one date; range mode (End date on)
 *  shows two display fields over a `mode="range"` calendar that shades the
 *  start→end span. Times use the shadcn time input and appear only when
 *  `dateIncludeTime` is on. Value shape: `{ date, end?, time?, endTime? }`.
 *
 *  NOTE: the Calendar (react-day-picker) is pinned to v9 — v10 silently broke
 *  day clicks with this shadcn Calendar component. */

import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Property } from "../../types";
import { formatYmd } from "../../lib/dateFormat";
import { DateCellSettings } from "./DateCellSettings";
import { DateBox } from "./DateBox";

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
  onChange: (next: DateEditorValue | null) => void;
  /** Fired after a terminal pick so the host can close the popover. */
  onAfterPick?: () => void;
  prop?: Property;
  onPropPatch?: (patch: Partial<Property>) => void;
}

export function DateCellEditor({
  value, includeTime, rangeMode, onChange, onAfterPick, prop, onPropPatch,
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

  const onRangeSelect = (range: DateRange | undefined) => {
    const from = toISO(range?.from);
    if (!from) { onChange(null); return; }
    const to = toISO(range?.to);
    onChange({ ...v, date: from, end: to, endTime: to ? v.endTime : undefined });
  };

  // End date is a PROPERTY-level setting (`prop.dateRange`) — the same switch
  // the column header's edit-property panel toggles — so the two stay in sync.
  const toggleRange = (on: boolean) => {
    onPropPatch?.({ dateRange: on || undefined });
    if (on && v.date && !v.end) patch({ end: v.date });
    else if (!on && (v.end || v.endTime)) patch({ end: undefined, endTime: undefined });
  };

  return (
    <div className="w-auto p-2">
      {/* Date field(s) */}
      {rangeMode ? (
        <div className="mb-2 grid grid-cols-2 gap-2">
          <DateBox label={v.date ? formatYmd(v.date, fmt) : ""} placeholder="Start date" />
          <DateBox label={v.end ? formatYmd(v.end, fmt) : ""} placeholder="End date" />
        </div>
      ) : (
        <div className="mb-2 flex items-center gap-2">
          <DateBox label={v.date ? formatYmd(v.date, fmt) : ""} placeholder="Empty" />
          <Button
            variant="ghost" type="button"
            onClick={() => setStart(new Date())}
            className="h-8 px-2 text-xs font-normal text-muted-foreground"
          >
            Today
          </Button>
        </div>
      )}

      {/* Time input(s) */}
      {includeTime && (
        rangeMode ? (
          <div className="mb-2 grid grid-cols-2 gap-2">
            <Input
              type="time" value={v.time ?? ""} disabled={!v.date}
              onChange={(e) => patch({ time: e.target.value || undefined })}
              aria-label="Start time" className="h-8 text-xs"
            />
            <Input
              type="time" value={v.endTime ?? ""} disabled={!v.end}
              onChange={(e) => patch({ endTime: e.target.value || undefined })}
              aria-label="End time" className="h-8 text-xs"
            />
          </div>
        ) : (
          <Input
            type="time" value={v.time ?? ""} disabled={!v.date}
            onChange={(e) => patch({ time: e.target.value || undefined })}
            aria-label="Start time" className="mb-2 h-8 w-full text-xs"
          />
        )
      )}

      {rangeMode ? (
        <Calendar
          mode="range"
          selected={start ? { from: start, to: end } : undefined}
          onSelect={onRangeSelect}
          defaultMonth={start}
          numberOfMonths={1}
        />
      ) : (
        <Calendar
          mode="single"
          selected={start}
          onSelect={setStart}
          defaultMonth={start}
          numberOfMonths={1}
        />
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
