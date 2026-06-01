"use client";

/** DateCellEditor — popover body for DateCell. Two SINGLE calendars
 *  (start + end) mirroring notion-page-clone, so a range needs two
 *  explicit picks and the end calendar disables days before the start.
 *  Optional `time` / `endTime` inputs appear when the property opts into
 *  `dateIncludeTime` — written as "HH:mm" (24h internal; the dateFormat
 *  formatter renders 12h/24h on display). Value shape:
 *  `{ date, end?, time?, endTime? }`. */

import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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
}

export function DateCellEditor({
  value, includeTime, rangeMode, onRangeToggle, onChange, onAfterPick,
}: Props) {
  const v = value ?? {};
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

  return (
    <div className="w-auto">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs">
        <label className="flex items-center gap-2 text-muted-foreground">
          <Switch checked={rangeMode} onCheckedChange={(c) => toggleRange(!!c)} />
          Include end date
        </label>
        {v.date && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)} className="h-6 gap-1 px-2 text-xs">
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="p-2">
        <div className="px-1 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          {rangeMode ? "Start" : "Date"}
        </div>
        <Calendar mode="single" selected={start} onSelect={setStart} numberOfMonths={1} />
        {includeTime && (
          <Input
            type="time" value={v.time ?? ""} disabled={!v.date}
            onChange={(e) => patch({ time: e.target.value || undefined })}
            aria-label="Start time" className="mt-1 h-7 text-xs"
          />
        )}
      </div>

      {rangeMode && (
        <div className="border-t border-border p-2">
          <div className="px-1 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">End</div>
          <Calendar
            mode="single" selected={end} onSelect={setEnd} numberOfMonths={1}
            disabled={start ? { before: start } : undefined}
          />
          {includeTime && (
            <Input
              type="time" value={v.endTime ?? ""} disabled={!v.date}
              onChange={(e) => patch({ endTime: e.target.value || undefined })}
              aria-label="End time" className="mt-1 h-7 text-xs"
            />
          )}
        </div>
      )}
    </div>
  );
}
