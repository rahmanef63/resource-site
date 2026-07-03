// Grand Tour — Act registry.
//
// The /tour route walks a visitor through the whole catalog as a guided,
// act-by-act story. Each Act is a showcase-coherent CHAPTER, not a raw
// category bucket: Act I "Marketing" must literally show hero/pricing/FAQ
// sections, Act III "Media" must show the image/video editors, etc. A naive
// partition on the slice `category` field is semantically wrong for this —
// landing-sections/testimonials/services are category "content", the media
// editors are category "os", and "ui" holds bare primitives — so a category
// split buries the marketing-section slices in the wrong Act.
//
// So the Act→slice mapping is CURATED (`ACT_SLUGS`): an explicit, showcase
// ordered slug list per Act. Curation is the SSOT for placement AND for the
// order sections render in on each per-Act page.
//
// Auto-derive resilience is preserved via `CATEGORY_FALLBACK`: any FUTURE
// catalog slug not explicitly named in ACT_SLUGS still auto-appears in a
// sensible Act (chosen by its category) the moment it lands in slices.ts — no
// edit here required. Explicit placement always wins; the fallback is only the
// safety net so a new slug can never orphan. The coverage test
// (tests/tour-coverage.test.ts) asserts the partition stays total + disjoint
// against the live catalog, so catalog drift fails CI.
//
// The only other hand-curated datum is the KEY_GATED exception set: slugs whose
// live preview needs a paid / external key (payments, AI proxies, transactional
// email, bookings, MCP) and therefore render as a capability CARD
// (liveMount:false) instead of a mounted preview. Everything else is
// liveMount:true.
//
// Consumed by: app/(docs)/tour/* (index Act rail + per-Act pages).

import { slices, type SliceEntry } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import type { SliceCategory } from "@/lib/shared/features/defineFeature";

/**
 * Key-gated slugs — their live preview depends on a paid or external key
 * (Convex secret, payment provider, AI proxy, SMTP, booking API, MCP host).
 * The tour renders these as a capability card (liveMount:false) rather than a
 * mounted preview. This is the ONE explicit exception list; every other slug
 * derives `liveMount:true`.
 *
 * NOTE: key-gating is NOT derived from the presence of an `env` array — most
 * slices that declare env (ai-chat, ai-admin, testimonials, services,
 * image-picker, convex-auth, rbac-roles, admin, platform-admin,
 * broadcast-channel-sync, …) declare OPTIONAL env and run env-free in the
 * demo, so they liveMount. Only the 9 below genuinely cannot preview env-free.
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

/** Stable URL segments for the six Acts: /tour/<id>. */
export type ActId =
  | "marketing"
  | "os-appshell"
  | "media"
  | "ai"
  | "content"
  | "platform";

/** A single Act — a chapter of the tour. */
export type Act = {
  /** URL segment: /tour/<id>. kebab-case, stable. */
  id: ActId;
  /** Display title for the Act rail + per-Act page header. */
  title: string;
  /** One-sentence hook shown on the Act rail card. */
  blurb: string;
  /** Derived: the visible slugs curated into this Act, with liveMount. */
  sliceSlugs: TourSlice[];
};

/**
 * Curated Act→slug placement — the SSOT for which slices appear in each Act
 * AND for the order they render in on the per-Act page (this array order, not
 * catalog order, drives section order). Showcase-coherent on purpose: e.g.
 * landing-sections/testimonials/services (category "content") live in Act I
 * Marketing; the image/video editors (category "os") live in Act III Media;
 * assistant (category "os") lives in Act IV AI; data-table/library/icon-picker/
 * activity (categories ui/data) live in Act V Content. Counts: I 10, II 19,
 * III 6, IV 8, V 10, VI 15 = 68 (the full visible catalog as of authoring).
 */
export const ACT_SLUGS: Record<ActId, string[]> = {
  marketing: [
    "landing-sections",
    "marketing-chrome",
    "motion-kit",
    "motion-primitives",
    "theme-presets",
    "testimonials",
    "services",
    "seo",
    "site-setup-wizard",
    "contact-form-resend",
  ],
  "os-appshell": [
    "appshell",
    "dashboard-shell",
    "three-column",
    "workspace-shell",
    "command-menu",
    "settings-page",
    "shell-settings",
    "notifications-center",
    "feedback-states",
    "responsive-dialog",
    "selection",
    "file-explorer",
    "code-editor",
    "os-terminal",
    "system-monitor",
    "browser",
    "app-store",
    "quicklinks",
  ],
  media: [
    "image-editor",
    "reel-editor",
    "media-viewer",
    "design-studio",
    "image-picker",
    "file-upload",
  ],
  ai: [
    "ai-chat",
    "ai-studio",
    "ai-agents",
    "ai-admin",
    "assistant",
    "ai-router",
    "vector-search",
    "create-your-mcp",
  ],
  content: [
    "notion",
    "notion-shell",
    "notion-sidebar",
    "notion-database",
    "comments",
    "markdown",
    "library",
    "data-table",
    "pages-cms",
    "icon-picker",
    "activity",
  ],
  platform: [
    "convex-auth",
    "rbac-roles",
    "user-management",
    "admin",
    "admin-panel",
    "platform-admin",
    "audit-log",
    "event-tracking",
    "rate-limit",
    "resend-newsletter",
    "cal-com-booking",
    "doku-payment",
    "midtrans-payment",
    "storefront-checkout",
    "broadcast-channel-sync",
  ],
};

