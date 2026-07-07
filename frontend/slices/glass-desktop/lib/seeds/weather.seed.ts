// glass-desktop — weather family seed data (Build Plan §7, LOC-exempt seed).
// Every literal a weather widget renders lives here — the TSX carries none.

export interface WeatherNowSeed {
  location: string;
  condition: string;
  tempC: number;
  high: number;
  low: number;
}

/** One hour of the strip: label, temperature, precip probability (0–100). */
export interface WeatherHour {
  label: string;
  tempC: number;
  pop: number;
}

export interface WeatherHourlySeed {
  location: string;
  hours: WeatherHour[];
}

export const weatherNow: WeatherNowSeed = {
  location: "San Francisco",
  condition: "Partly Cloudy",
  tempC: 18,
  high: 21,
  low: 13,
};

export const weatherHourly: WeatherHourlySeed = {
  location: "San Francisco",
  hours: [
    { label: "Now", tempC: 18, pop: 10 },
    { label: "13", tempC: 19, pop: 5 },
    { label: "14", tempC: 21, pop: 0 },
    { label: "15", tempC: 20, pop: 15 },
    { label: "16", tempC: 18, pop: 30 },
    { label: "17", tempC: 16, pop: 40 },
  ],
};
