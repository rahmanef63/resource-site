"use client";

import * as React from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "../../../shared/store";
import type { CalendarEvent, CalendarEventKind } from "../../../shared/types";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const HOUR_START = 8;
const HOUR_END = 20;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i + HOUR_START);

const KIND_STYLE: Record<CalendarEventKind, string> = {
  session: "border-violet-500/40 bg-violet-500/10 text-violet-100",
  deadline: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  workshop: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  internal: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
};

const KIND_LABEL: Record<CalendarEventKind, string> = {
  session: "Sesi klien",
  deadline: "Deadline",
  workshop: "Workshop",
  internal: "Internal",
};

function fmtHour(h: number): string {
  return `${String(h).padStart(2, "0")}.00`;
}

export function CalendarView() {
  const { state } = useStore();
  const events = state.calendarEvents;
  const clientMap = React.useMemo(
    () => new Map(state.clients.map((c) => [c.id, c.company])),
    [state.clients],
  );

  // Group by dayOfWeek for grid; only events within visible HOUR range.
  const byDay = React.useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (let d = 0; d < 7; d++) map.set(d, []);
    for (const ev of events) {
      if (ev.hour < HOUR_START || ev.hour >= HOUR_END) continue;
      map.get(ev.dayOfWeek)?.push(ev);
    }
    return map;
  }, [events]);

  // Side panel: next 5 events ordered by (day, hour).
  const upcoming = React.useMemo(
    () =>
      [...events]
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.hour - b.hour)
        .slice(0, 5),
    [events],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar minggu ini</h1>
          <p className="text-sm text-muted-foreground">
            {events.length} event terjadwal · sesi klien, deadline, workshop, internal.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          {fmtHour(HOUR_START)} – {fmtHour(HOUR_END)}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3">
            <ScrollArea className="w-full">
              <div className="min-w-[760px]">
                {/* Header row */}
                <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-1 border-b border-border/40 pb-2">
                  <div />
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-[11px] uppercase tracking-wider text-muted-foreground">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Hour rows */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-1 border-b border-border/20 py-1"
                  >
                    <div className="pt-1 text-right text-[10px] font-mono text-muted-foreground">
                      {fmtHour(h)}
                    </div>
                    {DAYS.map((_, dIdx) => {
                      const slotEvents = (byDay.get(dIdx) ?? []).filter((e) => e.hour === h);
                      return (
                        <div key={dIdx} className="min-h-[44px] space-y-1">
                          {slotEvents.map((ev) => (
                            <div
                              key={ev.id}
                              className={`rounded-md border px-2 py-1 text-[10px] leading-tight ${KIND_STYLE[ev.kind]}`}
                              title={`${ev.title} — ${ev.location}`}
                            >
                              <p className="truncate font-medium">{ev.title}</p>
                              <p className="truncate opacity-70">
                                {ev.durationHours}h · {ev.location}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                5 event berikutnya
              </p>
            </div>
            <ul className="space-y-3">
              {upcoming.map((ev) => (
                <li key={ev.id} className="space-y-1 border-l-2 border-border/40 pl-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {KIND_LABEL[ev.kind]}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {DAYS[ev.dayOfWeek]} {fmtHour(ev.hour)}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{ev.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {ev.durationHours}h
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="size-3" />
                      {ev.location}
                    </span>
                  </div>
                  {ev.clientId ? (
                    <p className="text-[10px] text-muted-foreground">
                      {clientMap.get(ev.clientId) ?? ev.clientId}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
