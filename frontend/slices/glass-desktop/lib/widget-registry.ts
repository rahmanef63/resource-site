// glass-desktop — the widget registry (Build Plan §5.2 "registry, not switch").
// Composed from the family widget components; one entry per WidgetDef. Adding a
// widget = one component + one entry here + one seed row.
import type { WidgetRegistry } from "../types";
import { ClockDigital } from "../components/widgets/time/clock-digital";
import { ClockWorld } from "../components/widgets/time/clock-world";
import { DateBadge } from "../components/widgets/calendar/date-badge";
import { AgendaToday } from "../components/widgets/calendar/agenda-today";
import { TimerCountdown } from "../components/widgets/timers/timer-countdown";
import { TaskList } from "../components/widgets/utilities/task-list";
import { WeatherNow } from "../components/widgets/weather/weather-now";
import { WeatherHourly } from "../components/widgets/weather/weather-hourly";
import { NowPlaying } from "../components/widgets/media/now-playing";
import { AudioEq } from "../components/widgets/media/audio-eq";
import { InboxCount } from "../components/widgets/people/inbox-count";
import { ContactsRow } from "../components/widgets/people/contacts-row";
import { CpuGraph } from "../components/widgets/system-finance-analytics/cpu-graph";
import { RingGaugeWidget } from "../components/widgets/system-finance-analytics/ring-gauge";
import { QuickToggles } from "../components/widgets/system-finance-analytics/quick-toggles";
import { NetThroughput } from "../components/widgets/system-finance-analytics/net-throughput";
import { Watchlist } from "../components/widgets/system-finance-analytics/watchlist";
import { RevenueCard } from "../components/widgets/system-finance-analytics/revenue-card";
import { DotHeatmap } from "../components/widgets/system-finance-analytics/dot-heatmap";

export const widgetRegistry: WidgetRegistry = {
  "clock-digital": { id: "clock-digital", family: "time", size: "WP", title: "Digital Clock", component: ClockDigital },
  "clock-world": { id: "clock-world", family: "time", size: "W", title: "World Clock", component: ClockWorld },
  "date-badge": { id: "date-badge", family: "calendar", size: "S", title: "Date", component: DateBadge },
  "agenda-today": { id: "agenda-today", family: "calendar", size: "S", title: "Today's Agenda", component: AgendaToday },
  "timer-countdown": { id: "timer-countdown", family: "timers", size: "WP", title: "Countdown Timer", component: TimerCountdown },
  "task-list": { id: "task-list", family: "utilities", size: "W", title: "Tasks", component: TaskList },
  "weather-now": { id: "weather-now", family: "weather", size: "S", title: "Weather Now", component: WeatherNow },
  "weather-hourly": { id: "weather-hourly", family: "weather", size: "WP", title: "Hourly Forecast", component: WeatherHourly },
  "now-playing": { id: "now-playing", family: "media", size: "WP", title: "Now Playing", component: NowPlaying },
  "audio-eq": { id: "audio-eq", family: "media", size: "SP", title: "Audio EQ", component: AudioEq },
  "inbox-count": { id: "inbox-count", family: "people", size: "S", title: "Inbox", component: InboxCount },
  "contacts-row": { id: "contacts-row", family: "people", size: "WP", title: "Contacts", component: ContactsRow },
  "cpu-graph": { id: "cpu-graph", family: "system", size: "W", title: "CPU Load", component: CpuGraph },
  "ring-gauge": { id: "ring-gauge", family: "system", size: "S", title: "System Ring", component: RingGaugeWidget },
  "quick-toggles": { id: "quick-toggles", family: "system", size: "WP", title: "Quick Toggles", component: QuickToggles },
  "net-throughput": { id: "net-throughput", family: "system", size: "WP", title: "Network", component: NetThroughput },
  "watchlist": { id: "watchlist", family: "finance", size: "W", title: "Watchlist", component: Watchlist },
  "revenue-card": { id: "revenue-card", family: "finance", size: "WP", title: "Revenue", component: RevenueCard },
  "dot-heatmap": { id: "dot-heatmap", family: "analytics", size: "WP", title: "Activity", component: DotHeatmap },
};
