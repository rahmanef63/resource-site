// glass-desktop — seed copy for the second "time" family batch (Build Plan §7).
// LOC-exempt data module. Widgets must read from here — no literals in the TSX.
// New file (concurrent agents own the original time.seed.ts — do not edit that).

/** clock-analog: hand + tick geometry (percent of the square). No rendered copy. */
export interface ClockAnalogSeed {
  hour: { len: number; width: number }; // hand length (% of radius) + px width
  minute: { len: number; width: number };
  second: { len: number; width: number };
  tickCount: number;
}

export const clockAnalogSeed: ClockAnalogSeed = {
  hour: { len: 26, width: 4 },
  minute: { len: 38, width: 3 },
  second: { len: 42, width: 2 },
  tickCount: 12,
};

/** clock-flip: the HH:MM split-flap face — separator glyph only, digits live. */
export interface ClockFlipSeed {
  separator: string;
  fallback: string; // placeholder digits until the client mounts
}

export const clockFlipSeed: ClockFlipSeed = {
  separator: ":",
  fallback: "--",
};

/** sun-arc: fixed sunrise/sunset for the day, plus their minute-of-day anchors. */
export interface SunArcSeed {
  sunrise: string;
  sunset: string;
  sunriseMin: number; // minutes past local midnight
  sunsetMin: number;
  riseLabel: string;
  setLabel: string;
}

export const sunArcSeed: SunArcSeed = {
  sunrise: "05:58",
  sunset: "21:04",
  sunriseMin: 5 * 60 + 58, // 358
  sunsetMin: 21 * 60 + 4, // 1264
  riseLabel: "Sunrise",
  setLabel: "Sunset",
};

/** date-card: the static weekday caption + long-date title (Build Plan §7). */
export interface DateCardSeed {
  caption: string;
  title: string;
}

export const dateCardSeed: DateCardSeed = {
  caption: "Tuesday",
  title: "July 7",
};

/** time-combo: temperature reading + the pre-mount placeholder line. */
export interface TimeComboSeed {
  tempC: number;
  fallback: string;
}

export const timeComboSeed: TimeComboSeed = {
  tempC: 21,
  fallback: "Jul 7, Tuesday · --:-- · 21°",
};
