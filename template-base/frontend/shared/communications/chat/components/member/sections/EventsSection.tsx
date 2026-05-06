import { Calendar } from "lucide-react";

type EventsSectionProps = {
  isMobile: boolean;
};

export function EventsSection({ isMobile }: EventsSectionProps) {
  return (
    <div className={isMobile ? "py-8 text-center" : "py-12 text-center"}>
      <Calendar
        className={[
          "mx-auto text-wa-muted",
          isMobile ? "h-12 w-12" : "h-16 w-16",
        ].join(" ")}
      />
      <p className={isMobile ? "text-base text-wa-muted" : "text-lg text-wa-muted"}>
        No upcoming events to show
      </p>
    </div>
  );
}
