// glass-desktop — seed copy for the "time" family widgets (Build Plan §7).
// LOC-exempt data module. Widgets must read from here — no literals in the TSX.

/** clock-digital: which locale label to show beside the wall-clock face. */
export interface ClockDigitalSeed {
  zoneLabel: string; // caption under the time, e.g. "Local"
}

export const clockDigitalSeed: ClockDigitalSeed = {
  zoneLabel: "Local",
};

/** clock-world: one row per city, time rendered in its IANA time zone. */
export interface WorldZoneSeed {
  city: string;
  tz: string; // IANA time-zone id
  offsetLabel: string; // human offset caption, e.g. "GMT+7"
}

export const clockWorldSeed: WorldZoneSeed[] = [
  { city: "Jakarta", tz: "Asia/Jakarta", offsetLabel: "GMT+7" },
  { city: "London", tz: "Europe/London", offsetLabel: "GMT+1" },
  { city: "New York", tz: "America/New_York", offsetLabel: "GMT-4" },
  { city: "Tokyo", tz: "Asia/Tokyo", offsetLabel: "GMT+9" },
];
