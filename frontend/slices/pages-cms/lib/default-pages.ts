import type { PageEntry } from "../types";

/**
 * Generic starter pages — a neutral Home / About / Pricing set that shows
 * off the block renderer end-to-end. All `systemPage: false` so they're
 * fully editable. Swap this for your own seed (or seed from a backend).
 *
 * NOT template-specific: no marketing copy tied to any product.
 */
export function defaultPages(): PageEntry[] {
  const now = Date.now();
  const day = (n: number) => now - n * 24 * 60 * 60 * 1000;
  return [
    {
      id: "page-home",
      slug: "",
      title: "Home",
      description: "Landing page — hero, features, social proof, CTA.",
      blocks: [
        { kind: "hero", headline: "Build pages from blocks", sub: "A small CMS you own — list, create, edit, publish.", cta: { label: "Get started", href: "/pricing" } },
        { kind: "feature-list", heading: "What you get", items: [
          { title: "11 block kinds", body: "Hero, text, features, CTA, logos, testimonials, video, gallery, FAQ, stats, pricing." },
          { title: "No lock-in", body: "Run on localStorage or wire it to your own backend." },
          { title: "Editable", body: "Own the slice files — tweak Tailwind, theme tokens, and logic freely." },
        ]},
        { kind: "stats", heading: "By the numbers", items: [
          { value: "11", label: "block kinds" },
          { value: "0", label: "runtime deps" },
          { value: "100%", label: "yours to edit" },
        ]},
        { kind: "cta", headline: "Ready to compose?", sub: "Add a page and drop in your first block.", cta: { label: "View pricing", href: "/pricing" } },
      ],
      status: "published",
      createdAt: day(30),
      updatedAt: day(2),
      systemPage: false,
      isLanding: true,
    },
    {
      id: "page-about",
      slug: "about",
      title: "About",
      description: "Who we are and what we believe.",
      blocks: [
        { kind: "hero", headline: "About us", sub: "A short story about the team." },
        { kind: "text", heading: "Our mission", body: "We make it easy to compose content from reusable blocks. Every page is just an ordered list of blocks — readable, portable, and yours." },
        { kind: "testimonial", quote: "It took ten minutes to ship a landing page.", author: "A happy builder", role: "Founder" },
      ],
      status: "published",
      createdAt: day(25),
      updatedAt: day(5),
      systemPage: false,
    },
    {
      id: "page-pricing",
      slug: "pricing",
      title: "Pricing",
      description: "Simple, transparent tiers.",
      blocks: [
        { kind: "hero", headline: "Pricing", sub: "Pick a plan that fits." },
        { kind: "pricing-table", heading: "Plans", tiers: [
          { name: "Free", price: "$0", period: "/mo", bullets: ["1 site", "Unlimited pages", "Community support"], cta: { label: "Start free", href: "#" } },
          { name: "Pro", price: "$19", period: "/mo", bullets: ["Custom domain", "Priority support", "Export anytime"], cta: { label: "Go Pro", href: "#" }, featured: true },
          { name: "Team", price: "$49", period: "/mo", bullets: ["Everything in Pro", "5 seats", "SSO"], cta: { label: "Contact us", href: "#" } },
        ]},
        { kind: "faq", heading: "Questions", items: [
          { q: "Can I cancel anytime?", a: "Yes — no contracts, cancel whenever." },
          { q: "Do you offer refunds?", a: "30-day money-back guarantee on paid plans." },
        ]},
      ],
      status: "published",
      createdAt: day(20),
      updatedAt: day(1),
      systemPage: false,
    },
  ];
}
