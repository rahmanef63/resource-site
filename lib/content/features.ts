// Features = backend / integration capabilities that templates compose.
// Recipes are UI patterns; features are backend services & SDKs.

export type FeatureCategory =
  | "ai"
  | "auth"
  | "data"
  | "payment"
  | "email"
  | "realtime"
  | "storage"
  | "search"
  | "content";

export type FeatureEntry = {
  slug: string;
  title: string;
  category: FeatureCategory;
  description: string;
  source: string; // npm package or "custom"
  /** Where to find canonical docs/examples. */
  docsUrl?: string;
  /** Convex / API surface this feature depends on. */
  dependencies: string[];
  /** Plain copy-paste install. */
  install: string;
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
  /** Which templates currently use it. */
  usedBy?: string[];
};

export const features: FeatureEntry[] = [
  {
    slug: "ai-sdk-openrouter",
    title: "AI SDK — OpenRouter Router",
    category: "ai",
    description:
      "Tier-routed LLM calls via OpenRouter. Nano (Haiku/4o-mini) for classification, mid (Sonnet/4o) for drafting, flagship (Opus) for deep reasoning. Cost log + retry baked in.",
    source: "@openrouter/ai-sdk-provider + ai",
    docsUrl: "https://sdk.vercel.ai/docs",
    dependencies: ["convex", "OpenRouter API key"],
    install: `npm i ai @openrouter/ai-sdk-provider`,
    exampleCode: `// convex/shared/ai/router.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const router = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

const TIER_TO_MODEL = {
  nano: "anthropic/claude-haiku-4-5",
  mid: "anthropic/claude-sonnet-4-6",
  flagship: "anthropic/claude-opus-4-7",
};

export const callModel = action({
  args: {
    feature: v.string(),
    prompt: v.string(),
    tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
  },
  handler: async (ctx, { feature, prompt, tier }) => {
    const { text, usage } = await generateText({
      model: router(TIER_TO_MODEL[tier]),
      prompt,
    });
    await ctx.runMutation(internal.ai.logUsage, { feature, tier, usage });
    return text;
  },
});`,
    agentRecipe:
      "Wrap every AI call through ai-router action. Pick tier based on workload: nano for spam-flag/headline-suggest, mid for chat/draft, flagship for methodology-review. Log token usage to ai_usage table for cost dashboard.",
    tags: ["ai", "llm", "openrouter", "vercel-ai-sdk"],
    usedBy: ["personal-brand-os"],
  },
  {
    slug: "convex-auth",
    title: "Convex Auth — Email Magic Link",
    category: "auth",
    description:
      "@convex-dev/auth with email magic link only. No Clerk, no NextAuth. Self-hosted Convex friendly. Hard mandate per kitab CLAUDE.md.",
    source: "@convex-dev/auth",
    docsUrl: "https://labs.convex.dev/auth",
    dependencies: ["convex", "Resend (for magic-link email)"],
    install: `npm i @convex-dev/auth @auth/core resend`,
    exampleCode: `// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./auth/ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
});

// app/proxy.ts (Next 16 — NOT middleware.ts)
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
export default convexAuthNextjsMiddleware();`,
    agentRecipe:
      "Mount auth in convex/auth.ts. Wire ResendOTP for magic-link delivery. Use convexAuthNextjsMiddleware in app/proxy.ts (Next 16 renamed middleware.ts → proxy.ts). Forbid Clerk per CLAUDE.md.",
    tags: ["auth", "convex", "email-magic-link", "no-clerk"],
    usedBy: ["personal-brand-os", "wirausaha-os", "konsultan-os"],
  },
  {
    slug: "broadcast-channel-sync",
    title: "BroadcastChannel — Cross-iframe Live Sync",
    category: "realtime",
    description:
      "Same-origin iframe live sync without backend. Used in T1 split preview tab — submit form di Public, action propagates ke Admin secara realtime via window.BroadcastChannel.",
    source: "Web Platform — BroadcastChannel API",
    docsUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API",
    dependencies: ["browser only", "useReducer"],
    install: `// no install — Web Platform API`,
    exampleCode: `"use client";
import * as React from "react";

export function StoreProvider({ children }) {
  const [state, baseDispatch] = React.useReducer(reducer, SEED_STATE);
  const channelRef = React.useRef<BroadcastChannel | null>(null);

  React.useEffect(() => {
    const ch = new BroadcastChannel("pbos:sync");
    channelRef.current = ch;
    ch.onmessage = (e) => baseDispatch(e.data);
    return () => ch.close();
  }, []);

  const dispatch = React.useCallback((action) => {
    baseDispatch(action);
    channelRef.current?.postMessage(action);
  }, []);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}`,
    agentRecipe:
      "Use BroadcastChannel only for demo / cross-iframe state mirroring. Production data still goes through Convex realtime. The channel does not echo to the sender so no loop.",
    tags: ["realtime", "broadcast-channel", "cross-iframe", "demo-pattern"],
    usedBy: ["personal-brand-os"],
  },
  {
    slug: "convex-vector-search",
    title: "Convex Vector Index — Semantic Search",
    category: "search",
    description:
      "Built-in vector index on any Convex table. Embed via OpenAI text-embedding-3-small (1536-dim), query via vectorIndex().",
    source: "convex (built-in)",
    docsUrl: "https://docs.convex.dev/database/vector-search",
    dependencies: ["convex", "OpenAI API for embeddings"],
    install: `npm i openai`,
    exampleCode: `// convex/schema.ts
posts: defineTable({
  title: v.string(),
  body: v.string(),
  embedding: v.array(v.float64()),
}).vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["workspaceId", "status"],
}),

// convex/posts.ts
export const search = action({
  args: { query: v.string(), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const emb = await embed(args.query);
    return await ctx.vectorSearch("posts", "by_embedding", {
      vector: emb,
      limit: 10,
      filter: (q) => q.eq("workspaceId", args.workspaceId),
    });
  },
});`,
    agentRecipe:
      "Add embedding field + vectorIndex per searchable table. Re-embed on upsert via Convex action. Cache embeddings — don't re-call OpenAI on every read.",
    tags: ["search", "vector", "convex", "rag"],
    usedBy: ["personal-brand-os", "riset-kit"],
  },
  {
    slug: "resend-newsletter",
    title: "Resend — Transactional & Newsletter",
    category: "email",
    description:
      "Transactional email + newsletter blast via Resend. Double opt-in flow + audience segmentation. Magic-link delivery for Convex Auth.",
    source: "resend + react-email",
    docsUrl: "https://resend.com/docs",
    dependencies: ["Resend API key", "verified sender domain"],
    install: `npm i resend react-email @react-email/components`,
    exampleCode: `// convex/shared/email/resend.ts
import { Resend } from "resend";
import { action } from "../../_generated/server";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendNewsletter = action({
  args: { audienceId: v.string(), subject: v.string(), html: v.string() },
  handler: async (_, args) => {
    await resend.broadcasts.create({
      audienceId: args.audienceId,
      from: "lorem.dev <hi@lorem.dev>",
      subject: args.subject,
      html: args.html,
    });
  },
});`,
    agentRecipe:
      "Use Resend Audiences API for newsletter — store subscriber emails in Convex too for segmentation. Double opt-in: subscriber.create with status 'pending' → click link → status 'confirmed'.",
    tags: ["email", "resend", "newsletter", "transactional"],
    usedBy: ["personal-brand-os", "kreator-studio", "wirausaha-os"],
  },
  {
    slug: "midtrans-payment",
    title: "Midtrans — Indonesia Payment",
    category: "payment",
    description:
      "Pembayaran lokal Indonesia via Midtrans Snap (BCA, Mandiri, BRI, e-wallet GoPay/OVO/Dana, QRIS). Webhook untuk konfirmasi.",
    source: "midtrans-client",
    docsUrl: "https://docs.midtrans.com",
    dependencies: ["Midtrans server + client key", "Convex action for webhook"],
    install: `npm i midtrans-client`,
    exampleCode: `// convex/shared/billing/midtrans.ts
import midtransClient from "midtrans-client";
import { action } from "../../_generated/server";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export const createPayment = action({
  args: { orderId: v.string(), amount: v.number(), customer: v.any() },
  handler: async (_, args) => {
    const tx = await snap.createTransaction({
      transaction_details: { order_id: args.orderId, gross_amount: args.amount },
      customer_details: args.customer,
    });
    return tx.redirect_url;
  },
});`,
    agentRecipe:
      "Midtrans Snap untuk pembayaran instant. Webhook ke Convex HTTP action /api/midtrans-callback untuk update order status. Ingat: PPN 11% sudah included di amount, jangan double-count.",
    tags: ["payment", "midtrans", "indonesia", "qris"],
    usedBy: ["wirausaha-os", "konsultan-os", "kreator-studio"],
  },
  {
    slug: "mdx-blog",
    title: "MDX — Blog Content",
    category: "content",
    description:
      "Markdown-with-JSX untuk blog post. Auto-generate ToC, reading-time, syntax highlight, plus embed React components inline.",
    source: "next-mdx-remote",
    docsUrl: "https://github.com/hashicorp/next-mdx-remote",
    dependencies: ["next-mdx-remote", "rehype-pretty-code", "remark-gfm"],
    install: `npm i next-mdx-remote rehype-pretty-code remark-gfm reading-time`,
    exampleCode: `// app/blog/[slug]/page.tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import readingTime from "reading-time";

export default async function Page({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const stats = readingTime(post.body);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{stats.text}</p>
      <MDXRemote
        source={post.body}
        options={{ mdxOptions: { rehypePlugins: [rehypePrettyCode], remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}`,
    agentRecipe:
      "Store post body sebagai markdown di Convex. Render dengan MDXRemote di [slug]/page.tsx. Auto-extract headings ke ToC via remark plugin custom.",
    tags: ["mdx", "markdown", "blog", "content"],
    usedBy: ["personal-brand-os", "konsultan-os"],
  },
  {
    slug: "cal-com-booking",
    title: "Cal.com — Booking Embed",
    category: "data",
    description:
      "Embed Cal.com booking widget di halaman Services. Self-hosted atau cloud. Webhook ke Convex untuk sync booking ke leads table.",
    source: "@calcom/embed-react",
    docsUrl: "https://cal.com/docs/integrations/web-app/embed",
    dependencies: ["Cal.com account or self-hosted", "event type configured"],
    install: `npm i @calcom/embed-react`,
    exampleCode: `"use client";
import Cal from "@calcom/embed-react";

export function CalEmbed({ eventType }: { eventType: string }) {
  return (
    <Cal
      calLink={\`lorem/\${eventType}\`}
      style={{ width: "100%", height: "600px", overflow: "scroll" }}
      config={{ layout: "month_view", theme: "dark" }}
    />
  );
}`,
    agentRecipe:
      "Embed Cal.com via @calcom/embed-react di halaman services. Configure webhook di Cal.com dashboard → POST ke /api/cal-webhook → create lead di Convex.",
    tags: ["booking", "cal-com", "scheduling", "embed"],
    usedBy: ["personal-brand-os", "konsultan-os"],
  },
];

export function getFeature(slug: string) {
  return features.find((f) => f.slug === slug) ?? null;
}
