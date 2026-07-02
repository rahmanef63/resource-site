import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyRowData, PropertyColumnConfig } from "./table-columns";
import { SharedCalendar } from "@/frontend/shared/ui/components/event-calendar/SharedCalendar";
import type {
  CalendarEvent,
  CalendarViewMode,
} from "@/frontend/shared/ui/components/event-calendar/types";

export interface UniversalCalendarViewProps {
  /** Calendar data rows */
  data: PropertyRowData[];

  /** Property column configurations */
  properties: PropertyColumnConfig[];

  /** Property key to use for date */
  dateProperty?: string;

  /** Property key to use as title */
  titleProperty?: string;

  /** Callback when event is clicked */
  onEventClick?: (event: PropertyRowData | string) => void;

  /** Callback when date property changes */
  onDatePropertyChange?: (propertyKey: string) => void;

  /** Custom CSS class */
  className?: string;

  /** Callback to add a new row */
  onAddRow?: (date?: Date, propertyKey?: string) => Promise<void> | void;
}

export function UniversalCalendarView({
  data,
  properties,
  dateProperty,
  titleProperty,
  onEventClick,
  onDatePropertyChange,
  className,
  onAddRow,
}: UniversalCalendarViewProps) {
  // Get date properties to select from
  const dateProperties = useMemo(
    () =>
      properties.filter((p) =>
        ["date", "created_time", "last_edited_time"].includes(String(p.type))
      ),
    [properties]
  );

  // Default to first date property if none selected
  const activeDateProperty = dateProperty || dateProperties[0]?.key;

  const titleColumn = useMemo(
    () =>
      (titleProperty && properties.find((property) => property.key === titleProperty)) ||
      properties.find((property) => property.type === "title") ||
      properties[0],
    [properties, titleProperty]
  );

  // Find status property for coloring
  const statusProperty = useMemo(
    () => properties.find((p) => p.type === "status" || p.type === "select"),
    [properties]
  );

  const events = useMemo<CalendarEvent[]>(() => {
    if (!activeDateProperty || !data) return [];

    return data.reduce<CalendarEvent[]>((acc, row) => {
        const dateValue = row.properties[activeDateProperty];
        let startDate: Date | undefined;

        if (!dateValue) return acc;

        if (typeof dateValue === "number" || typeof dateValue === "string") {
          startDate = new Date(dateValue);
        } else if (dateValue instanceof Date) {
          startDate = dateValue;
        }

        if (!startDate || isNaN(startDate.getTime())) return acc;

        let title = row.id;
        if (titleColumn) {
          const tVal = row.properties[titleColumn.key];
          if (typeof tVal === "string") title = tVal;
          else if (tVal && typeof tVal === "object" && "text" in tVal) title = (tVal as { text: string }).text;
        }

        let color = "#3b82f6";
        if (statusProperty) {
          const sVal = row.properties[statusProperty.key];
          if (sVal && typeof sVal === "object" && "color" in sVal) {
            color = (sVal as { color?: string }).color || color;
          }
        }

        acc.push({
          id: row.id,
          title,
          startsAt: startDate,
          endsAt: startDate,
          color,
          allDay: true,
          originalData: row,
        });

        return acc;
      }, []);
  }, [activeDateProperty, data, statusProperty, titleColumn]);

  const initialMonth = useMemo(
    () => (events[0]?.startsAt ? new Date(events[0].startsAt) : new Date()),
    [events]
  );
  const [month, setMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialMonth);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

  useEffect(() => {
    setMonth(initialMonth);
    setSelectedDate(initialMonth);
  }, [initialMonth]);

  if (!activeDateProperty && dateProperties.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        No date properties found in this database. Add a date property to use the Calendar view.
      </div>
    );
  }

  return (
    <div className={cn("h-full", className)}>
      <SharedCalendar
        month={month}
        onMonthChange={setMonth}
        date={selectedDate}
        onDateSelect={setSelectedDate}
        events={events}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEventClick={(event) => onEventClick?.(event.originalData ?? event.id)}
        onAddEventClick={(date) => onAddRow?.(date, activeDateProperty)}
        customControls={
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Date:</span>
              <Select
                value={activeDateProperty}
                onValueChange={onDatePropertyChange}
                disabled={!onDatePropertyChange || dateProperties.length <= 1}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date property" />
                </SelectTrigger>
                <SelectContent>
                  {dateProperties.map((prop) => (
                    <SelectItem key={prop.key} value={prop.key}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              View settings
            </Button>
          </>
        }
        renderEvent={(event) => (
          <div
            className="flex w-full items-center gap-1 truncate rounded-md px-2 py-1 text-[11px] font-medium shadow-sm"
            style={{
              backgroundColor: `${event.color ?? "#3b82f6"}20`,
              color: event.color ?? "#3b82f6",
            }}
            title={event.title}
          >
            {onDatePropertyChange && <GripVertical className="h-3 w-3 shrink-0" />}
            <span className="truncate">{event.title}</span>
          </div>
        )}
      />
    </div>
  );
}

export default UniversalCalendarView;
