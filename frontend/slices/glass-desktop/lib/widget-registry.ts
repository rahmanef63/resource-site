// React renderer registry: portable metadata + React component map.
import type { WidgetRegistry } from "../react-types";
import { widgetCatalog } from "./widget-catalog";
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

const components: Record<string, WidgetRegistry[string]["component"]> = {
  "clock-digital": ClockDigital,
  "date-badge": DateBadge,
  "clock-world": ClockWorld,
  "timer-countdown": TimerCountdown,
  "task-list": TaskList,
  "agenda-today": AgendaToday,
  "weather-now": WeatherNow,
  "weather-hourly": WeatherHourly,
  "now-playing": NowPlaying,
  "audio-eq": AudioEq,
  "inbox-count": InboxCount,
  "contacts-row": ContactsRow,
  "cpu-graph": CpuGraph,
  "ring-gauge": RingGaugeWidget,
  "quick-toggles": QuickToggles,
  "net-throughput": NetThroughput,
  "watchlist": Watchlist,
  "revenue-card": RevenueCard,
  "dot-heatmap": DotHeatmap,
  "clock-analog": ClockAnalog,
  "clock-flip": ClockFlip,
  "sun-arc": SunArc,
  "date-card": DateCard,
  "time-combo": TimeCombo,
  "stopwatch": Stopwatch,
  "focus-session": FocusSession,
  "voice-memo": VoiceMemo,
  "week-strip": WeekStrip,
  "calendar-month": CalendarMonth,
  "next-event": NextEvent,
  "ticket-card": TicketCard,
  "weather-days": WeatherDays,
  "wind-compass": WindCompass,
  "precip-now": PrecipNow,
  "weather-full": WeatherFull,
  "reaction-tray": ReactionTray,
  "device-audio": DeviceAudio,
  "file-search": FileSearch,
  "web-search": WebSearch,
  "palette": Palette,
  "social-count": SocialCount,
  "contact-card": ContactCard,
  "ticker-spark": TickerSpark,
  "currency-convert": CurrencyConvert,
  "visitors-spark": VisitorsSpark,
  "usage-meter": UsageMeter,
  "orders-summary": OrdersSummary,
};

export const widgetRegistry = Object.fromEntries(
  Object.entries(widgetCatalog).map(([id, descriptor]) => [id, { ...descriptor, component: components[id] }]),
) as WidgetRegistry;
