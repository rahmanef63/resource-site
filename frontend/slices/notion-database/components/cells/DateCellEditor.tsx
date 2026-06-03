"use client";

/** DateCellEditor — DateCell popover body. Range mode shows two date fields
 *  side by side; the ACTIVE one (blue ring) is what the calendar edits (click
 *  to switch, like Notion). Calendar runs in `single` mode (reliable picking)
 *  and shades the start→end span via modifiers. Fields are formatted boxes (no
 *  native date input); times use the shadcn time input. Value: `{date, end?,
 *  time?, endTime?}`. */

import { useState } from "react";
import { cn } from "@/lib/utils";
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
  // Which field the single calendar edits in range mode.
  const [editing, setEditing] = useState<"start" | "end">("start");

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
    if (!d) { patch({ end: undefined, endTime: undefined }); return; }
    const iso = toISO(d)!;
    // Keep end ≥ start: picking an earlier "end" swaps the two.
    if (v.date && iso < v.date) { patch({ date: iso, end: v.date }); return; }
    patch({ end: iso });
  };

  // Calendar click target depends on the active field (range mode only).
  const onPick = (d: Date | undefined) => {
    if (rangeMode && editing === "end") { setEnd(d); return; }
    setStart(d);
    if (rangeMode && !v.end) setEditing("end"); // start → next click sets end
  };

  // End date is a PROPERTY-level setting (`prop.dateRange`) — the same switch
  // the column header's edit-property panel toggles — so the two stay in sync.
  const toggleRange = (on: boolean) => {
    onPropPatch?.({ dateRange: on || undefined });
    if (on && v.date && !v.end) patch({ end: v.date });
    else if (!on && (v.end || v.endTime)) patch({ end: undefined, endTime: undefined });
    setEditing("start");
  };

  const rangeModifiers: Record<string, Date | { after: Date; before: Date }> = {};
  if (start) rangeModifiers.rstart = start;
  if (end) rangeModifiers.rend = end;
  if (start && end) rangeModifiers.rmiddle = { after: start, before: end };

  const calSelected = rangeMode ? (editing === "end" ? end : start) : start;

  return (
    <div className="w-[18rem] p-2">
      {/* Date field(s) */}
      {rangeMode ? (
        <div className="mb-2 grid grid-cols-2 gap-2">
          <DateBox
            label={v.date ? formatYmd(v.date, fmt) : ""} placeholder="Start date"
            active={editing === "start"} onClick={() => setEditing("start")}
          />
          <DateBox
            label={v.end ? formatYmd(v.end, fmt) : ""} placeholder="End date"
            active={editing === "end"} onClick={() => setEditing("end")}
          />
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

      {/* Time input(s) — standalone + clickable */}
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

      {/* Clicks handled via onDayClick (fires unconditionally for any enabled
          day) instead of the mode/selected/onSelect state machine — that path
          silently stopped registering clicks under react-day-picker v10 (same
          bug in notion-page-clone). The selected-day + range highlight is
          driven entirely by `modifiers`, so it stays correct without relying on
          rdp's internal selection. */}
      <Calendar
        onDayClick={(d: Date) => onPick(d)}
        defaultMonth={calSelected ?? start}
        numberOfMonths={1}
        modifiers={{
          sel: calSelected ? [calSelected] : [],
          ...(rangeMode ? rangeModifiers : {}),
        }}
        modifiersClassNames={{
          sel: "bg-primary text-primary-foreground rounded-md",
          rstart: "bg-primary text-primary-foreground rounded-l-md",
          rend: "bg-primary text-primary-foreground rounded-r-md",
          rmiddle: "bg-accent/60 rounded-none",
        }}
      />

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
