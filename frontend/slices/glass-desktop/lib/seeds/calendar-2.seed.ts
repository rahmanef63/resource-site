// glass-desktop — seed copy for the "calendar-2" batch widgets (Build Plan §7).
// LOC-exempt data module. Widgets must read from here — no literals in the TSX.
// Anchored to July 2026: the 1st is a Wednesday, so the 7th is a Tuesday.

/** week-strip: month label + a Mon–Sun run of day chips. */
export interface WeekDaySeed {
  id: string;
  label: string; // "Mon"…"Sun"
  date: number; // day-of-month
  highlight?: boolean; // ring-highlighted "today"
  dots: string[]; // event-dot colours (CSS vars)
}

export interface WeekStripSeed {
  month: string;
  days: WeekDaySeed[];
}

export const weekStripSeed: WeekStripSeed = {
  month: "July",
  days: [
    { id: "mon", label: "Mon", date: 6, dots: [] },
    {
      id: "tue",
      label: "Tue",
      date: 7,
      highlight: true,
      dots: ["var(--color-accent-blue)", "var(--color-accent-violet)"],
    },
    { id: "wed", label: "Wed", date: 8, dots: [] },
    { id: "thu", label: "Thu", date: 9, dots: [] },
    { id: "fri", label: "Fri", date: 10, dots: [] },
    { id: "sat", label: "Sat", date: 11, dots: [] },
    { id: "sun", label: "Sun", date: 12, dots: [] },
  ],
};

/** calendar-month: a mini month grid. Leading blanks pad to the Mon-first week. */
export interface CalendarMonthSeed {
  month: string;
  weekdays: string[]; // single-letter column heads, Mon-first
  leadingBlanks: number; // empty cells before day 1
  daysInMonth: number;
  today: number; // filled accent-blue
}

export const calendarMonthSeed: CalendarMonthSeed = {
  month: "July",
  weekdays: ["M", "T", "W", "T", "F", "S", "S"],
  leadingBlanks: 2, // July 1 2026 is a Wednesday
  daysInMonth: 31,
  today: 7,
};

/** next-event: a hero date plus a stack of upcoming event cards. */
export interface NextEventSeed {
  id: string;
  time: string; // "HH:MM" 24h
  title: string;
  accent: string; // left accent-bar colour (CSS var)
}

export interface NextEventStackSeed {
  bigDay: string; // "07"
  bigMonth: string; // "JUL"
  events: NextEventSeed[];
  moreCount: number; // "+N more"
}

export const nextEventSeed: NextEventStackSeed = {
  bigDay: "07",
  bigMonth: "JUL",
  events: [
    { id: "standup", time: "09:30", title: "Team standup", accent: "var(--color-accent-blue)" },
    { id: "roadmap", time: "13:00", title: "Roadmap review", accent: "var(--color-accent-violet)" },
    { id: "focus", time: "16:00", title: "Focus block", accent: "var(--color-accent-green)" },
  ],
  moreCount: 3,
};

/** ticket-card: a single issue-tracker row with a status dot. */
export interface TicketCardSeed {
  ref: string; // "LUC-142"
  title: string;
  status: string; // "In progress"
  due: string; // "Today"
  tone: string; // status dot — a --tone-* var (amber = warn)
}

export const ticketCardSeed: TicketCardSeed = {
  ref: "LUC-142",
  title: "Dock tooltip clips at edge",
  status: "In progress",
  due: "Today",
  tone: "var(--tone-warn)",
};
