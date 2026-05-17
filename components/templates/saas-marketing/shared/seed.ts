import { PUBLIC_BASE } from "./nav-config";
import type { BlogPost, ChangelogEntry, FeatureItem, PricingTier, State } from "./types";

const CONTACT_HREF = `${PUBLIC_BASE}/contact`;

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.";

export const SEED_PRICING: PricingTier[] = [
  {
    id: "tier-free",
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Everything you need to ship your first signed doc.",
    bullets: ["100 signed PDFs / month", "1 team member", "Community support", "REST API + webhooks"],
    cta: { label: "Start free", href: CONTACT_HREF },
    featured: false,
  },
  {
    id: "tier-team",
    name: "Team",
    price: "$49",
    period: "per month",
    blurb: "For startups shipping signed contracts daily.",
    bullets: ["10,000 signed PDFs / month", "Up to 10 seats", "Email support", "Audit log + SAML SSO"],
    cta: { label: "Start 14-day trial", href: CONTACT_HREF },
    featured: true,
  },
  {
    id: "tier-scale",
    name: "Scale",
    price: "Custom",
    period: "annual",
    blurb: "Volume + compliance for regulated industries.",
    bullets: ["Unlimited signed PDFs", "Unlimited seats", "EU + US data residency", "Dedicated support, SLA"],
    cta: { label: "Talk to sales", href: CONTACT_HREF },
    featured: false,
  },
];

export const SEED_FEATURES: FeatureItem[] = [
  { id: "f-1", title: "One-line signing API", blurb: "POST a doc + signer email — we return a signed PDF.", icon: "Zap" },
  { id: "f-2", title: "Audit-ready trail", blurb: "Tamper-evident audit log per document, exportable as JSON or PDF.", icon: "ShieldCheck" },
  { id: "f-3", title: "Webhook reliability", blurb: "Retries with exponential backoff, signed payloads, idempotency keys.", icon: "Webhook" },
  { id: "f-4", title: "EU + US residency", blurb: "Pin every document to a region. SOC 2 Type II + ISO 27001.", icon: "Globe2" },
  { id: "f-5", title: "Team workflows", blurb: "Templates, reusable signer roles, sequenced signing flows.", icon: "Users" },
  { id: "f-6", title: "Generous free tier", blurb: "100 signed PDFs / month free, forever. No card required.", icon: "Gift" },
];

export const SEED_POSTS: BlogPost[] = [
  {
    id: "post-1",
    slug: "shipping-signed-pdfs-in-an-afternoon",
    title: "Shipping signed PDFs in an afternoon",
    excerpt: "How a two-developer team replaced their DocuSign integration in one sprint.",
    body: `${LOREM}\n\n${LOREM}\n\n${LOREM}`,
    author: "Mira K.",
    publishedAt: day(3),
    tags: ["case-study", "api"],
  },
  {
    id: "post-2",
    slug: "audit-trail-best-practices",
    title: "Audit trail best practices for regulated industries",
    excerpt: "Five patterns we learned shipping audit trails for fintech + healthtech customers.",
    body: `${LOREM}\n\n${LOREM}`,
    author: "Theo L.",
    publishedAt: day(11),
    tags: ["compliance", "best-practices"],
  },
  {
    id: "post-3",
    slug: "webhook-reliability-deep-dive",
    title: "Webhook reliability: a deep dive into our retry queue",
    excerpt: "Idempotency keys, dead-letter handling, and why we picked PostgreSQL over Redis.",
    body: `${LOREM}\n\n${LOREM}`,
    author: "Sven A.",
    publishedAt: day(24),
    tags: ["engineering", "infrastructure"],
  },
  {
    id: "post-4",
    slug: "what-we-learned-onboarding-100-startups",
    title: "What we learned onboarding 100 startups",
    excerpt: "Common signing flow mistakes — and the four-step onboarding that fixes them.",
    body: `${LOREM}\n\n${LOREM}`,
    author: "Mira K.",
    publishedAt: day(48),
    tags: ["product", "onboarding"],
  },
];

export const SEED_CHANGELOG: ChangelogEntry[] = [
  { id: "v-1-7-0", version: "v1.7.0", date: day(2),  kind: "feature", title: "Sequenced signing flows",          body: "Define a strict signing order with optional reminders per signer." },
  { id: "v-1-6-3", version: "v1.6.3", date: day(8),  kind: "fix",     title: "Fix Safari font fallback in signed PDF", body: "Embedded fonts now render correctly when the source PDF is exported from Safari." },
  { id: "v-1-6-0", version: "v1.6.0", date: day(20), kind: "feature", title: "EU data residency (Frankfurt)",    body: "Pin documents to eu-central-1. Available on Team + Scale plans." },
  { id: "v-1-5-2", version: "v1.5.2", date: day(33), kind: "chore",   title: "Webhook payload v2",                body: "Adds canonical JSON, signed via HMAC-SHA256. v1 supported through 2026-09." },
  { id: "v-1-5-0", version: "v1.5.0", date: day(48), kind: "feature", title: "Reusable signer roles",             body: "Define 'CFO', 'Legal', etc. and reuse across templates." },
];

export const SEED_STATE: State = {
  pricing: SEED_PRICING,
  features: SEED_FEATURES,
  posts: SEED_POSTS,
  changelog: SEED_CHANGELOG,
};
