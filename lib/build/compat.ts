// Template × Slice compatibility matrix.
//
// Hand-curated. Not every pair is exhaustive — only entries that diverge
// from the default "compatible" baseline appear here.
//
//   native       — slice is part of template's default stack (already wired)
//   recommended  — slice pairs especially well; encourage selection
//   warn         — works, but needs manual wiring / extra config
//   incompatible — pair conflicts (e.g. clashing auth strategies)
//
// Used by build-shell to surface warnings in CommandOutput + dim conflicting
// checkboxes in SlicePicker.
//
// (Was template × feature pre-2026-05-09; consolidated when features.ts was
// removed in favor of slices.ts as single source of truth.)

import { slices as sliceCatalog } from "@/lib/content/slices";
import { layouts } from "@/lib/content/layouts";

export type CompatStatus = "native" | "recommended" | "warn" | "incompatible";

export type CompatEntry = {
  status: CompatStatus;
  note?: string;
};

type Matrix = Record<string, Record<string, CompatEntry>>;

/** template-slug → slice-slug → entry. Missing = "compatible" (silent OK). */
const MATRIX: Matrix = {
  "personal-brand-os": {
    "convex-auth": { status: "native", note: "Admin shell already gated by @convex-dev/auth." },
    "broadcast-channel-sync": { status: "native", note: "Public ↔ Admin live sync wired in StoreProvider." },
    "mdx-blog": { status: "recommended", note: "Blog slice expects MDX bodies in Convex posts table." },
    "ai-router": { status: "recommended", note: "Chatbot + post-draft assistant compose on top." },
    "resend-newsletter": { status: "recommended", note: "Newsletter slice already calls Resend Audiences API." },
    "cal-com-booking": { status: "recommended", note: "Services slice has a booking placeholder slot." },
    "midtrans-payment": { status: "warn", note: "Personal-brand has no checkout slice; you'll add one manually." },
    "doku-payment": { status: "recommended", note: "Pairs with services/digital-product flow. Mount checkout-page at /checkout." },
  },
  "agency-studio-os": {
    "convex-auth": { status: "native" },
    "resend-newsletter": { status: "recommended", note: "Leads → broadcast wired through admin." },
    "cal-com-booking": { status: "recommended", note: "Project intake form pairs with Cal.com." },
    "mdx-blog": { status: "warn", note: "Agency template ships no blog slice — bring your own route." },
    "midtrans-payment": { status: "warn", note: "B2B template; payment slice not included." },
    "doku-payment": { status: "recommended", note: "Invoice payment via VA — Direct mode fits B2B flow." },
    "broadcast-channel-sync": { status: "warn", note: "Demo-only; not used by agency template by default." },
  },
  "saas-marketing-os": {
    "convex-auth": { status: "recommended" },
    "resend-newsletter": { status: "recommended" },
    "mdx-blog": { status: "native", note: "Blog + changelog slices both render MDX." },
    "ai-router": { status: "warn", note: "Marketing site has no AI surface by default." },
    "cal-com-booking": { status: "recommended", note: "Demo-request form can swap to Cal.com." },
    "doku-payment": { status: "warn", note: "SaaS biasanya butuh recurring billing — DOKU best untuk one-time. Pakai Stripe untuk subscription." },
    "midtrans-payment": { status: "warn", note: "SaaS biasanya butuh recurring billing — Midtrans Snap untuk one-time only." },
  },
  "konsultan-os": {
    "convex-auth": { status: "native" },
    "cal-com-booking": { status: "recommended", note: "Konsultasi booking wajib — Cal.com embed di services page." },
    "mdx-blog": { status: "recommended", note: "Konten ahli sebagai SEO funnel." },
    "doku-payment": { status: "recommended", note: "Pembayaran sesi konsultasi — Checkout mode untuk paket bundling." },
    "midtrans-payment": { status: "recommended", note: "Alternative Indonesian gateway." },
  },
  "wirausaha-os": {
    "convex-auth": { status: "native" },
    "doku-payment": { status: "recommended", note: "Multi-channel commerce — VA + QRIS + e-Wallet untuk customer pilih sendiri." },
    "midtrans-payment": { status: "recommended", note: "Alternative Indonesian gateway." },
  },
  "kreator-studio-os": {
    "convex-auth": { status: "native" },
    "doku-payment": { status: "recommended", note: "Digital product / coaching purchase — Checkout mode redirect to DOKU page." },
    "midtrans-payment": { status: "recommended", note: "Alternative Indonesian gateway." },
    "ai-router": { status: "recommended", note: "AI chatbot bisa generate payment link via DOKU MCP — set DOKU MCP di .claude/mcp.json." },
  },
  "riset-kit": {
    "convex-auth": { status: "native" },
    "doku-payment": { status: "recommended", note: "Paid research bundle — one-time Checkout flow." },
    "vector-search": { status: "native", note: "Research kit pakai embedding search untuk konten." },
  },
  "cms-public-storefront": {
    "convex-auth": { status: "recommended" },
    "doku-payment": { status: "recommended", note: "Cart checkout — Direct mode untuk control UI atau Checkout untuk quick wins." },
    "midtrans-payment": { status: "recommended", note: "Alternative Indonesian gateway." },
  },
};

