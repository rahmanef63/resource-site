"use client";

import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarYearPicker,
  CalendarMonthPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  type Feature as CalendarFeature,
} from "@/components/kibo-ui/calendar";
import type { DatabaseFeature, DatabaseStatus } from "../../../types";

export interface DatabaseCalendarViewProps {
  features: DatabaseFeature[];
  years: {
    earliest: number;
    latest: number;
  };
}

export function DatabaseCalendarView({
  features,
  years,
}: DatabaseCalendarViewProps) {
  const calendarFeatures: CalendarFeature[] = features
    .filter(
      (feature): feature is DatabaseFeature & { startAt: Date; endAt: Date } =>
        Boolean(feature.startAt) && Boolean(feature.endAt),
    )
    .map((feature) => {
      const status: DatabaseStatus | null | undefined = feature.status;
      const colorFallback = "#6366f1"; // indigo-500

      return {
        id: String(feature.id),
        name: feature.name,
        startAt: feature.startAt!,
        endAt: feature.endAt!,
        status: {
          id: status?.id ?? "status",
          name: status?.name ?? "Scheduled",
          color: status?.color ?? colorFallback,
        },
      };
    });

  return (
    <CalendarProvider>
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker start={years.earliest} end={years.latest} />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>
      <CalendarHeader />
      <CalendarBody features={calendarFeatures}>
        {({ feature }) => (
          <div key={feature.id} className="flex flex-col gap-1">
            <span className="text-xs font-medium">{feature.name}</span>
            <span className="text-xs text-muted-foreground">
              {feature.status.name}
            </span>
          </div>
        )}
      </CalendarBody>
    </CalendarProvider>
  );
}
