// Tier-3 slice registry — pointers to portable vertical slices shipped at
// `frontend/slices/<slug>/` + `convex/features/<slug>/`.
//
// Source-of-truth single file for: npm tarball manifest, /slices catalog
// page, Bundle Builder UI, and the MCP `rr_list_slices` tool.

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
    agentRecipe: "Run `rr add convex-auth`. Then create convex/auth.ts using the kitab pattern (Resend provider). Set env via `npx convex env set` for self-hosted.",
  },
  {
    slug: "midtrans-payment",
    title: "Midtrans Payment",
    category: "payment",
    version: "0.1.0",
    description: "Midtrans Snap checkout + webhook + transaction history. Provider-isolated under components/providers/midtrans + actions/midtrans so Doku/Stripe land as siblings.",
    source: "rahmanef63/resource-site",
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
  },
  {
    slug: "resend-newsletter",
    title: "Resend Newsletter",
    category: "email",
    version: "0.1.0",
    description: "Subscribe form + admin send-broadcast pipeline via Resend.",
    source: "rahmanef63/resource-site",
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
  },
  {
    slug: "ai-router",
    title: "AI Router (OpenRouter)",
    category: "ai",
    version: "0.1.0",
    description: "Tier-routed LLM access via OpenRouter — nano (Haiku) for classification, mid (Sonnet) for chat, flagship (Opus) for deep reasoning. Per-call usage log.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/ai-router",
    convexPaths: ["convex/features/ai"],
    npm: ["ai@^4.0.0", "@openrouter/ai-sdk-provider@^0.0.5"],
    shadcn: ["button"],
    env: [{ name: "OPENROUTER_API_KEY", scope: "convex", required: true }],
    peers: [],
    tags: ["ai", "llm", "openrouter", "tier-routing"],
  },
  {
    slug: "vector-search",
    title: "Convex Vector Search",
    category: "search",
    version: "0.1.0",
    description: "Embeddings-based search via @convex-dev/vector-search. Embed on insert, query by vector similarity.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/vector-search",
    convexPaths: ["convex/features/search"],
    npm: ["@convex-dev/vector-search@^0.0.5"],
    shadcn: ["card", "input"],
    env: [{ name: "OPENAI_API_KEY", scope: "convex", required: true }],
    peers: [],
    tags: ["search", "vector", "embeddings", "convex"],
  },
  {
    slug: "mdx-blog",
    title: "MDX Blog",
    category: "content",
    version: "0.1.0",
    description: "File-based MDX blog under content/blog/*.mdx. List + detail page + RSS feed. No backend.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/mdx-blog",
    convexPaths: [],
    npm: ["@next/mdx@^16.0.0", "gray-matter@^4.0.3", "rehype-pretty-code@^0.14.0"],
    shadcn: ["card"],
    env: [],
    peers: [],
    tags: ["content", "blog", "mdx", "static"],
  },
  {
    slug: "cal-com-booking",
    title: "Cal.com Booking",
    category: "data",
    version: "0.1.0",
    description: "Embedded Cal.com booking widget + webhook receiver to mirror bookings into Convex.",
    source: "rahmanef63/resource-site",
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
  },
  {
    slug: "broadcast-channel-sync",
    title: "BroadcastChannel Sync",
    category: "realtime",
    version: "0.1.0",
    description: "Cross-tab + cross-iframe state sync via BroadcastChannel + localStorage fallback. Tiny, no backend.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/broadcast-channel-sync",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["realtime", "cross-tab", "broadcast-channel"],
  },
];

export function getSlice(slug: string): SliceEntry | null {
  return slices.find((s) => s.slug === slug) ?? null;
}
