// Tier-3 slice registry — single source of truth.
//
// Was duplicated by the deprecated lib/content/features.ts (same 8 concepts,
// drifted slugs). Consolidated 2026-05-09: features.ts deleted, slices.ts
// now carries the rich docsUrl/install/exampleCode/usedBy fields too.
//
// Consumed by: npm tarball manifest, /slices catalog page, Bundle Builder UI,
// MCP `rr_list_slices`/`rr_get_slice`, sidebar Slices group.

import type { SliceCategory } from "@/lib/shared/features/defineFeature";

export type SlicePeer = { slug: string; range: string; reason?: string };
export type SliceEnvVar = {
  name: string;
  scope: "convex" | "next-public" | "server";
  required?: boolean;
  description?: string;
};

/**
 * Slice shape — what the slice ships at a glance.
 *
 *   "ui"        — pure frontend; no Convex tables/actions. Pop in & style.
 *                 Lives under frontend/slices/* but `convexPaths` is empty.
 *                 Examples: motion primitives, command palette, layout shell.
 *   "backend"   — pure Convex (schema + queries/actions). No UI shipped.
 *                 Lives under convex/features/*. `slicePath` may be empty.
 *                 Examples: vector-search index helper, ai-router proxy.
 *   "full"      — both frontend + Convex, full vertical feature.
 *                 Examples: doku-payment, midtrans-payment, mdx-blog.
 *
 * Builder UI filters by kind so users picking "just a UI primitive" don't
 * see env-var requirements for backend-coupled slices.
 */
export type SliceKind = "ui" | "backend" | "full";

/** Compat status per (template × slice) or (slice × slice) pairing. */
export type CompatStatus = "native" | "recommended" | "warn" | "incompatible";
export type SliceCompatEntry = { status: CompatStatus; note?: string };

/**
 * Compat declared per slice. Moved here from `lib/build/compat.ts` matrix
 * (Phase 4 of REFACTOR-PLAN.md, 2026-05-12). Single source of truth.
 *
 *   templates  — per-template compatibility. Missing = silent compatible.
 *   conflicts  — slices this one is MUTUALLY EXCLUSIVE with.
 *   enhances   — slices this one pairs well with (informational).
 */
export type SliceCompat = {
  templates?: Record<string, SliceCompatEntry>;
  conflicts?: string[];
  enhances?: string[];
};

export type SliceEntry = {
  slug: string;
  title: string;
  category: SliceCategory;
  /** Default "full" so old entries without `kind` keep working — but every
   *  new entry SHOULD set this explicitly. */
  kind?: SliceKind;
  version: string;
  description: string;
  source: string;
  slicePath: string;
  convexPaths: string[];
  npm?: string[];
  shadcn?: string[];
  env?: SliceEnvVar[];
  peers?: SlicePeer[];
  providers?: string[];
  tags?: string[];
  /** Upstream docs (vendor or platform). */
  docsUrl?: string;
  /** Plain copy-paste install line — kept for the catalog page snippet. */
  install?: string;
  /** Inline example code shown on the slice detail page. */
  exampleCode?: string;
  /** Templates that ship with this slice pre-wired. */
  usedBy?: string[];
  /** Brief recipe for an AI agent installing the slice manually. */
  agentRecipe?: string;
  /** Live preview route, e.g. "/preview/slices/full-width-toggle". When set,
   *  the slice detail page renders a PreviewFrame iframing this URL. */
  previewPath?: string;
  /** Compatibility: per-template status + slice peer/conflict declarations.
   *  Was hand-curated in lib/build/compat.ts pre-Phase-4. */
  compat?: SliceCompat;
};

