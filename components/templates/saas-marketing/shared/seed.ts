import { PUBLIC_BASE } from "./nav-config";
import type {
  BlogPost,
  ChangelogEntry,
  Customer,
  FeatureItem,
  LandingSection,
  Lead,
  PricingTier,
  State,
  Subscription,
} from "./types";

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
  {
    id: "post-5",
    slug: "scaling-to-1m-signed-pdfs",
    title: "Scaling to 1M signed PDFs a month",
    excerpt: "PG partitioning, worker pools, and why we ditched serverless for the render queue.",
    body: `${LOREM}\n\n${LOREM}\n\n${LOREM}`,
    author: "Sven A.",
    publishedAt: day(67),
    tags: ["engineering", "scaling"],
  },
  {
    id: "post-6",
    slug: "soc-2-type-ii-without-burning-out",
    title: "Shipping SOC 2 Type II without burning out the team",
    excerpt: "A pragmatic 90-day plan: scope, evidence collection, and where to spend money.",
    body: `${LOREM}\n\n${LOREM}`,
    author: "Theo L.",
    publishedAt: day(91),
    tags: ["compliance", "operations"],
  },
];

export const SEED_CHANGELOG: ChangelogEntry[] = [
  { id: "v-1-7-0", version: "v1.7.0", date: day(2),  kind: "feature", title: "Sequenced signing flows",          body: "Define a strict signing order with optional reminders per signer." },
  { id: "v-1-6-3", version: "v1.6.3", date: day(8),  kind: "fix",     title: "Fix Safari font fallback in signed PDF", body: "Embedded fonts now render correctly when the source PDF is exported from Safari." },
  { id: "v-1-6-0", version: "v1.6.0", date: day(20), kind: "feature", title: "EU data residency (Frankfurt)",    body: "Pin documents to eu-central-1. Available on Team + Scale plans." },
  { id: "v-1-5-2", version: "v1.5.2", date: day(33), kind: "chore",   title: "Webhook payload v2",                body: "Adds canonical JSON, signed via HMAC-SHA256. v1 supported through 2026-09." },
  { id: "v-1-5-0", version: "v1.5.0", date: day(48), kind: "feature", title: "Reusable signer roles",             body: "Define 'CFO', 'Legal', etc. and reuse across templates." },
];

export const SEED_CUSTOMERS: Customer[] = [
  { id: "cus-1", email: "rae@northwind.co",    name: "Rae H.",     plan: "team",  status: "active",  startedAt: day(62) },
  { id: "cus-2", email: "ivo@kestrel.app",     name: "Ivo M.",     plan: "scale", status: "active",  startedAt: day(128) },
  { id: "cus-3", email: "ann@swiftpay.io",     name: "Annika R.",  plan: "team",  status: "trial",   startedAt: day(4) },
  { id: "cus-4", email: "dev@orbitlabs.dev",   name: "Devi P.",    plan: "free",  status: "active",  startedAt: day(21) },
  { id: "cus-5", email: "luca@bluemoon.studio", name: "Luca B.",   plan: "team",  status: "churned", startedAt: day(190) },
];

export const SEED_SUBSCRIPTIONS: Subscription[] = [
  { id: "sub-1", customerId: "cus-1", customerEmail: "rae@northwind.co", plan: "team",  mrrCents: 4900,  status: "active",   renewsAt: day(-18) },
  { id: "sub-2", customerId: "cus-2", customerEmail: "ivo@kestrel.app",  plan: "scale", mrrCents: 49000, status: "active",   renewsAt: day(-9) },
  { id: "sub-3", customerId: "cus-3", customerEmail: "ann@swiftpay.io",  plan: "team",  mrrCents: 4900,  status: "trialing", renewsAt: day(-10) },
  { id: "sub-4", customerId: "cus-5", customerEmail: "luca@bluemoon.studio", plan: "team", mrrCents: 4900, status: "canceled", renewsAt: day(15) },
];

export const SEED_LEADS: Lead[] = [
  { id: "lead-1", email: "founder@nimbus.dev",  name: "Sam O.",    source: "website",  status: "new",       ts: day(1) },
  { id: "lead-2", email: "ops@flint.studio",    name: "Theo G.",   source: "referral", status: "contacted", ts: day(3) },
  { id: "lead-3", email: "cto@vega.health",     name: "Yara F.",   source: "ad",       status: "qualified", ts: day(6) },
  { id: "lead-4", email: "pm@harbor.app",       name: "Indi C.",   source: "event",    status: "won",       ts: day(14) },
];

const ADMIN_POSTS: BlogPost[] = SEED_POSTS.map((p, i) => ({
  ...p,
  status: i === 0 ? "draft" : "published",
}));

import { SEED_PAGES } from "./pages-seed";
import { SEED_ANALYTICS, SEED_INTEGRATIONS } from "./integrations-seed";

export const SEED_LANDING_SECTIONS: LandingSection[] = [
  { id: "ls-hero", order: 10, kind: "hero", title: "Sign anything, anywhere.", subtitle: "End-to-end secure document signing for distributed teams.", enabled: true },
  { id: "ls-features", order: 20, kind: "features", title: "Why teams switch", subtitle: "Eight reasons our customers replaced legacy e-sign tools.", enabled: true },
  { id: "ls-pricing", order: 30, kind: "pricing", title: "Pricing", subtitle: "Start free, upgrade when you outgrow it.", enabled: true },
  { id: "ls-changelog", order: 40, kind: "changelog", title: "What's new", subtitle: "Shipped this month.", enabled: false },
  { id: "ls-cta", order: 50, kind: "cta", title: "Ready to ship?", subtitle: "Spin up a workspace in 60 seconds.", enabled: true },
];

export const SEED_STATE: State = {
  pricing: SEED_PRICING,
  features: SEED_FEATURES,
  posts: ADMIN_POSTS,
  changelog: SEED_CHANGELOG,
  customers: SEED_CUSTOMERS,
  subscriptions: SEED_SUBSCRIPTIONS,
  leads: SEED_LEADS,
  changelogEntries: SEED_CHANGELOG,
  pages: SEED_PAGES,
  landingSections: SEED_LANDING_SECTIONS,
  integrations: SEED_INTEGRATIONS,
  analytics: SEED_ANALYTICS,
};
