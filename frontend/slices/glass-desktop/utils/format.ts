// glass-desktop — number/date/duration formatting, Intl locale pinned to en-GB
// (Build Plan §7 "Hydration rule"). Pinning the locale makes server and client
// output byte-identical, so formatted text never triggers a hydration mismatch.
// Formatters are module-cached (constructing Intl.* is comparatively expensive).

const CLOCK_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const COMPACT_FMT = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const WEEKDAY_LONG_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
const WEEKDAY_SHORT_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const MONTH_SHORT_FMT = new Intl.DateTimeFormat("en-GB", { month: "short" });

// timeZone formatters are comparatively expensive to build; cache one per zone.
const ZONE_FMT_CACHE = new Map<string, Intl.DateTimeFormat>();
function zoneFmt(timeZone: string): Intl.DateTimeFormat {
  let fmt = ZONE_FMT_CACHE.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });
    ZONE_FMT_CACHE.set(timeZone, fmt);
  }
  return fmt;
}

const MONEY_FMT = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Wall-clock face "HH:MM:SS" (24h, en-GB, local time zone). */
export function clockFace(date: Date): string {
  return CLOCK_FMT.format(date);
}

/**
 * Human duration from seconds: "4:19", "1:04:19" (hours appear only when > 0).
 * Deciseconds ("0:13.0") render automatically when `sec` is fractional, or on
 * demand via `{ deci: true }` for stopwatch-style always-on tenths.
 */
export function duration(sec: number, opts?: { deci?: boolean }): string {
  const total = Math.max(0, sec);
  const whole = Math.floor(total);
  const showDeci = opts?.deci ?? total % 1 !== 0;
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const tenths = showDeci ? "." + Math.floor((total - whole) * 10) : "";
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}${tenths}`;
  return `${m}:${pad(s)}${tenths}`;
}

/** Weekday full name for the calendar header, e.g. "Monday". */
export function weekdayLong(date: Date): string {
  return WEEKDAY_LONG_FMT.format(date);
}

/** Weekday abbreviation, e.g. "Mon". */
export function weekdayShort(date: Date): string {
  return WEEKDAY_SHORT_FMT.format(date);
}

/** Month abbreviation, e.g. "Jul". */
export function monthShort(date: Date): string {
  return MONTH_SHORT_FMT.format(date);
}

/** Day-of-month number, e.g. 7. */
export function dayOfMonth(date: Date): number {
  return date.getDate();
}

/** Wall-clock "HH:MM" (24h) rendered in an IANA time zone, e.g. "09:41". */
export function zoneTime(date: Date, timeZone: string): string {
  return zoneFmt(timeZone).format(date);
}

/** Compact count: 12400 → "12.4K", 1200000 → "1.2M", 999 → "999".
 *  en-GB emits a lowercase "k"; we upcase the suffix to the spec's "K". */
export function compact(n: number): string {
  return COMPACT_FMT.format(n).toUpperCase();
}

/** Grouped 2-decimal money value (no symbol): 462.35 → "462.35",
 *  1234.5 → "1,234.50". Widgets append the currency code/label themselves. */
export function currency(n: number): string {
  return MONEY_FMT.format(n);
}
