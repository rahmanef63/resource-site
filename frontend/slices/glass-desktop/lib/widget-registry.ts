// glass-desktop — the widget registry (Build Plan §5.2 "registry, not switch").
// Composition of 47 WidgetDefs — one component + one entry + one seed row each.
import type { WidgetRegistry } from "../types";
import { ClockDigital } from "../components/widgets/time/clock-digital";
import { DateBadge } from "../components/widgets/calendar/date-badge";
import { ClockWorld } from "../components/widgets/time/clock-world";
import { TimerCountdown } from "../components/widgets/timers/timer-countdown";
import { TaskList } from "../components/widgets/utilities/task-list";
import { AgendaToday } from "../components/widgets/calendar/agenda-today";
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
import { ClockAnalog } from "../components/widgets/time/clock-analog";
import { ClockFlip } from "../components/widgets/time/clock-flip";
import { SunArc } from "../components/widgets/time/sun-arc";
import { DateCard } from "../components/widgets/time/date-card";
import { TimeCombo } from "../components/widgets/time/time-combo";
import { Stopwatch } from "../components/widgets/timers/stopwatch";
import { FocusSession } from "../components/widgets/timers/focus-session";
import { VoiceMemo } from "../components/widgets/timers/voice-memo";
import { WeekStrip } from "../components/widgets/calendar/week-strip";
import { CalendarMonth } from "../components/widgets/calendar/calendar-month";
import { NextEvent } from "../components/widgets/calendar/next-event";
import { TicketCard } from "../components/widgets/calendar/ticket-card";
import { WeatherDays } from "../components/widgets/weather/weather-days";
import { WindCompass } from "../components/widgets/weather/wind-compass";
import { PrecipNow } from "../components/widgets/weather/precip-now";
import { WeatherFull } from "../components/widgets/weather/weather-full";
import { ReactionTray } from "../components/widgets/media/reaction-tray";
import { DeviceAudio } from "../components/widgets/media/device-audio";
import { FileSearch } from "../components/widgets/utilities/file-search";
import { WebSearch } from "../components/widgets/utilities/web-search";
import { Palette } from "../components/widgets/utilities/palette";
import { SocialCount } from "../components/widgets/social/social-count";
import { ContactCard } from "../components/widgets/people/contact-card";
import { TickerSpark } from "../components/widgets/finance/ticker-spark";
import { CurrencyConvert } from "../components/widgets/finance/currency-convert";
import { VisitorsSpark } from "../components/widgets/analytics/visitors-spark";
import { UsageMeter } from "../components/widgets/analytics/usage-meter";
import { OrdersSummary } from "../components/widgets/analytics/orders-summary";

export const widgetRegistry: WidgetRegistry = {
  "clock-digital": { id: "clock-digital", family: "time", size: "WP", title: "Digital Clock", component: ClockDigital },
  "date-badge": { id: "date-badge", family: "calendar", size: "S", title: "Date", component: DateBadge },
  "clock-world": { id: "clock-world", family: "time", size: "W", title: "World Clock", component: ClockWorld },
  "timer-countdown": { id: "timer-countdown", family: "timers", size: "WP", title: "Countdown Timer", component: TimerCountdown },
  "task-list": { id: "task-list", family: "utilities", size: "W", title: "Tasks", component: TaskList },
  "agenda-today": { id: "agenda-today", family: "calendar", size: "S", title: "Today's Agenda", component: AgendaToday },
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
  "clock-analog": { id: "clock-analog", family: "time", size: "S", title: "Analog Clock", component: ClockAnalog },
  "clock-flip": { id: "clock-flip", family: "time", size: "W", title: "Flip Clock", component: ClockFlip },
  "sun-arc": { id: "sun-arc", family: "time", size: "W", title: "Sun Arc", component: SunArc },
  "date-card": { id: "date-card", family: "time", size: "S", title: "Date", component: DateCard },
  "time-combo": { id: "time-combo", family: "time", size: "WP", title: "Date, Time & Temperature", component: TimeCombo },
  "stopwatch": { id: "stopwatch", family: "timers", size: "WP", title: "Stopwatch", component: Stopwatch },
  "focus-session": { id: "focus-session", family: "timers", size: "W", title: "Focus Session", component: FocusSession },
  "voice-memo": { id: "voice-memo", family: "timers", size: "WP", title: "Voice Memo", component: VoiceMemo },
  "week-strip": { id: "week-strip", family: "calendar", size: "W", title: "Week strip", component: WeekStrip },
  "calendar-month": { id: "calendar-month", family: "calendar", size: "W", title: "Month grid", component: CalendarMonth },
  "next-event": { id: "next-event", family: "calendar", size: "L", title: "Next event", component: NextEvent },
  "ticket-card": { id: "ticket-card", family: "calendar", size: "WP", title: "Ticket card", component: TicketCard },
  "weather-days": { id: "weather-days", family: "weather", size: "W", title: "3-Day Forecast", component: WeatherDays },
  "wind-compass": { id: "wind-compass", family: "weather", size: "S", title: "Wind Compass", component: WindCompass },
  "precip-now": { id: "precip-now", family: "weather", size: "S", title: "Precipitation", component: PrecipNow },
  "weather-full": { id: "weather-full", family: "weather", size: "WP", title: "Weather Summary", component: WeatherFull },
  "reaction-tray": { id: "reaction-tray", family: "media", size: "W", title: "Reactions", component: ReactionTray },
  "device-audio": { id: "device-audio", family: "media", size: "W", title: "Output Devices", component: DeviceAudio },
  "file-search": { id: "file-search", family: "utilities", size: "WP", title: "File Search", component: FileSearch },
  "web-search": { id: "web-search", family: "utilities", size: "WP", title: "Web Search", component: WebSearch },
  "palette": { id: "palette", family: "utilities", size: "S", title: "Palette", component: Palette },
  "social-count": { id: "social-count", family: "social", size: "W", title: "Social count", component: SocialCount },
  "contact-card": { id: "contact-card", family: "people", size: "S", title: "Contact card", component: ContactCard },
  "ticker-spark": { id: "ticker-spark", family: "finance", size: "W", title: "Ticker — AAPL", component: TickerSpark },
  "currency-convert": { id: "currency-convert", family: "finance", size: "W", title: "Currency converter", component: CurrencyConvert },
  "visitors-spark": { id: "visitors-spark", family: "analytics", size: "WP", title: "Visitors · last 7d", component: VisitorsSpark },
  "usage-meter": { id: "usage-meter", family: "analytics", size: "WP", title: "Usage · tokens", component: UsageMeter },
  "orders-summary": { id: "orders-summary", family: "analytics", size: "WP", title: "Orders · Northline Supply", component: OrdersSummary },
};
