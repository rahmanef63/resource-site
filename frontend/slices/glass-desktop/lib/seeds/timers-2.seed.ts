// glass-desktop — seed copy for the second "timers" batch (Build Plan §7).
// LOC-exempt data module. Widgets read from here — no literals in the TSX.
// Covers stopwatch (§7 row 10), focus-session (row 11) and voice-memo (row 12).

/** stopwatch: deciseconds readout + transport labels. */
export interface StopwatchSeed {
  label: string; // caption above the readout
  startLabel: string;
  pauseLabel: string;
  resetLabel: string;
}

export const stopwatchSeed: StopwatchSeed = {
  label: "Stopwatch",
  startLabel: "Start",
  pauseLabel: "Pause",
  resetLabel: "Reset",
};

/** focus-session: pomodoro-style running session over a coral ring. The demo
 *  opens mid-session — "Focus 2/4 · 18:42 · every 30 min". */
export interface FocusSessionSeed {
  label: string; // "Focus"
  totalSessions: number; // 4
  currentSession: number; // 1-based display (2 → "2/4")
  intervalMin: number; // 30 → "every 30 min"
  durationSec: number; // one session length (1800)
  elapsedSec: number; // banked time this session (678 → 18:42 remaining)
  running: boolean; // starts paused so the seed text is stable
  ringColor: string; // token ref (coral)
  everyLabel: string; // "every 30 min"
  pauseLabel: string;
  resumeLabel: string;
  skipLabel: string;
}

export const focusSessionSeed: FocusSessionSeed = {
  label: "Focus",
  totalSessions: 4,
  currentSession: 2,
  intervalMin: 30,
  durationSec: 1800,
  elapsedSec: 678, // 1800 − 1122 → remaining 18:42
  running: false,
  ringColor: "var(--color-accent-coral)",
  everyLabel: "every 30 min",
  pauseLabel: "Pause",
  resumeLabel: "Resume",
  skipLabel: "Skip",
};

/** voice-memo: simulated recording (no mic API) — elapsed runs up, 24-bar
 *  waveform pulses while recording. Demo opens paused at "0:14". */
export interface VoiceMemoSeed {
  label: string; // "Voice Memo"
  bars: number; // 24-bar waveform
  elapsedSec: number; // 14 → "0:14"
  recording: boolean;
  color: string; // waveform token ref (coral)
  resumeLabel: string;
  pauseLabel: string;
  stopLabel: string;
}

export const voiceMemoSeed: VoiceMemoSeed = {
  label: "Voice Memo",
  bars: 24,
  elapsedSec: 14,
  recording: false,
  color: "var(--color-accent-coral)",
  resumeLabel: "Resume",
  pauseLabel: "Pause",
  stopLabel: "Stop",
};
