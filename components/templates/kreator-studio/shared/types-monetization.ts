// Monetization + testimonials types — extracted from types.ts to keep both
// files under the 200-LOC cap. Imported back into types.ts via re-export.

import type { Channel } from "./types-channels";

/** Testimonial — wall-of-love entry from clients/audience. */
export type Testimonial = {
  id: string;
  author: string;
  role: string; // "Founder, Brand X" / "Newsletter reader"
  company?: string;
  quote: string;
  rating: number; // 1-5
  channel?: Channel | "client" | "audience";
  avatar: string; // emoji placeholder
  gradient: string; // tailwind gradient util
  featured?: boolean;
  receivedAt: number;
};

/** Featured client/brand logo strip entry. */
export type FeaturedClient = {
  id: string;
  name: string;
  initial: string;
  gradient: string;
};

/** Revenue source kind for monetization view. */
export type MonetizationKind =
  | "sponsor"
  | "affiliate"
  | "product"
  | "course"
  | "subscription";

/** Revenue line — one source, total in IDR. */
export type MonetizationSource = {
  id: string;
  kind: MonetizationKind;
  label: string;
  amountIdr: number; // current period (this month)
  share: number; // 0-100 percent of total
  growth: number; // pct vs last month, can be negative
};

/** Monthly revenue point for ASCII bar chart. */
export type MonetizationMonth = {
  id: string;
  period: string; // "Jan 2026"
  amountIdr: number;
};

/** Scheduled payout — sponsor invoice / affiliate disbursement / etc. */
export type Payout = {
  id: string;
  source: string; // counterparty name
  kind: MonetizationKind;
  amountIdr: number;
  status: "scheduled" | "in-review" | "paid";
  dueAt: number;
};
