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
    description: "Consultancy landing — pitch, sectors, CTA.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
    isLanding: true,
  },
  {
    id: "sys-case-studies",
    slug: "case-studies",
    title: "Case Studies",
    description: "Selected engagements, outcomes, references.",
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
    description: "Konsultasi gratis form, calendar, address.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  // Custom page.
  {
    id: "custom-approach",
    slug: "approach",
    title: "Pendekatan kami",
    description: "Metodologi 4-fase, dari diagnosis sampai handover.",
    blocks: [
      { kind: "hero", headline: "Diagnosis → Desain → Eksekusi → Handover", sub: "Cara kami bekerja, transparan dan terukur." },
      { kind: "feature-list", heading: "Empat fase", items: [
        { title: "1. Diagnosis", body: "Wawancara stakeholder, audit data, peta masalah." },
        { title: "2. Desain", body: "Workshop solusi, prototyping, biaya & manfaat." },
        { title: "3. Eksekusi", body: "Pendampingan tim internal, milestone mingguan." },
        { title: "4. Handover", body: "SOP, training, knowledge transfer terdokumentasi." },
      ]},
      { kind: "stats", heading: "Track record", items: [
        { value: "60+", label: "engagement selesai" },
        { value: "92%", label: "klien repeat order" },
        { value: "8 thn", label: "pengalaman tim" },
      ]},
      { kind: "cta", headline: "Konsultasi gratis 30 menit", cta: { label: "Jadwalkan", href: `${PUBLIC_BASE}/contact` } },
    ],
    status: "published",
    createdAt: day(18),
    updatedAt: day(2),
    systemPage: false,
  },
];
