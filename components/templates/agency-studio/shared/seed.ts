import { defaultLandingSections } from "@/components/templates/_shared/landing/seed-factory";
import { SEED_PAGES } from "./pages-seed";
import type { Client, Lead, Project, Service, State } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.";

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    slug: "northwind-rebrand",
    title: "Northwind — full identity rebrand",
    client: "Northwind Logistics",
    category: "Brand Identity",
    cover: "https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=1400&q=70",
    blurb: "Repositioning a 30-year logistics firm for the modern shipper.",
    brief: LOREM,
    outcome: "Visual system rolled out across 14 markets, +28% inbound demo requests Q1 post-launch.",
    status: "delivered",
    publishedAt: day(40),
    featured: true,
  },
  {
    id: "proj-2",
    slug: "cumulus-design-system",
    title: "Cumulus — design system v2",
    client: "Cumulus SaaS",
    category: "Design System",
    cover: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1400&q=70",
    blurb: "Tokens, components, and motion primitives for a cross-platform SaaS.",
    brief: LOREM,
    outcome: "Time-to-prototype reduced 40%; designer-engineer handoff issues down 60%.",
    status: "delivered",
    publishedAt: day(70),
    featured: true,
  },
  {
    id: "proj-3",
    slug: "zenith-launch",
    title: "Zenith — product launch site",
    client: "Zenith Health",
    category: "Web Launch",
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=70",
    blurb: "Pre-order launch site for a connected-device health startup.",
    brief: LOREM,
    outcome: "1.2k pre-orders in 14 days, $480k pre-launch revenue.",
    status: "delivered",
    publishedAt: day(90),
    featured: false,
  },
  {
    id: "proj-4",
    slug: "atlas-internal",
    title: "Atlas — internal portal redesign",
    client: "Atlas Group",
    category: "Product Design",
    cover: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=70",
    blurb: "Frontline workforce portal — shift swaps, payroll, training.",
    brief: LOREM,
    outcome: "Active users 2.4× over 60 days; support tickets cut by 35%.",
    status: "build",
    publishedAt: day(15),
    featured: false,
  },
  {
    id: "proj-5",
    slug: "kira-discovery",
    title: "Kira — strategy discovery",
    client: "Kira AI",
    category: "Strategy",
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=70",
    blurb: "Positioning workshop + market study for a Series A AI startup.",
    brief: LOREM,
    outcome: "In progress — kickoff complete, market interviews underway.",
    status: "discovery",
    publishedAt: day(5),
    featured: false,
  },
];

export const SEED_CLIENTS: Client[] = [
  { id: "cli-1", name: "Northwind Logistics", industry: "Logistics", contact: "Hana Wibowo", email: "hana@northwind.example", status: "active", startedAt: day(120), notes: "Phase 2 retainer signed." },
  { id: "cli-2", name: "Cumulus SaaS", industry: "B2B SaaS", contact: "Diego R.", email: "diego@cumulus.example", status: "active", startedAt: day(180), notes: "Quarterly design system sync." },
  { id: "cli-3", name: "Zenith Health", industry: "Healthtech", contact: "Maya P.", email: "maya@zenith.example", status: "alumni", startedAt: day(280), notes: "Launch delivered, references available." },
  { id: "cli-4", name: "Atlas Group", industry: "Retail", contact: "Pak Anto", email: "anto@atlas.example", status: "active", startedAt: day(45), notes: "Build sprint 3 of 6." },
  { id: "cli-5", name: "Kira AI", industry: "AI", contact: "Sari L.", email: "sari@kira.example", status: "prospect", startedAt: day(8), notes: "Discovery scope priced; awaiting PO." },
];

export const SEED_SERVICES: Service[] = [
  {
    id: "svc-1",
    slug: "brand-strategy",
    name: "Brand Strategy Sprint",
    blurb: "Two-week intensive — positioning, narrative, audience map, naming.",
    priceLabel: "Rp 65jt",
    duration: "2 minggu",
    bullets: ["Stakeholder interviews", "Competitor + market scan", "Positioning canvas", "Narrative deck", "Naming exploration"],
    featured: true,
  },
  {
    id: "svc-2",
    slug: "visual-identity",
    name: "Visual Identity System",
    blurb: "Logo, type, color, motion, and component-level rules.",
    priceLabel: "Rp 120jt",
    duration: "5–8 minggu",
    bullets: ["Logo + lockups", "Typography palette", "Color tokens (OKLch)", "Motion primitives", "Brand guidelines doc"],
    featured: true,
  },
  {
    id: "svc-3",
    slug: "design-system",
    name: "Design System Build",
    blurb: "Production-ready tokens + components in your stack (React/Tailwind/RN).",
    priceLabel: "Rp 250jt",
    duration: "8–12 minggu",
    bullets: ["Token architecture", "Storybook setup", "20+ core components", "Docs + adoption playbook"],
    featured: false,
  },
  {
    id: "svc-4",
    slug: "design-ops",
    name: "Design Ops Retainer",
    blurb: "Embedded design partnership — sprints, reviews, hiring help.",
    priceLabel: "Rp 35jt /bulan",
    duration: "rolling",
    bullets: ["Weekly sprints", "Design reviews", "Recruitment + interview help", "Tooling audits"],
    featured: false,
  },
];

export const SEED_LEADS: Lead[] = [
  { id: "lead-1", name: "Rina Halim",  company: "Halim Furniture", email: "rina@halim.example", topic: "Visual identity refresh",     source: "Contact form",   budget: "Rp 80–120jt", status: "new",       ts: now - 2 * 60 * 60 * 1000 },
  { id: "lead-2", name: "Bayu A.",     company: "PT Sumber Tani",  email: "bayu@stani.example", topic: "Brand strategy + naming",     source: "Service: Brand Strategy", budget: "Rp 65jt",    status: "contacted", ts: day(2) },
  { id: "lead-3", name: "Cinta M.",    company: "Cinta & Co",      email: "cinta@cintaco.example", topic: "Web launch site",          source: "Referral",       budget: "Rp 40–60jt",  status: "qualified", ts: day(5) },
  { id: "lead-4", name: "Tom P.",      company: "Tomo Tools",      email: "tom@tomotools.example", topic: "Design system audit",      source: "Service: Design System", budget: ">Rp 200jt",  status: "won",       ts: day(12) },
];

export const SEED_STATE: State = {
  projects: SEED_PROJECTS,
  clients: SEED_CLIENTS,
  services: SEED_SERVICES,
  leads: SEED_LEADS,
  pages: SEED_PAGES,
  landingSections: defaultLandingSections(),
};
