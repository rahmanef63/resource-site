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
  },
];

export function getSlice(slug: string): SliceEntry | null {
  return slices.find((s) => s.slug === slug) ?? null;
}
