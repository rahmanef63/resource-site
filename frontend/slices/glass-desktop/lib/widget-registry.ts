// glass-desktop — the widget registry (Build Plan §5.2 "registry, not switch").
// Composition of 47 WidgetDefs — one component + one entry + one seed row each.
import type { WidgetRegistry } from "../types";
import { ClockDigital, ClockWorld, ClockAnalog, ClockFlip, SunArc, DateCard, TimeCombo } from "../features/time";
import { DateBadge, AgendaToday, WeekStrip, CalendarMonth, NextEvent, TicketCard } from "../features/calendar";
import { WeatherNow, WeatherHourly, WeatherDays, WindCompass, PrecipNow, WeatherFull } from "../features/weather";
import { TimerCountdown, Stopwatch, FocusSession, VoiceMemo } from "../features/timers";
import { TaskList, FileSearch, WebSearch, Palette } from "../features/utilities";
import { NowPlaying, AudioEq, ReactionTray, DeviceAudio } from "../features/media";
import { InboxCount, ContactsRow, ContactCard } from "../features/people";
import { SocialCount } from "../features/social";
import { CpuGraph, RingGaugeWidget, QuickToggles, NetThroughput } from "../features/system";
import { TickerSpark, CurrencyConvert, Watchlist, RevenueCard } from "../features/finance";
import { VisitorsSpark, UsageMeter, OrdersSummary, DotHeatmap } from "../features/analytics";

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
