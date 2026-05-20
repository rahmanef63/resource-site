import type { PageEntry } from "@/components/templates/_shared/pages/types";
import { PUBLIC_BASE } from "./nav-config";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

/**
 * SEED_PAGES — system pages mirror existing public JSX routes (read-only
 * in admin, listed as reference). Custom seed pages show off the block
 * renderer end-to-end so operators see what "create + edit" looks like.
 */
export const SEED_PAGES: PageEntry[] = [
  // System pages (JSX-rendered) — listed read-only for navigation.
  {
    id: "sys-home",
    slug: "",
    title: "Home",
    description: "Marketing landing — hero, features, social proof, pricing.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
    isLanding: true,
  },
  {
    id: "sys-features",
    slug: "features",
    title: "Features",
    description: "Long-form feature breakdown.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-pricing",
    slug: "pricing",
    title: "Pricing",
    description: "Three tiers + FAQ.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-blog",
    slug: "blog",
    title: "Blog",
    description: "Latest posts grid.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-changelog",
    slug: "changelog",
    title: "Changelog",
    description: "Release timeline.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-about",
    slug: "about",
    title: "About",
    description: "Team, mission, hiring.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-contact",
    slug: "contact",
    title: "Contact",
    description: "Email, schedule a call, social.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  // Custom starter pages — fully editable, demonstrate the renderer.
  {
    id: "custom-case-studies",
    slug: "case-studies",
    title: "Case studies",
    description: "Customer wins, sortable by industry.",
    blocks: [
      { kind: "hero", headline: "How teams ship contracts 10× faster", sub: "Real customers, measurable results." },
      { kind: "stats", heading: "By the numbers", items: [
        { value: "2.5M", label: "contracts signed" },
        { value: "180+", label: "active customers" },
        { value: "<3 min", label: "average turnaround" },
        { value: "99.99%", label: "API uptime" },
      ]},
      { kind: "feature-list", heading: "Featured stories", items: [
        { title: "Acme Corp", body: "Cut legal turnaround from 5 days to 4 hours." },
        { title: "Beta Inc", body: "Replaced 3 tools, saved $48K/year." },
        { title: "Gamma Co", body: "Onboarded enterprise contracts in week 1." },
      ]},
      { kind: "cta", headline: "Ready to ship faster?", cta: { label: "Talk to sales", href: `${PUBLIC_BASE}/contact` } },
    ],
    status: "published",
    createdAt: day(30),
    updatedAt: day(2),
    systemPage: false,
  },
  {
    id: "custom-security",
    slug: "security",
    title: "Security & compliance",
    description: "SOC 2 Type II, GDPR, residency.",
    blocks: [
      { kind: "hero", headline: "Built for regulated industries", sub: "SOC 2 Type II · GDPR · CCPA · HIPAA-ready" },
      { kind: "faq", heading: "Common questions", items: [
        { q: "Where is data stored?", a: "EU + US data residency options. Choose at signup." },
        { q: "Do you support SSO?", a: "SAML 2.0 + OIDC on Team and Scale plans." },
        { q: "What's the audit story?", a: "Immutable audit log retained for 7 years; export via API." },
      ]},
      { kind: "logo-cloud", heading: "Trusted by regulated teams", logos: [
        { label: "Fintech Co" }, { label: "Health Corp" }, { label: "Gov Agency" }, { label: "Insurer Ltd" },
      ]},
    ],
    status: "draft",
    createdAt: day(7),
    updatedAt: day(1),
    systemPage: false,
  },
];
