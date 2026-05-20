import type { PageEntry } from "@/components/templates/_shared/pages/types";
import { PUBLIC_BASE } from "./nav-config";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

/**
 * SEED_PAGES — system pages mirror existing public JSX routes (read-only
 * in admin). Custom seed pages show off the block renderer end-to-end.
 */
export const SEED_PAGES: PageEntry[] = [
  {
    id: "sys-home",
    slug: "",
    title: "Home",
    description: "Creator landing — bio, latest posts, subscribe.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
    isLanding: true,
  },
  {
    id: "sys-posts",
    slug: "posts",
    title: "Posts",
    description: "All public posts.",
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
    description: "Who I am, what I make, where to find me.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  // Custom page — demonstrates the renderer end-to-end.
  {
    id: "custom-newsletter",
    slug: "newsletter",
    title: "Newsletter",
    description: "Weekly drops — what I'm shipping + best links.",
    blocks: [
      { kind: "hero", headline: "The Weekly Drop", sub: "Friday mornings — short, useful, free." },
      { kind: "text", heading: "What you'll get", body: "Two essays per month, a tools list, and one experiment I'm running." },
      { kind: "feature-list", heading: "Past issues", items: [
        { title: "Issue 42 — Voice-first content workflow", body: "Recording on phone, transcribing, editing in 20 min." },
        { title: "Issue 41 — A 4-tool stack", body: "Why I cut from 11 tools to 4 last quarter." },
        { title: "Issue 40 — Hooks that don't suck", body: "5 templates that consistently outperform clickbait." },
      ]},
      { kind: "cta", headline: "Subscribe — it's free", cta: { label: "Subscribe", href: PUBLIC_BASE } },
    ],
    status: "published",
    createdAt: day(12),
    updatedAt: day(2),
    systemPage: false,
  },
];
