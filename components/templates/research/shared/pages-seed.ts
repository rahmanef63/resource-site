import type { PageEntry } from "@/components/templates/_shared/pages/types";
import { ADMIN_BASE } from "./nav-config";

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
    description: "Riset Kit landing — value prop, lib preview, CTA.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
    isLanding: true,
  },
  {
    id: "sys-library",
    slug: "library",
    title: "Library",
    description: "Public document library — searchable, downloadable.",
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
    description: "Tentang tool, tim, dan metodologi.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  // Custom starter page.
  {
    id: "custom-methodology",
    slug: "methodology",
    title: "Metodologi",
    description: "Cara kami review literatur dan kelola sitasi.",
    blocks: [
      { kind: "hero", headline: "Sistematis, transparan, reproducible", sub: "Tiga prinsip lit-review yang kami pakai." },
      { kind: "feature-list", heading: "Tiga prinsip", items: [
        { title: "Pre-registration", body: "Pertanyaan + kriteria inklusi/ekslusi ditulis dulu sebelum cari paper." },
        { title: "PRISMA flow", body: "Identifikasi → screening → eligibility → included, semua dengan jumlah." },
        { title: "Audit trail", body: "Setiap keputusan inklusi tercatat dengan nama reviewer + tanggal." },
      ]},
      { kind: "faq", heading: "FAQ", items: [
        { q: "Database apa saja?", a: "Scopus, Web of Science, Google Scholar, plus database lokal SINTA." },
        { q: "Tools pendamping?", a: "Zotero untuk referensi, Rayyan untuk screening, VOSviewer untuk bibliometrik." },
        { q: "Bagaimana cek kualitas?", a: "Risk-of-bias tool sesuai design — Cochrane RoB 2 untuk RCT, MMAT untuk mixed-methods." },
      ]},
      { kind: "cta", headline: "Mulai review dengan AI Reader", cta: { label: "Buka workspace", href: ADMIN_BASE } },
    ],
    status: "published",
    createdAt: day(14),
    updatedAt: day(2),
    systemPage: false,
  },
];
