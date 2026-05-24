import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { SEED_PAGES } from "./pages-seed";

export const SEED_LANDING_SECTIONS: LandingSection[] = [
  {
    id: "ls-hero",
    order: 10,
    kind: "hero",
    title: "Konsultan independen, tools setara firma global.",
    subtitle:
      "Proposal AI, kontrak ID-aware, PajakAware invoicing — workspace lengkap untuk konsultan Indonesia yang serius.",
    enabled: true,
    config: '{"badge":"Boutique consulting · Indonesia"}',
  },
  {
    id: "ls-services",
    order: 20,
    kind: "services",
    title: "Empat area utama",
    subtitle: "Fokus di strategi, operasi, organisasi, dan workshop intensif.",
    enabled: true,
  },
  {
    id: "ls-features",
    order: 30,
    kind: "features",
    title: "Tools yang menjalankan praktik kami",
    subtitle: "Sistem ini sama yang juga bisa Anda pakai untuk firma sendiri.",
    enabled: true,
  },
  {
    id: "ls-portfolio",
    order: 40,
    kind: "portfolio",
    title: "Proyek terbaru",
    subtitle: "Sebagian engagement yang sedang/telah berjalan.",
    enabled: true,
  },
  {
    id: "ls-cta",
    order: 50,
    kind: "cta",
    title: "Siap mulai konsultasi?",
    subtitle: "Konsultasi awal gratis. Respons dalam 24 jam.",
    enabled: true,
  },
];
import type {
  Client,
  ConsultDoc,
  Contract,
  Invoice,
  Project,
  Proposal,
  State,
} from "./types";
import { SEED_CALENDAR_EVENTS } from "./calendar-seed";
import { SEED_KB_ARTICLES } from "./kb-seed";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;
const future = (n: number) => now + n * 24 * 60 * 60 * 1000;

export const SEED_CLIENTS: Client[] = [
  {
    id: "cl-1",
    name: "Aditya Pratama",
    company: "PT Acme Indonesia",
    industry: "Manufaktur",
    email: "aditya@acme.id",
    phone: "+62 812-1111-2222",
    city: "Jakarta",
    status: "active",
    createdAt: day(40),
  },
  {
    id: "cl-2",
    name: "Putri Maharani",
    company: "Foobar Group",
    industry: "F&B",
    email: "putri@foobar.com",
    phone: "+62 813-3333-4444",
    city: "Bandung",
    status: "lead",
    createdAt: day(8),
  },
  {
    id: "cl-3",
    name: "Bayu Setiawan",
    company: "Beta Labs",
    industry: "Technology",
    email: "bayu@beta.io",
    phone: "+62 814-5555-6666",
    city: "Surabaya",
    status: "completed",
    createdAt: day(120),
  },
];

export const SEED_PROPOSALS: Proposal[] = [
  {
    id: "pp-1",
    clientId: "cl-1",
    title: "Lean Operations Audit Q2",
    scope: "Audit operasional 3 pabrik di Jawa Barat. Deliverable: peta value-stream + 12 quick-wins.",
    valueLabel: "Rp 240jt",
    durationLabel: "8 minggu",
    status: "accepted",
    createdAt: day(38),
  },
  {
    id: "pp-2",
    clientId: "cl-2",
    title: "GTM Strategy Workshop",
    scope: "Workshop intensif 5 hari + roadmap GTM untuk launch line baru produk frozen food.",
    valueLabel: "Rp 80jt",
    durationLabel: "5 hari",
    status: "sent",
    createdAt: day(6),
  },
  {
    id: "pp-3",
    clientId: "cl-3",
    title: "Engineering Org Design",
    scope: "Reorganisasi tim engineering dari 12 → 28 orang. Career ladder + interview rubric.",
    valueLabel: "Rp 120jt",
    durationLabel: "6 minggu",
    status: "accepted",
    createdAt: day(110),
  },
];

export const SEED_CONTRACTS: Contract[] = [
  {
    id: "ct-1",
    proposalId: "pp-1",
    clientId: "cl-1",
    title: "Kontrak Kerja — Lean Ops Audit",
    termsSummary: "8 minggu, milestone bulanan, payment 40/30/30. PPN 11% included.",
    status: "signed",
    signedAt: day(36),
    endsAt: future(20),
  },
  {
    id: "ct-2",
    proposalId: "pp-3",
    clientId: "cl-3",
    title: "Kontrak Kerja — Engineering Org",
    termsSummary: "6 minggu, fixed fee, payment 50/50. Bahasa Indonesia + English bilingual.",
    status: "expired",
    signedAt: day(108),
    endsAt: day(60),
  },
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "pr-1",
    contractId: "ct-1",
    clientId: "cl-1",
    name: "Lean Ops Audit — Acme",
    description: "Audit operasional 3 pabrik. Phase 2 dari 4.",
    status: "in-progress",
    progress: 48,
    startedAt: day(35),
    endsAt: future(20),
  },
  {
    id: "pr-2",
    contractId: "ct-2",
    clientId: "cl-3",
    name: "Engineering Org — Beta Labs",
    description: "Sudah delivered. Maintenance phase.",
    status: "delivered",
    progress: 100,
    startedAt: day(105),
    endsAt: day(60),
  },
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: "in-1",
    projectId: "pr-1",
    clientId: "cl-1",
    number: "INV-2026-001",
    amountLabel: "Rp 96jt",
    ppnLabel: "Rp 10.56jt (11%)",
    totalLabel: "Rp 106.56jt",
    status: "paid",
    dueAt: day(20),
    issuedAt: day(30),
  },
  {
    id: "in-2",
    projectId: "pr-1",
    clientId: "cl-1",
    number: "INV-2026-002",
    amountLabel: "Rp 72jt",
    ppnLabel: "Rp 7.92jt (11%)",
    totalLabel: "Rp 79.92jt",
    status: "sent",
    dueAt: future(8),
    issuedAt: day(2),
  },
  {
    id: "in-3",
    projectId: "pr-2",
    clientId: "cl-3",
    number: "INV-2026-003",
    amountLabel: "Rp 60jt",
    ppnLabel: "Rp 6.6jt (11%)",
    totalLabel: "Rp 66.6jt",
    status: "paid",
    dueAt: day(58),
    issuedAt: day(70),
  },
];

export const SEED_DOCUMENTS: ConsultDoc[] = [
  {
    id: "dc-1",
    projectId: "pr-1",
    title: "Phase 1 — Value Stream Map",
    kind: "deliverable",
    status: "shared",
    updatedAt: day(20),
  },
  {
    id: "dc-2",
    projectId: "pr-1",
    title: "Weekly memo W6",
    kind: "memo",
    status: "shared",
    updatedAt: day(2),
  },
  {
    id: "dc-3",
    projectId: "pr-2",
    title: "Final report — Engineering Org",
    kind: "report",
    status: "shared",
    updatedAt: day(60),
  },
];

export const SEED_STATE: State = {
  clients: SEED_CLIENTS,
  proposals: SEED_PROPOSALS,
  contracts: SEED_CONTRACTS,
  projects: SEED_PROJECTS,
  invoices: SEED_INVOICES,
  documents: SEED_DOCUMENTS,
  calendarEvents: SEED_CALENDAR_EVENTS,
  kbArticles: SEED_KB_ARTICLES,
  pages: SEED_PAGES,
  landingSections: SEED_LANDING_SECTIONS,
};