/**
 * Category → Act fallback for any FUTURE catalog slug not explicitly placed in
 * ACT_SLUGS. Explicit placement always wins; this only fires for unlisted
 * slugs so nothing can orphan. All 8 SliceCategory values are mapped.
 *
 * Deliberately diverges from raw category in spots — most "ui" primitives read
 * best in a shell/app context (os-appshell), and data surfaces read as content.
 * The explicit placements above already override category where the showcase
 * story demands it (e.g. content-category landing/testimonials in Act I).
 */
const CATEGORY_FALLBACK: Record<SliceCategory, ActId> = {
  os: "os-appshell",
  ui: "os-appshell",
  ai: "ai",
  content: "content",
  data: "content",
  auth: "platform",
  integrations: "platform",
  infra: "platform",
};

/**
 * Reverse index built once at module load: slug → Act. Explicit placement from
 * ACT_SLUGS; lookups fall back to CATEGORY_FALLBACK for unlisted slugs.
 */
const SLUG_TO_ACT = new Map<string, ActId>();
for (const id of Object.keys(ACT_SLUGS) as ActId[]) {
  for (const slug of ACT_SLUGS[id]) SLUG_TO_ACT.set(slug, id);
}

/** Which Act a slice belongs to — explicit placement wins, category is fallback. */
export function actForSlug(s: SliceEntry): ActId {
  return SLUG_TO_ACT.get(s.slug) ?? CATEGORY_FALLBACK[s.category];
}

/** Act definitions — title/blurb only. `sliceSlugs` is derived below. */
const ACT_DEFS: Omit<Act, "sliceSlugs">[] = [
  {
    id: "marketing",
    title: "Act I — Marketing",
    blurb:
      "The whole landing page in slices: hero/feature/pricing/FAQ sections, testimonials, services, marketing chrome, scroll motion, theme presets, SEO metadata, and the onboarding + contact flow that converts a first-time visitor.",
  },
  {
    id: "os-appshell",
    title: "Act II — OS & App Shell",
    blurb:
      "A full web OS plus the primitives every app is built from: the manifest-driven window manager + mobile surface, dashboard/three-column/workspace shells, command palette, settings, notifications, empty/loading states, dialogs, and the desktop apps (files, code, terminal, monitor, browser, store) that run inside it.",
  },
  {
    id: "media",
    title: "Act III — Media",
    blurb:
      "Create and view rich media in the browser: the layered image editor with 1-click background removal, the video-timeline NLE with realtime WebM export, the standalone canvas studio, the quick-look viewer, and the image picker + upload/storage adapter that feed them.",
  },
  {
    id: "ai",
    title: "Act IV — AI",
    blurb:
      "A model-driven product end to end: chat workbench/sidebar/search, the generation studio, autonomous agents, the agent workspace, the AI admin console, plus the backend router, vector search, and MCP scaffolding that power them.",
  },
  {
    id: "content",
    title: "Act V — Content",
    blurb:
      "Document-grade editorial surfaces: the full Notion block editor plus its shell/sidebar/database, threaded comments, the markdown container with diagrams, the resource library, the TanStack data table, the icon picker, and the public activity log.",
  },
  {
    id: "platform",
    title: "Act VI — Platform, Auth & Commerce",
    blurb:
      "The backbone that ships a product: multi-provider auth, RBAC + user management, the admin/platform-admin control planes, audit + event tracking, rate limiting, transactional email, bookings, payments (DOKU/Midtrans), guest-cart checkout, and cross-tab sync.",
  },
];

/**
 * Build the visible slug list for one Act, in curated showcase order. Explicit
 * members keep their ACT_SLUGS order; any fallback-only slug (unlisted future
 * catalog entry that lands here by category) appends after, in catalog order.
 */
function deriveSlices(actId: ActId): TourSlice[] {
  const order = ACT_SLUGS[actId];
  const rank = (slug: string) => {
    const i = order.indexOf(slug);
    return i === -1 ? order.length : i; // unlisted fallback slugs sort last
  };
  return slices
    .filter((s: SliceEntry) => !isHidden(s.slug) && actForSlug(s) === actId)
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .map((s: SliceEntry) => ({
      slug: s.slug,
      liveMount: !isKeyGated(s.slug),
    }));
}

/**
 * Ordered Acts — the SSOT the /tour route maps over. Derived once at module
 * load by joining each Act definition to its curated catalog slices.
 */
export const acts: Act[] = ACT_DEFS.map((def) => ({
  ...def,
  sliceSlugs: deriveSlices(def.id),
}));

/** Single-Act lookup by URL id (used by the per-Act pages). */
export function getAct(id: string): Act | null {
  return acts.find((a) => a.id === id) ?? null;
}
