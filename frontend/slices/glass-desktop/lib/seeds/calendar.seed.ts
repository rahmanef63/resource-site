// glass-desktop — seed copy for the "calendar" family widgets (Build Plan §7).
// LOC-exempt data module. Widgets must read from here — no literals in the TSX.

/** date-badge: header accent + optional caption (day/month derive from the clock). */
export interface DateBadgeSeed {
  accent: string; // CSS var for the header strip
  caption: string; // small caption under the day number
}

export const dateBadgeSeed: DateBadgeSeed = {
  accent: "var(--color-accent-coral)",
  caption: "Today",
};

/** agenda-today: an ordered list of the day's events. */
export interface AgendaEventSeed {
  id: string;
  time: string; // "HH:MM" 24h label
  title: string;
  accent: string; // CSS var for the event dot
}

export const agendaTodaySeed: AgendaEventSeed[] = [
  { id: "standup", time: "09:30", title: "Team standup", accent: "var(--color-accent-blue)" },
  { id: "review", time: "13:00", title: "Design review", accent: "var(--color-accent-violet)" },
  { id: "focus", time: "16:00", title: "Focus block", accent: "var(--color-accent-green)" },
];
