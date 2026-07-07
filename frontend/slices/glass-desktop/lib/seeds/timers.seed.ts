// glass-desktop — seed copy for the "timers" family widgets (Build Plan §7).
// LOC-exempt data module. Widgets must read from here — no literals in the TSX.

/** timer-countdown: default duration + labels for its transport controls. */
export interface TimerCountdownSeed {
  durationSec: number; // starting duration
  label: string; // caption above the readout
  startLabel: string;
  pauseLabel: string;
  resetLabel: string;
}

export const timerCountdownSeed: TimerCountdownSeed = {
  durationSec: 300, // 5:00
  label: "Countdown",
  startLabel: "Start",
  pauseLabel: "Pause",
  resetLabel: "Reset",
};
