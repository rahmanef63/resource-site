// Monetization seeds — revenue sources, monthly bars, payout schedule.
// All amounts in IDR (rupiah), creator-economy realistic.

import type { MonetizationMonth, MonetizationSource, Payout } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;
const future = (n: number) => now + n * 24 * 60 * 60 * 1000;

export const SEED_MONETIZATION_SOURCES: MonetizationSource[] = [
  {
    id: "ms-sponsor",
    kind: "sponsor",
    label: "Newsletter sponsorship",
    amountIdr: 32_000_000,
    share: 42,
    growth: 18,
  },
  {
    id: "ms-product",
    kind: "product",
    label: "Digital product (Creator OS)",
    amountIdr: 18_400_000,
    share: 24,
    growth: 6,
  },
  {
    id: "ms-affiliate",
    kind: "affiliate",
    label: "Affiliate (Notion, Riverside, Beehiiv)",
    amountIdr: 9_200_000,
    share: 12,
    growth: -4,
  },
  {
    id: "ms-course",
    kind: "course",
    label: "Cohort course — Creator Sprint",
    amountIdr: 12_000_000,
    share: 16,
    growth: 24,
  },
  {
    id: "ms-subscription",
    kind: "subscription",
    label: "Paid newsletter tier",
    amountIdr: 4_800_000,
    share: 6,
    growth: 12,
  },
];

export const SEED_MONETIZATION_MONTHS: MonetizationMonth[] = [
  { id: "mm-1",  period: "Jun 2025", amountIdr: 32_400_000 },
  { id: "mm-2",  period: "Jul 2025", amountIdr: 38_100_000 },
  { id: "mm-3",  period: "Agt 2025", amountIdr: 41_800_000 },
  { id: "mm-4",  period: "Sep 2025", amountIdr: 36_900_000 },
  { id: "mm-5",  period: "Okt 2025", amountIdr: 48_600_000 },
  { id: "mm-6",  period: "Nov 2025", amountIdr: 52_300_000 },
  { id: "mm-7",  period: "Des 2025", amountIdr: 61_200_000 },
  { id: "mm-8",  period: "Jan 2026", amountIdr: 58_400_000 },
  { id: "mm-9",  period: "Feb 2026", amountIdr: 64_800_000 },
  { id: "mm-10", period: "Mar 2026", amountIdr: 71_200_000 },
  { id: "mm-11", period: "Apr 2026", amountIdr: 68_900_000 },
  { id: "mm-12", period: "Mei 2026", amountIdr: 76_400_000 },
];

export const SEED_PAYOUTS: Payout[] = [
  {
    id: "po-1",
    source: "Tokopedia — Campaign #04",
    kind: "sponsor",
    amountIdr: 12_000_000,
    status: "scheduled",
    dueAt: future(3),
  },
  {
    id: "po-2",
    source: "Bibit — Issue #42 sponsor",
    kind: "sponsor",
    amountIdr: 8_000_000,
    status: "in-review",
    dueAt: future(7),
  },
  {
    id: "po-3",
    source: "Notion affiliate (April)",
    kind: "affiliate",
    amountIdr: 4_200_000,
    status: "scheduled",
    dueAt: future(12),
  },
  {
    id: "po-4",
    source: "Creator OS — March sales",
    kind: "product",
    amountIdr: 18_400_000,
    status: "paid",
    dueAt: day(8),
  },
  {
    id: "po-5",
    source: "Riverside affiliate Q1",
    kind: "affiliate",
    amountIdr: 2_800_000,
    status: "paid",
    dueAt: day(14),
  },
  {
    id: "po-6",
    source: "Cohort #03 enrollments",
    kind: "course",
    amountIdr: 12_000_000,
    status: "scheduled",
    dueAt: future(18),
  },
  {
    id: "po-7",
    source: "GoTo — Brand narrative",
    kind: "sponsor",
    amountIdr: 24_000_000,
    status: "in-review",
    dueAt: future(21),
  },
];
