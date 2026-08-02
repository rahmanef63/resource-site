// glass-desktop — weather batch-2 seed data (Build Plan §7, LOC-exempt seed).
// New file (concurrent agents own weather.seed.ts). Every literal the batch-2
// weather widgets render lives here — the TSX carries none. Fictional city Porto.

/** Icon key → the TSX maps this to a lucide glyph (icons aren't serializable). */
export type WeatherGlyph = "sun" | "cloud" | "partly" | "rain";

/** One forecast column: short day label, temperature, condition glyph key. */
export interface WeatherDay {
  label: string;
  tempC: number;
  glyph: WeatherGlyph;
}

export interface WeatherDaysSeed {
  location: string;
  todayC: number;
  todayGlyph: WeatherGlyph;
  days: WeatherDay[];
}

export interface WindCompassSeed {
  /** Cardinal the needle points toward. */
  direction: string;
  /** Compass bearing in degrees (0 = N, 225 = SW). */
  bearing: number;
  speedC: number;
  gustsC: number;
  unit: string;
}

export interface PrecipNowSeed {
  condition: string;
  tempC: number;
  ends: string;
  glyph: WeatherGlyph;
}

export interface WeatherFullSeed {
  location: string;
  wind: string;
  precip: string;
  tempC: number;
  glyph: WeatherGlyph;
}

export const weatherDays: WeatherDaysSeed = {
  location: "Porto",
  todayC: 21,
  todayGlyph: "partly",
  days: [
    { label: "Wed", tempC: 22, glyph: "sun" },
    { label: "Thu", tempC: 19, glyph: "cloud" },
    { label: "Fri", tempC: 21, glyph: "partly" },
  ],
};

export const windCompass: WindCompassSeed = {
  direction: "SW",
  bearing: 225,
  speedC: 18,
  gustsC: 28,
  unit: "km/h",
};

export const precipNow: PrecipNowSeed = {
  condition: "Rain",
  tempC: 21,
  ends: "ends ~40 min",
  glyph: "rain",
};

export const weatherFull: WeatherFullSeed = {
  location: "Porto",
  wind: "18 km/h",
  precip: "0 mm",
  tempC: 21,
  glyph: "partly",
};