export function getCompat(templateSlug: string | null, sliceSlug: string): CompatEntry | null {
  if (!templateSlug) return null;
  return MATRIX[templateSlug]?.[sliceSlug] ?? null;
}

export type CompatWarning = {
  /** Slice slug. (Field name kept as `featureSlug` for back-compat with consumers.) */
  featureSlug: string;
  /** Slice title. (Field name kept for back-compat.) */
  featureTitle: string;
  templateSlug: string;
  templateTitle: string;
  status: CompatStatus;
  note?: string;
};

// ─── Slice × Slice compat (peers + conflicts) ─────────────────────────────
//
// Peers come from each slice's `slice.json.deps.peers` (mirrored in
// lib/content/slices.ts). Conflicts are declared here for slices that are
// mutually exclusive (e.g., two payment providers competing for the same
// `paymentOrders.provider` discriminator behavior).

export type SliceCompat = {
  /** Other slice slugs this one CONFLICTS with (mutually exclusive). */
  conflicts?: string[];
  /** Other slice slugs that pair especially well (informational). */
  enhances?: string[];
};

export const SLICE_COMPAT: Record<string, SliceCompat> = {
  "midtrans-payment": {
    conflicts: ["stripe-payment", "doku-payment"],
    enhances: ["convex-auth"],
  },
  "doku-payment": {
    conflicts: ["midtrans-payment", "stripe-payment"],
    enhances: ["convex-auth", "ai-router"],
  },
  "convex-auth": {
    enhances: ["midtrans-payment", "doku-payment", "resend-newsletter", "ai-router"],
  },
  "resend-newsletter": {
    enhances: ["mdx-blog"],
  },
  "ai-router": {
    enhances: ["doku-payment"],
  },
};

/** Collect actionable warnings for current selection — incompatible + warn only. */
export function collectWarnings(templateSlug: string | null, selectedSlices: string[]): CompatWarning[] {
  if (!templateSlug) return [];
  const tpl = layouts.find((l) => l.slug === templateSlug);
  if (!tpl) return [];

  const out: CompatWarning[] = [];
  for (const slug of selectedSlices) {
    const c = getCompat(templateSlug, slug);
    if (!c || (c.status !== "warn" && c.status !== "incompatible")) continue;
    const s = sliceCatalog.find((x) => x.slug === slug);
    if (!s) continue;
    out.push({
      featureSlug: slug,
      featureTitle: s.title,
      templateSlug,
      templateTitle: tpl.title,
      status: c.status,
      note: c.note,
    });
  }
  return out;
}
