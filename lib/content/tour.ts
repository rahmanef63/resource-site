// Grand Tour — Act registry (PHASE 0 scaffold).
//
// The /tour route walks a visitor through the whole catalog as a guided,
// act-by-act story. Acts are NOT hand-authored slug lists — they are DERIVED
// programmatically from the slice catalog (lib/content/slices.ts) by grouping
// every entry on its `category` field (the actual grouping field every entry
// sets; the `domain` field exists in the type but is populated on 0 entries).
//
// Because Acts derive from the catalog, a NEW slice auto-appears in its Act the
// moment it lands in slices.ts — no edit here required. The only hand-curated
// data is (1) the Act definitions (title/blurb/which categories each owns) and
// (2) the KEY_GATED exception set: slugs whose live preview needs a paid /
// external key (payments, AI proxies, transactional email, bookings, MCP) and
// therefore render as a capability CARD (liveMount:false) instead of a live
// mounted preview. Everything else is liveMount:true.
//
// Consumed by: app/(docs)/tour/* (index Act rail in P0; per-Act pages P1–P3).

import { slices, type SliceEntry } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import type { SliceCategory } from "@/lib/shared/features/defineFeature";

/**
 * Key-gated slugs — their live preview depends on a paid or external key
 * (Convex secret, payment provider, AI proxy, SMTP, booking API, MCP host).
 * The tour renders these as a capability card (liveMount:false) rather than a
 * mounted preview. This is the ONE explicit exception list; every other slug
 * derives `liveMount:true`. Keep in sync with the slices that declare server /
 * convex-scoped `env` vars whose preview cannot run env-free in the showcase.
 */
export const KEY_GATED_SLUGS: readonly string[] = [
  "vector-search",
  "seo",
  "ai-router",
  "doku-payment",
  "midtrans-payment",
  "resend-newsletter",
  "cal-com-booking",
  "contact-form-resend",
  "create-your-mcp",
] as const;

export function isKeyGated(slug: string): boolean {
  return KEY_GATED_SLUGS.includes(slug);
}

/** One slice as it appears inside an Act — slug + whether it mounts live. */
export type TourSlice = {
  slug: string;
  /** false ⇒ render a capability card (key-gated); true ⇒ live preview. */
  liveMount: boolean;
};

/** A single Act — a chapter of the tour owning one or more slice categories. */
export type Act = {
  /** URL segment: /tour/<id>. kebab-case, stable. */
  id: string;
  /** Display title for the Act rail + per-Act page header. */
  title: string;
  /** One-sentence hook shown on the Act rail card. */
  blurb: string;
  /** Slice categories this Act owns. Every catalog category maps to exactly
   *  one Act so the partition is total + non-overlapping. */
  domains: SliceCategory[];
  /** Derived: every visible slug in this Act's categories, with liveMount. */
  sliceSlugs: TourSlice[];
};

/**
 * Act definitions — title/blurb/owned categories only. `sliceSlugs` is filled
 * in below by mapping over the catalog, so this stays declarative.
 *
 * The 8 catalog categories (auth, integrations, ai, data, content, ui, os,
 * infra) are partitioned across 6 Acts. Each category appears in exactly one
 * Act's `domains`, guaranteeing every slice lands in one and only one Act.
 */
const ACT_DEFS: Omit<Act, "sliceSlugs">[] = [
  {
    id: "marketing",
    title: "Act I — Marketing",
    blurb:
      "Landing chrome, motion primitives, theme presets, and the UI building blocks that make a marketing site feel alive.",
    domains: ["ui"],
  },
  {
    id: "os-appshell",
    title: "Act II — OS & App Shell",
    blurb:
      "A full web OS: window manager, app shell, terminal, file explorer, and the desktop apps that run inside it.",
    domains: ["os"],
  },
  {
    id: "media",
    title: "Act III — Media",
    blurb:
      "Files, libraries, and data surfaces — the storage and table primitives media-heavy apps are built on.",
    domains: ["data"],
  },
  {
    id: "ai",
    title: "Act IV — AI",
    blurb:
      "Chat, studio, agents, and the admin surfaces that put a model-driven workflow in front of real users.",
    domains: ["ai"],
  },
  {
    id: "content",
    title: "Act V — Content",
    blurb:
      "Editorial building blocks: testimonials, services, comments, markdown, the Notion editor, and storefront sections.",
    domains: ["content"],
  },
  {
    id: "platform",
    title: "Act VI — Platform, Auth & Commerce",
    blurb:
      "The backbone: authentication, RBAC, admin panels, payments, and the integrations that wire a product to the world.",
    domains: ["auth", "integrations", "infra"],
  },
];

/** Build the visible, category-grouped slug list for one Act, in catalog order. */
function deriveSlices(domains: SliceCategory[]): TourSlice[] {
  const owned = new Set<SliceCategory>(domains);
  return slices
    .filter((s: SliceEntry) => owned.has(s.category) && !isHidden(s.slug))
    .map((s: SliceEntry) => ({
      slug: s.slug,
      liveMount: !isKeyGated(s.slug),
    }));
}

/**
 * Ordered Acts — the SSOT the /tour route maps over. Derived once at module
 * load by joining each Act definition to its catalog slices.
 */
export const acts: Act[] = ACT_DEFS.map((def) => ({
  ...def,
  sliceSlugs: deriveSlices(def.domains),
}));

/** Single-Act lookup by URL id (used by the per-Act pages in P1–P3). */
export function getAct(id: string): Act | null {
  return acts.find((a) => a.id === id) ?? null;
}
