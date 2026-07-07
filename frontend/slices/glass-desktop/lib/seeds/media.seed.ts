// glass-desktop — media family seed data (Build Plan §7, LOC-exempt seed).
// now-playing and audio-eq both persist/read this shape under STORAGE.media, so
// the seed is the single source of the demo playback state.

export interface MediaState {
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  positionSec: number;
  playing: boolean;
  /** CSS custom-property reference for the album/accent colour. */
  accent: string;
}

export const mediaSeed: MediaState = {
  title: "Glass Horizon",
  artist: "Aurora Skies",
  album: "Neon Fields",
  durationSec: 233,
  positionSec: 74,
  playing: false,
  accent: "var(--color-accent-violet)",
};

export interface AudioEqSeed {
  label: string;
  bars: number;
}

export const audioEq: AudioEqSeed = {
  label: "Now Playing",
  bars: 7,
};
