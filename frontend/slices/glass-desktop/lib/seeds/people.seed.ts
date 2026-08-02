// glass-desktop — people family seed data (Build Plan §7, LOC-exempt seed).
// inbox-count and contacts-row render only from these values.

export interface InboxCategory {
  label: string;
  count: number;
  /** CSS custom-property reference for the category dot. */
  accent: string;
}

export interface InboxSeed {
  label: string;
  unread: number;
  categories: InboxCategory[];
}

export const inbox: InboxSeed = {
  label: "Inbox",
  unread: 12,
  categories: [
    { label: "Primary", count: 5, accent: "var(--color-accent-blue)" },
    { label: "Social", count: 4, accent: "var(--color-accent-violet)" },
    { label: "Updates", count: 3, accent: "var(--color-accent-amber)" },
  ],
};

export interface Contact {
  name: string;
  initials: string;
  /** CSS custom-property reference for the avatar fill. */
  accent: string;
}

export const contacts: Contact[] = [
  { name: "Mara Vance", initials: "MV", accent: "var(--color-accent-coral)" },
  { name: "Idris Bell", initials: "IB", accent: "var(--color-accent-blue)" },
  { name: "Lena Ortiz", initials: "LO", accent: "var(--color-accent-green)" },
  { name: "Theo Park", initials: "TP", accent: "var(--color-accent-violet)" },
];
