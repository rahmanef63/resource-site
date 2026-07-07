"use client";

// Tiny opt-in UI sound pack — every tone is synthesized at call time via the
// Web Audio API (no binary assets, zero licensing/sourcing risk). Off by
// default; toggled from ControlCenter's "Sounds" switch (see
// components/system/ControlCenter.tsx), which also warms up the shared
// AudioContext so later *programmatic* playSound() calls (e.g. a toast
// firing from a background event) aren't silently blocked by the browser's
// user-gesture autoplay policy.

const STORAGE_KEY = "sv:sounds";

export type SoundName = "notify" | "trash" | "screenshot";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

export function isSoundsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();
/** Subscribe to enabled/disabled changes (useSyncExternalStore-friendly). */
export function subscribeSoundsEnabled(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setSoundsEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    // Storage disabled (private mode etc.) — sounds just stay off.
  }
  if (on) getContext()?.resume().catch(() => {});
  listeners.forEach((cb) => cb());
}

// One short oscillator "blip". Frequencies in Hz, durations in seconds,
// scheduled against the AudioContext clock so multiple tones can be chained.
function tone(c: AudioContext, when: number, freq: number, duration: number, peak = 0.05, type: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(peak, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

const players: Record<SoundName, (c: AudioContext) => void> = {
  // Bright two-tone rise — a notification "pop".
  notify: (c) => {
    const t = c.currentTime;
    tone(c, t, 880, 0.09, 0.05);
    tone(c, t + 0.08, 1320, 0.12, 0.045);
  },
  // Soft descending pair — delete/trash.
  trash: (c) => {
    const t = c.currentTime;
    tone(c, t, 520, 0.14, 0.045, "triangle");
    tone(c, t + 0.06, 330, 0.16, 0.04, "triangle");
  },
  // Two crisp clicks — a camera-shutter-like double-tap.
  screenshot: (c) => {
    const t = c.currentTime;
    tone(c, t, 1800, 0.02, 0.05, "square");
    tone(c, t + 0.035, 1400, 0.03, 0.05, "square");
  },
};

/** Fire-and-forget. No-ops silently when sounds are disabled, Web Audio is
 *  unavailable (SSR/unsupported browser), or the tone itself throws. */
export function playSound(name: SoundName): void {
  if (!isSoundsEnabled()) return;
  const c = getContext();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  try {
    players[name](c);
  } catch {
    // Never let a sound glitch break the caller.
  }
}