export const slices: SliceEntry[] = [
  {
    slug: "convex-auth",
    title: "Convex Auth — Email Magic Link",
    category: "auth",
    kind: "backend",
    version: "0.1.0",
    description: "@convex-dev/auth with email magic link via Resend. Self-hosted Convex friendly. Hard mandate per kitab CLAUDE.md (no Clerk).",
    source: "rahmanef63/resource-site",
    docsUrl: "https://labs.convex.dev/auth",
    install: "npm i @convex-dev/auth @auth/core resend",
    slicePath: "frontend/slices/convex-auth",
    convexPaths: ["convex/features/auth"],
    npm: ["@convex-dev/auth@^0.0.84", "@auth/core@^0.37.0", "resend@^4.0.0"],
    shadcn: ["button", "card", "input", "label", "dropdown-menu", "avatar"],
    env: [
      { name: "AUTH_RESEND_KEY", scope: "convex" },
      { name: "JWT_PRIVATE_KEY", scope: "convex" },
      { name: "JWKS", scope: "convex" },
      { name: "SITE_URL", scope: "convex" },
    ],
    peers: [],
    tags: ["auth", "convex", "magic-link", "no-clerk"],
    usedBy: ["personal-brand-os", "wirausaha-os", "konsultan-os"],
    agentRecipe: "Run `rr add convex-auth`. Then create convex/auth.ts using the kitab pattern (Resend provider). Set env via `npx convex env set` for self-hosted.",
    previewPath: "/preview/slices/convex-auth",
    compat: {
      templates: {
        "personal-brand-os": { status: "native" },
        "agency-studio-os": { status: "native" },
        "konsultan-os": { status: "native" },
        "wirausaha-os": { status: "native" },
        "kreator-studio-os": { status: "native" },
        "riset-kit": { status: "native" },
        "saas-marketing-os": { status: "recommended" },
        "cms-public-storefront": { status: "recommended" },
      },
      enhances: ["midtrans-payment", "doku-payment", "resend-newsletter", "ai-router"],
    },
    exampleCode: `// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@convex-dev/auth/providers/Resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Resend({ from: "auth@yourdomain.com" })],
});

// app/proxy.ts (Next 16 — NOT middleware.ts)
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
export default convexAuthNextjsMiddleware();`,
  },
  {
    slug: "doku-payment",
    title: "DOKU — Indonesia Payment",
    category: "payment",
    kind: "full",
    version: "0.1.0",
    description: "Pembayaran lokal Indonesia via DOKU — Checkout (hosted) + Direct (VA / QRIS / e-Wallet / PayLater / Minimarket / Kartu). HMAC-signed REST + signature-verified webhook + idempotent retries. Sibling slice to midtrans-payment dengan paymentOrders schema yang dishare.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sandbox.doku.com/integration",
    install: "",
    slicePath: "frontend/slices/doku-payment",
    convexPaths: ["convex/features/payment"],
    npm: [],
    shadcn: ["card", "button", "dialog", "input", "label", "select", "badge", "skeleton"],
    env: [
      { name: "DOKU_CLIENT_ID", scope: "convex", required: true },
      { name: "DOKU_SECRET_KEY", scope: "convex", required: true },
      { name: "DOKU_IS_PRODUCTION", scope: "convex" },
      { name: "DOKU_NOTIFY_PATH", scope: "convex" },
    ],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Order ownership requires authenticated user." }],
    providers: ["doku"],
    tags: ["payment", "doku", "indonesia", "qris", "virtual-account", "ewallet", "checkout"],
    usedBy: ["personal-brand-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "riset-kit", "agency-studio-os", "cms-public-storefront"],
    agentRecipe: "DOKU dual-mode: Checkout (hosted, all channels) atau Direct (single channel, returns VA/QRIS/deeplink). Webhook di /webhooks/doku verify HMAC-SHA256 (canonical: Client-Id + Request-Id + Request-Timestamp + Request-Target + Digest). Idempotency by request_id index. Server-only — no NEXT_PUBLIC_*. Sandbox default (api-sandbox.doku.com); flip DOKU_IS_PRODUCTION=true for live.",
    previewPath: "/preview/slices/doku-payment",
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Pairs with services/digital-product flow. Mount checkout-page at /checkout." },
        "agency-studio-os": { status: "recommended", note: "Invoice payment via VA — Direct mode fits B2B flow." },
        "saas-marketing-os": { status: "warn", note: "SaaS biasanya butuh recurring billing — DOKU best untuk one-time. Pakai Stripe untuk subscription." },
        "konsultan-os": { status: "recommended", note: "Pembayaran sesi konsultasi — Checkout mode untuk paket bundling." },
        "wirausaha-os": { status: "recommended", note: "Multi-channel commerce — VA + QRIS + e-Wallet untuk customer pilih sendiri." },
        "kreator-studio-os": { status: "recommended", note: "Digital product / coaching purchase — Checkout mode redirect to DOKU page." },
        "riset-kit": { status: "recommended", note: "Paid research bundle — one-time Checkout flow." },
        "cms-public-storefront": { status: "recommended", note: "Cart checkout — Direct mode untuk control UI atau Checkout untuk quick wins." },
      },
      conflicts: ["midtrans-payment", "stripe-payment"],
      enhances: ["convex-auth", "ai-router"],
    },
  },
  {
    slug: "midtrans-payment",
    title: "Midtrans — Indonesia Payment",
    category: "payment",
    kind: "full",
    version: "0.1.0",
    description: "Pembayaran lokal Indonesia via Midtrans Snap (BCA, Mandiri, BRI, e-wallet GoPay/OVO/Dana, QRIS). Webhook untuk konfirmasi. Provider-isolated under components/providers/midtrans + actions/midtrans so Doku/Stripe land as siblings.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://docs.midtrans.com",
    install: "npm i midtrans-client",
    slicePath: "frontend/slices/midtrans-payment",
    convexPaths: ["convex/features/payment"],
    npm: ["midtrans-client@^1.4.2"],
    shadcn: ["card", "button", "dialog", "input", "label"],
    env: [
      { name: "MIDTRANS_SERVER_KEY", scope: "convex", required: true },
      { name: "MIDTRANS_CLIENT_KEY", scope: "next-public", required: true },
      { name: "MIDTRANS_IS_PRODUCTION", scope: "convex" },
    ],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Order ownership requires authenticated user." }],
    providers: ["midtrans"],
    tags: ["payment", "midtrans", "indonesia", "qris", "snap"],
    usedBy: ["wirausaha-os", "konsultan-os", "kreator-studio-os"],
    agentRecipe: "Midtrans Snap untuk pembayaran instant. Webhook ke Convex HTTP action /api/midtrans-callback untuk update order status. Ingat: PPN 11% sudah included di amount, jangan double-count.",
    previewPath: "/preview/slices/midtrans-payment",
    compat: {
      templates: {
        "personal-brand-os": { status: "warn", note: "Personal-brand has no checkout slice; you'll add one manually." },
        "agency-studio-os": { status: "warn", note: "B2B template; payment slice not included." },
        "saas-marketing-os": { status: "warn", note: "SaaS biasanya butuh recurring billing — Midtrans Snap untuk one-time only." },
        "konsultan-os": { status: "recommended", note: "Alternative Indonesian gateway." },
        "wirausaha-os": { status: "recommended", note: "Alternative Indonesian gateway." },
        "kreator-studio-os": { status: "recommended", note: "Alternative Indonesian gateway." },
        "cms-public-storefront": { status: "recommended", note: "Alternative Indonesian gateway." },
      },
      conflicts: ["stripe-payment", "doku-payment"],
      enhances: ["convex-auth"],
    },
  },
  {
    slug: "resend-newsletter",
    title: "Resend — Transactional & Newsletter",
    category: "email",
    kind: "backend",
    version: "0.1.0",
    description: "Transactional email + newsletter blast via Resend. Double opt-in flow + audience segmentation. Magic-link delivery for Convex Auth.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://resend.com/docs",
    install: "npm i resend react-email @react-email/components",
    slicePath: "frontend/slices/resend-newsletter",
    convexPaths: ["convex/features/newsletter"],
    npm: ["resend@^4.0.0"],
    shadcn: ["button", "card", "input", "label", "textarea"],
    env: [
      { name: "RESEND_API_KEY", scope: "convex", required: true },
      { name: "RESEND_FROM", scope: "convex", required: true },
    ],
    peers: [],
    tags: ["email", "newsletter", "resend"],
    usedBy: ["personal-brand-os", "kreator-studio-os", "wirausaha-os"],
    agentRecipe: "Use Resend Audiences API for newsletter — store subscriber emails in Convex too for segmentation. Double opt-in: subscriber.create with status 'pending' → click link → status 'confirmed'.",
    previewPath: "/preview/slices/resend-newsletter",
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Newsletter slice already calls Resend Audiences API." },
        "agency-studio-os": { status: "recommended", note: "Leads → broadcast wired through admin." },
        "saas-marketing-os": { status: "recommended" },
      },
      enhances: ["mdx-blog"],
    },
  },
  {
    slug: "ai-router",
    title: "AI Router (OpenRouter)",
    category: "ai",
    kind: "backend",
    version: "0.1.0",
    description: "Tier-routed LLM access via OpenRouter — nano (Haiku) for classification, mid (Sonnet) for chat, flagship (Opus) for deep reasoning. Per-call usage log.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sdk.vercel.ai/docs",
    install: "npm i ai @openrouter/ai-sdk-provider",
    slicePath: "frontend/slices/ai-router",
    convexPaths: ["convex/features/ai"],
    npm: ["ai@^4.0.0", "@openrouter/ai-sdk-provider@^0.0.5"],
    shadcn: ["button"],
    env: [{ name: "OPENROUTER_API_KEY", scope: "convex", required: true }],
    peers: [],
    tags: ["ai", "llm", "openrouter", "tier-routing"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Wrap every AI call through ai-router action. Pick tier based on workload: nano for spam-flag/headline-suggest, mid for chat/draft, flagship for methodology-review. Log token usage to ai_usage table for cost dashboard.",
    previewPath: "/preview/slices/ai-router",
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Chatbot + post-draft assistant compose on top." },
        "kreator-studio-os": { status: "recommended", note: "AI chatbot bisa generate payment link via DOKU MCP — set DOKU MCP di .claude/mcp.json." },
        "saas-marketing-os": { status: "warn", note: "Marketing site has no AI surface by default." },
      },
      enhances: ["doku-payment"],
    },
  },
  {
    slug: "vector-search",
    title: "Convex Vector Search",
    category: "search",
    kind: "full",
    version: "0.1.0",
    description: "Embeddings-based search via Convex's built-in vector index. Embed via OpenAI text-embedding-3-small (1536-dim), query via vectorIndex().",
    source: "rahmanef63/resource-site",
    docsUrl: "https://docs.convex.dev/database/vector-search",
    install: "npm i openai",
    slicePath: "frontend/slices/vector-search",
    convexPaths: ["convex/features/search"],
    npm: ["@convex-dev/vector-search@^0.0.5"],
    shadcn: ["card", "input"],
    env: [{ name: "OPENAI_API_KEY", scope: "convex", required: true }],
    peers: [],
    tags: ["search", "vector", "embeddings", "convex", "rag"],
    usedBy: ["personal-brand-os", "riset-kit"],
    agentRecipe: "Add embedding field + vectorIndex per searchable table. Re-embed on upsert via Convex action. Cache embeddings — don't re-call OpenAI on every read.",
    previewPath: "/preview/slices/vector-search",
    compat: {
      templates: {
        "riset-kit": { status: "native", note: "Research kit pakai embedding search untuk konten." },
      },
    },
  },
  {
    slug: "mdx-blog",
    title: "MDX Blog",
    category: "content",
    kind: "ui",
    version: "0.1.0",
    description: "Markdown-with-JSX untuk blog post. File-based under content/blog/*.mdx. Auto-generate ToC, reading-time, syntax highlight, plus embed React components inline.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://github.com/hashicorp/next-mdx-remote",
    install: "npm i next-mdx-remote rehype-pretty-code remark-gfm reading-time",
    slicePath: "frontend/slices/mdx-blog",
    convexPaths: [],
    npm: ["@next/mdx@^16.0.0", "gray-matter@^4.0.3", "rehype-pretty-code@^0.14.0"],
    shadcn: ["card"],
    env: [],
    peers: [],
    tags: ["content", "blog", "mdx", "static"],
    usedBy: ["personal-brand-os", "konsultan-os", "saas-marketing-os"],
    agentRecipe: "Store post body sebagai markdown di content/blog/*.mdx. Render dengan MDXRemote di [slug]/page.tsx. Auto-extract headings ke ToC via remark plugin custom.",
    previewPath: "/preview/slices/mdx-blog",
    compat: {
      templates: {
        "saas-marketing-os": { status: "native", note: "Blog + changelog slices both render MDX." },
        "personal-brand-os": { status: "recommended", note: "Blog slice expects MDX bodies in Convex posts table." },
        "konsultan-os": { status: "recommended", note: "Konten ahli sebagai SEO funnel." },
        "agency-studio-os": { status: "warn", note: "Agency template ships no blog slice — bring your own route." },
      },
    },
  },
  {
    slug: "cal-com-booking",
    title: "Cal.com Booking",
    category: "data",
    kind: "full",
    version: "0.1.0",
    description: "Embedded Cal.com booking widget + webhook receiver to mirror bookings into Convex.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://cal.com/docs/integrations/web-app/embed",
    install: "npm i @calcom/embed-react",
    slicePath: "frontend/slices/cal-com-booking",
    convexPaths: ["convex/features/bookings"],
    npm: ["@calcom/embed-react@^1.5.0"],
    shadcn: ["card"],
    env: [
      { name: "NEXT_PUBLIC_CALCOM_USERNAME", scope: "next-public", required: true },
      { name: "CALCOM_WEBHOOK_SECRET", scope: "convex", required: true },
    ],
    peers: [],
    tags: ["data", "scheduling", "cal-com", "bookings"],
    usedBy: ["personal-brand-os", "konsultan-os"],
    agentRecipe: "Embed Cal.com via @calcom/embed-react di halaman services. Configure webhook di Cal.com dashboard → POST ke /api/cal-webhook → upsert booking di Convex.",
    previewPath: "/preview/slices/cal-com-booking",
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Services slice has a booking placeholder slot." },
        "agency-studio-os": { status: "recommended", note: "Project intake form pairs with Cal.com." },
        "saas-marketing-os": { status: "recommended", note: "Demo-request form can swap to Cal.com." },
        "konsultan-os": { status: "recommended", note: "Konsultasi booking wajib — Cal.com embed di services page." },
      },
    },
  },
  {
    slug: "full-width-toggle",
    title: "Full Width Toggle",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "Page-container width toggle (contained / wide / full). Per-device localStorage + cross-tab sync. Ships useFullWidth hook + FullWidthToggle button (icon/button/segment variants) + WidthContainer wrapper. Zero backend, zero env.",
    source: "rahmanef63/resource-site",
    docsUrl: "",
    install: "",
    slicePath: "frontend/slices/full-width-toggle",
    convexPaths: [],
    npm: [],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["ui", "layout", "preference", "localstorage", "dashboard"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "saas-marketing-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Drop <WidthContainer> around page content, <FullWidthToggle variant='icon' /> in topbar. Variant 'segment' best for settings page. Hook useFullWidth() returns [mode, setMode, cycle]. SSR-safe — defaults to 'contained' until hydrate.",
    previewPath: "/preview/slices/full-width-toggle",
  },
  {
    slug: "command-menu",
    title: "Command Menu (⌘K)",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "Global ⌘K command palette. Auto-builds entries from your feature registry (defineFeature) + custom actions. Fuzzy search via cmdk. Mount once at app shell; listens globally. Facade slice — pulls from template-base/frontend/slices/command-menu which re-exports shared/foundation/utils/system/command-menu.",
    source: "superspace + kitab-core",
    docsUrl: "https://cmdk.paco.me",
    install: "npm i cmdk",
    slicePath: "template-base/frontend/slices/command-menu",
    convexPaths: [],
    npm: ["cmdk@^1.0.0"],
    shadcn: ["command", "dialog"],
    env: [],
    peers: [],
    tags: ["ui", "palette", "cmd-k", "navigation", "keyboard"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "saas-marketing-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Mount <CommandMenu actions={...} /> once at the dashboard shell level. Listens for Cmd+K globally. Actions auto-build from feature registry + workspace + theme/sign-out. Add custom commands via actions prop or by registering in command-registry.ts.",
    previewPath: "/preview/slices/command-menu",
  },
  {
    slug: "motion-primitives",
    title: "Motion Primitives (8)",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "Eight ready-to-style motion components: marquee, kinetic-heading, magnetic, cursor-spotlight, stat-counter, reading-progress, grain, lightbox. Framer-Motion-powered, tree-shakeable. Facade slice — pulls from template-base/frontend/slices/motion-primitives.",
    source: "rahmanef.com",
    docsUrl: "",
    install: "npm i framer-motion",
    slicePath: "template-base/frontend/slices/motion-primitives",
    convexPaths: [],
    npm: ["framer-motion@^11.0.0"],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["ui", "motion", "animation", "marquee", "framer-motion"],
    usedBy: ["personal-brand-os", "agency-studio-os", "kreator-studio-os", "saas-marketing-os"],
    agentRecipe: "Each primitive is independently importable from @/features/motion-primitives. Use marquee for logo strips, kinetic-heading for hero text, magnetic for CTA buttons, cursor-spotlight for hover-reveal panels, stat-counter for animated numbers, reading-progress for blog top bar, grain for film texture, lightbox for image gallery.",
    previewPath: "/preview/slices/motion-primitives",
  },
  {
    slug: "responsive-dialog",
    title: "Responsive Dialog (Sheet ↔ Modal)",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "ResponsiveDialog — auto-switches between bottom Sheet (mobile) and centered Dialog (desktop) at the md breakpoint. Same API as shadcn Dialog. Kitab forbids raw <dialog>; use this everywhere. Facade slice — pulls from template-base/frontend/slices/responsive-dialog.",
    source: "superspace",
    docsUrl: "",
    install: "",
    slicePath: "template-base/frontend/slices/responsive-dialog",
    convexPaths: [],
    npm: [],
    shadcn: ["dialog", "sheet"],
    env: [],
    peers: [],
    tags: ["ui", "dialog", "modal", "sheet", "responsive", "primitive"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "saas-marketing-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Drop-in for shadcn Dialog. Use <ResponsiveDialog><ResponsiveDialogTrigger>…</ResponsiveDialogTrigger><ResponsiveDialogContent>…</ResponsiveDialogContent></ResponsiveDialog>. On mobile renders as Sheet sliding from bottom; on desktop as centered Dialog. Threshold via useMediaQuery('(min-width: 768px)').",
    previewPath: "/preview/slices/responsive-dialog",
  },
  {
    slug: "dashboard-shell",
    title: "Dashboard Shell — Responsive",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "ResponsiveDashboardShell — desktop sidebar + topbar, mobile dock + sheet sidebar, breakpoint-aware. Ports superspace's layout/dashboard/{Desktop,Mobile,Responsive}DashboardShell + sidebar primary/secondary slots. Facade slice — pulls from template-base/frontend/slices/dashboard-shell.",
    source: "superspace",
    docsUrl: "",
    install: "",
    slicePath: "template-base/frontend/slices/dashboard-shell",
    convexPaths: [],
    npm: [],
    shadcn: ["sheet", "scroll-area", "separator", "tooltip"],
    env: [],
    peers: [{ slug: "full-width-toggle", range: "^0.1", reason: "Topbar surfaces the width toggle when this is mounted." }],
    tags: ["ui", "layout", "dashboard", "sidebar", "topbar", "responsive"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Wraps app/(admin) routes. <ResponsiveDashboardShell sidebar={<AppSidebar />} topbar={<TopBar />}>{children}</ResponsiveDashboardShell>. Mobile: sidebar collapses to <Sheet>. Desktop: persistent sidebar + topbar. Embed FullWidthToggle in topbar for instant container resize.",
    previewPath: "/preview/slices/dashboard-shell",
  },
  {
    slug: "broadcast-channel-sync",
    title: "BroadcastChannel — Cross-tab Sync",
    category: "realtime",
    kind: "ui",
    version: "0.1.0",
    description: "Same-origin cross-tab + cross-iframe state sync via BroadcastChannel API. Tiny, no backend, no install.",
    source: "Web Platform — BroadcastChannel API",
    docsUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API",
    install: "// no install — Web Platform API",
    slicePath: "frontend/slices/broadcast-channel-sync",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["realtime", "cross-tab", "broadcast-channel", "demo-pattern"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Use BroadcastChannel only for demo / cross-iframe state mirroring. Production data still goes through Convex realtime. Use the useBroadcastSync(channelName, initial) hook from @/features/broadcast-channel-sync.",
    previewPath: "/preview/slices/broadcast-channel-sync",
    compat: {
      templates: {
        "personal-brand-os": { status: "native", note: "Public ↔ Admin live sync wired in StoreProvider." },
        "agency-studio-os": { status: "warn", note: "Demo-only; not used by agency template by default." },
      },
    },
  },
  // ------------------------------------------------------------------
  // Promoted from recipes.ts (Phase 3 of docs/REFACTOR-PLAN.md, 2026-05-12).
  // All paths point to existing template-base content. Foundation slices —
  // depend on template-base/{shared,convex/lib} internals, slicePath rooted
  // at template-base/.
  // ------------------------------------------------------------------
  {
    slug: "rbac-roles",
    title: "RBAC — Tiered System Roles",
    category: "auth",
    kind: "backend",
    version: "0.1.0",
    description: "Workspace-scoped RBAC with 6 system roles (owner/admin/manager/staff/client/guest) and three tier presets — solo, influencer, organization. Env-based platform admin bypass via PLATFORM_ADMIN_EMAILS. checkPermission / requirePermission helpers, role seeding mutation, @convex-dev/auth aware (no Clerk).",
    source: "superspace",
    slicePath: "",
    convexPaths: ["template-base/convex/lib/rbac"],
    npm: [],
    shadcn: [],
    env: [{ name: "PLATFORM_ADMIN_EMAILS", scope: "convex", description: "Comma-separated emails granted cross-workspace admin." }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "RBAC checks the authed user identity." }],
    tags: ["rbac", "auth", "permissions", "roles", "workspaces"],
    usedBy: ["personal-brand-os", "konsultan-os", "wirausaha-os"],
    agentRecipe: "Three tier presets pick which system roles to seed: solo (owner+admin), influencer (+manager), organization (6 roles). Platform admin via env PLATFORM_ADMIN_EMAILS bypasses all checks. Resolution: platform admin → workspace owner → membership.additionalPermissions → role.permissions.",
  },
  {
    slug: "admin-panel",
    title: "Admin Panel — Unified Product Admin",
    category: "infra",
    kind: "full",
    version: "0.1.0",
    description: "17-section admin surface (events, funnels, attribution, users, A/B, flags, pricing, CMS, email, audit, ...) gated by RBAC. Auto-filters sidebar by tier (solo/influencer/organization) and user permissions. Single backend resolver (getMyAdminAccess) mirrors frontend gate so UI can never leak.",
    source: "superspace + spec",
    slicePath: "template-base/frontend/slices/admin-panel",
    convexPaths: ["template-base/convex/features/admin-panel"],
    npm: [],
    shadcn: ["card", "badge", "button"],
    env: [],
    peers: [{ slug: "rbac-roles", range: "^0.1", reason: "Admin sections require RBAC perms — must seed roles first." }],
    tags: ["admin", "owner", "platform", "rbac", "instrumentation", "panel"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Wrap pages with <AdminPage workspaceId tier>. AccessGate hides UI for non-admins, AdminShell renders 2-col layout with sidebar filtered by tier+perms. ADMIN_SECTIONS in config.ts is SSOT (17 entries). Personal-brand-os = tier 'solo' = owner sees everything.",
  },
  {
    slug: "event-tracking",
    title: "Event Tracking — P0 Instrumentation",
    category: "data",
    kind: "full",
    version: "0.1.0",
    description: "Client SDK + Convex ingestion endpoint for structured product events. Auto-captures page_view/signup/login + UTM/referrer/first-touch attribution. Batched flush via requestIdleCallback. Targets <100ms p99 ingestion.",
    source: "spec + superspace analytics",
    slicePath: "template-base/frontend/slices/admin-panel/slices/events",
    convexPaths: ["template-base/convex/features/admin-panel", "template-base/convex/features/analytics"],
    npm: [],
    shadcn: [],
    env: [],
    peers: [{ slug: "admin-panel", range: "^0.1", reason: "Lives under admin slice events subfolder." }],
    tags: ["events", "analytics", "instrumentation", "attribution", "utm", "p0"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Writes to analyticsEvents table (no new schema). Anonymous page_view allowed pre-signup; other events require workspaceId. Session id per tab (sessionStorage), first-touch UTM in localStorage. Flush every ~500ms via requestIdleCallback. Cap retry queue at 500.",
  },
  {
    slug: "theme-preset-switcher",
    title: "Theme Preset Switcher",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "Runtime theme swap (colors + fonts + shadows + tracking). OKLch CSS vars per preset. Persists to localStorage + Convex. Add a new preset by appending a CSS block in app/globals.css with [data-theme=\"<name>\"], then register in preset-groups.ts.",
    source: "rahmanef.com",
    slicePath: "template-base/frontend/shared/theme",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["theme", "presets", "oklch", "design-system"],
    usedBy: ["personal-brand-os", "konsultan-os", "wirausaha-os"],
    agentRecipe: "Import ThemePresetSwitcher from @/frontend/shared/ui/components/theme-preset-switcher and mount in the topbar. Presets live in theme-presets.ts; preset-groups.ts groups them for the picker UI.",
  },
  {
    slug: "icon-picker",
    title: "Notion-Style Icon Picker",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "Emoji + lucide icon picker with search, 10-color Notion palette, Twemoji/native toggle. One string stores emoji OR lucide:Name OR with ?c=hex tint — backwards-compat with raw-emoji fields. Single icon field stores emoji or 'lucide:Name' plus optional '?c=hex'.",
    source: "notion-page-clone",
    slicePath: "template-base/frontend/slices/notion/slices/icon-picker",
    convexPaths: [],
    npm: [],
    shadcn: ["popover", "button", "input"],
    env: [],
    peers: [],
    tags: ["icon", "emoji", "lucide", "picker", "twemoji", "notion"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "parseIconValue() decodes; lucideValue()/withColor() build. Add 'icon: v.string()' to Convex table — no migration needed for existing emoji fields. Popover variant for inline UI, Inline for sheets/dialogs.",
  },
  {
    slug: "contact-form-resend",
    title: "Contact Form + Resend",
    category: "email",
    kind: "full",
    version: "0.1.0",
    description: "Contact form posting to Resend email API. Server Action + Zod input validation. Convex mutation for storage + Resend send.",
    source: "cescadesigns",
    slicePath: "template-base/frontend/slices/contact-form-resend",
    convexPaths: [],
    npm: ["resend@^4.0.0", "framer-motion@^11.0.0"],
    shadcn: ["card", "button", "input", "label", "textarea"],
    env: [{ name: "RESEND_API_KEY", scope: "convex", required: true }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Optional — anonymous submission works without auth." }],
    tags: ["form", "email", "resend", "convex"],
    usedBy: [],
    agentRecipe: "Wire contactMessages.send mutation in convex/. Server emails via Resend from form@yourdomain.com. Always validate inputs with Zod or v.* server-side. Anonymous allowed.",
  },
];

export function getSlice(slug: string): SliceEntry | null {
  return slices.find((s) => s.slug === slug) ?? null;
}
