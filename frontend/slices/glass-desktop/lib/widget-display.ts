import type { WidgetDescriptor, WidgetInstance } from "../types";

export interface WidgetDisplay { primary: string; secondary?: string; detail?: string; progress?: number; chips?: string[]; }
const staticDisplay: Record<string, WidgetDisplay> = {
  "timer-countdown": { primary: "12:48", secondary: "Tea timer", progress: 62 },
  "task-list": { primary: "4 tasks", secondary: "2 due today", chips: ["Plan", "Ship"] },
  "agenda-today": { primary: "3 events", secondary: "Next · Design review", detail: "14:30" },
  "weather-now": { primary: "24°", secondary: "Clear", detail: "Feels 25°" },
  "weather-hourly": { primary: "24° · 25° · 23°", secondary: "Now · +1h · +2h" },
  "now-playing": { primary: "Soft Focus", secondary: "Lucent Radio", progress: 38 },
  "audio-eq": { primary: "LIVE", secondary: "48 kHz", progress: 74 },
  "inbox-count": { primary: "12", secondary: "Unread" },
  "contacts-row": { primary: "Mina · Arun · Kai", secondary: "Available now" },
  "cpu-graph": { primary: "42%", secondary: "CPU load", progress: 42 },
  "ring-gauge": { primary: "68%", secondary: "System", progress: 68 },
  "quick-toggles": { primary: "Wi-Fi · Focus", secondary: "2 enabled", chips: ["Wi-Fi", "Focus"] },
  "net-throughput": { primary: "84 ↓  12 ↑", secondary: "Mb/s" },
  "watchlist": { primary: "AAPL +1.8%", secondary: "NVDA +0.6%", detail: "BTC −0.4%" },
  "revenue-card": { primary: "$18.4k", secondary: "Revenue", detail: "+12.6% this month" },
  "dot-heatmap": { primary: "86%", secondary: "Activity", progress: 86 },
  "stopwatch": { primary: "08:42.3", secondary: "Stopwatch" },
  "focus-session": { primary: "25:00", secondary: "Deep work", progress: 30 },
  "voice-memo": { primary: "00:37", secondary: "Recording ready", progress: 54 },
  "week-strip": { primary: "M T W T F S S", secondary: "Week 38", chips: ["Tue 15"] },
  "calendar-month": { primary: "September", secondary: "15 · Today", detail: "4 events" },
  "next-event": { primary: "Design review", secondary: "14:30 · Studio", detail: "Mina, Arun, Kai" },
  "ticket-card": { primary: "CGK → SIN", secondary: "18:45 · Gate 7", detail: "Boarding 18:05" },
  "weather-days": { primary: "24°  25°  23°", secondary: "Tue · Wed · Thu" },
  "wind-compass": { primary: "NE 12", secondary: "km/h" },
  "precip-now": { primary: "8%", secondary: "Rain chance", progress: 8 },
  "weather-full": { primary: "24° Clear", secondary: "H 27° · L 21°", detail: "Humidity 61%" },
  "reaction-tray": { primary: "♥ 24   ✦ 8", secondary: "Live reactions" },
  "device-audio": { primary: "Studio Display", secondary: "Output · 72%", progress: 72 },
  "file-search": { primary: "Search files", secondary: "⌘ K · 24 recent" },
  "web-search": { primary: "Search the web", secondary: "Private session" },
  "palette": { primary: "Blue · Violet", secondary: "5 swatches", chips: ["●", "●", "●"] },
  "social-count": { primary: "12.8k", secondary: "Followers", detail: "+3.2%" },
  "contact-card": { primary: "Mina Chen", secondary: "Product design", detail: "Online" },
  "ticker-spark": { primary: "AAPL $231.18", secondary: "+1.8%", progress: 64 },
  "currency-convert": { primary: "$100 = €84.70", secondary: "USD → EUR" },
  "visitors-spark": { primary: "18.2k", secondary: "Visitors · 7d", detail: "+8.4%" },
  "usage-meter": { primary: "624k", secondary: "Tokens used", progress: 62 },
  "orders-summary": { primary: "128 orders", secondary: "$12.4k GMV", detail: "96% fulfilled" },
};

function time(value: Date, seconds = false) { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: seconds ? "2-digit" : undefined, hour12: false }).format(value); }
function date(value: Date) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short" }).format(value); }

export function widgetDisplay(instance: WidgetInstance, descriptor: WidgetDescriptor, now = new Date()): WidgetDisplay {
  switch (descriptor.id) {
    case "clock-digital": return { primary: time(now), secondary: date(now) };
    case "clock-world": return { primary: `${time(now)} · JKT`, secondary: "08:00 · LDN", detail: "15:00 · TYO" };
    case "clock-analog": return { primary: time(now, true), secondary: "Local time" };
    case "clock-flip": return { primary: time(now), secondary: "Tuesday · September" };
    case "sun-arc": return { primary: "06:01 → 18:04", secondary: "Daylight · 12h 03m", progress: 55 };
    case "date-card": return { primary: String(now.getDate()).padStart(2, "0"), secondary: date(now) };
    case "time-combo": return { primary: `${time(now)} · 24°`, secondary: date(now) };
    case "date-badge": return { primary: String(now.getDate()), secondary: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(now).toUpperCase() };
    case "ring-gauge": {
      const kind = instance.instanceId.split(":")[1] ?? "system";
      const values: Record<string, number> = { battery: 84, memory: 68, storage: 57 };
      const value = values[kind] ?? 68; return { primary: `${value}%`, secondary: kind, progress: value };
    }
    case "social-count": { const network = instance.instanceId.split(":")[1] ?? "social"; return { primary: network === "loop" ? "18.4k" : "9.7k", secondary: network, detail: "+3.2%" }; }
    default: return staticDisplay[descriptor.id] ?? { primary: descriptor.title, secondary: descriptor.family };
  }
}
