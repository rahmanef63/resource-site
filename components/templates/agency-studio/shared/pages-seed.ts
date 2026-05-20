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
  {
    id: "sys-home",
    slug: "",
    title: "Home",
    description: "Studio landing — hero, featured work, services, CTA.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
    isLanding: true,
  },
  {
    id: "sys-services",
    slug: "services",
    title: "Services",
    description: "Brand strategy, identity, design system, ops retainer.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-portfolio",
    slug: "portfolio",
    title: "Work",
    description: "Project case studies grid.",
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
    description: "Studio principles, team, awards.",
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
    description: "Project inquiry form, calendar, address.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "custom-process",
    slug: "process",
    title: "Our process",
    description: "How an engagement actually runs, week by week.",
    blocks: [
      { kind: "hero", headline: "From kickoff to launch in 8 weeks", sub: "A transparent look at how we work." },
      { kind: "feature-list", heading: "The phases", items: [
        { title: "Week 1–2 — Discovery", body: "Stakeholder interviews, market scan, positioning canvas." },
        { title: "Week 3–4 — Concept", body: "Three creative routes, internal pinning, narrative refinement." },
        { title: "Week 5–7 — Build", body: "Design system, components, motion primitives, copy pass." },
        { title: "Week 8 — Launch", body: "Asset handoff, guidelines, adoption playbook, retro." },
      ]},
      { kind: "stats", heading: "What clients see", items: [
        { value: "8 wks", label: "kickoff → launch" },
        { value: "14", label: "weekly checkpoints" },
        { value: "<48h", label: "feedback turnaround" },
      ]},
      { kind: "cta", headline: "Ready to brief us?", cta: { label: "Start a project", href: `${PUBLIC_BASE}/contact` } },
    ],
    status: "published",
    createdAt: day(20),
    updatedAt: day(3),
    systemPage: false,
  },
];
