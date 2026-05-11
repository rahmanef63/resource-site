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

export type SliceEntry = {
  slug: string;
  title: string;
  category: SliceCategory;
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
};

export const slices: SliceEntry[] = [
  {
    slug: "convex-auth",
    title: "Convex Auth — Email Magic Link",
    category: "auth",
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
  },
  {
    slug: "midtrans-payment",
    title: "Midtrans — Indonesia Payment",
    category: "payment",
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
  },
  {
    slug: "resend-newsletter",
    title: "Resend — Transactional & Newsletter",
    category: "email",
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
  },
  {
    slug: "ai-router",
    title: "AI Router (OpenRouter)",
    category: "ai",
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
  },
  {
    slug: "vector-search",
    title: "Convex Vector Search",
    category: "search",
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
  },
  {
    slug: "mdx-blog",
    title: "MDX Blog",
    category: "content",
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
  },
  {
    slug: "cal-com-booking",
    title: "Cal.com Booking",
    category: "data",
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
  },
  {
    slug: "broadcast-channel-sync",
    title: "BroadcastChannel — Cross-tab Sync",
    category: "realtime",
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
  },
];

export function getSlice(slug: string): SliceEntry | null {
  return slices.find((s) => s.slug === slug) ?? null;
}
