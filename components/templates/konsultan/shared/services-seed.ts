// Konsultan OS — services seed (public-only, no CRUD).
//
// Three productised consulting offerings. Edit freely after `npx rr add`.

import type { Service } from "./types";

export const SEED_SERVICES: Service[] = [
  {
    id: "svc-strategy-sprint",
    slug: "strategy-sprint",
    name: "Strategy Sprint",
    tagline: "Diagnosa & rekomendasi strategi 6 minggu.",
    priceLabel: "Rp 180jt",
    durationLabel: "6 minggu · 2 konsultan",
    accent: "violet",
    featured: true,
    bullets: [
      "Kick-off workshop dengan tim leadership",
      "Diagnostic interview (8–12 stakeholder)",
      "Market & competitor scan",
      "Strategic options paper (3 opsi)",
      "Board-ready recommendation deck",
    ],
    outcomes: [
      "Pilihan strategi yang teruji secara data",
      "Roadmap implementasi 12 bulan",
      "Konsensus internal lintas divisi",
    ],
  },
  {
    id: "svc-quarterly-retainer",
    slug: "quarterly-retainer",
    name: "Quarterly Retainer",
    tagline: "Pendamping eksekusi strategis tiap kuartal.",
    priceLabel: "Rp 120jt / kuartal",
    durationLabel: "3 bulan · billing per kuartal",
    accent: "emerald",
    bullets: [
      "Bi-weekly steering committee",
      "OKR review & coaching",
      "On-demand consultation (8 jam/bulan)",
      "Akses Slack channel ke tim konsultan",
      "Quarterly board memo",
    ],
    outcomes: [
      "Eksekusi strategi yang konsisten",
      "Tim leadership lebih percaya diri ambil keputusan",
      "Track record progress yang jelas",
    ],
  },
  {
    id: "svc-workshop-facilitation",
    slug: "workshop-facilitation",
    name: "Workshop Facilitation",
    tagline: "Fasilitasi sesi intensif untuk tim leadership.",
    priceLabel: "Rp 45jt",
    durationLabel: "1–2 hari · max 20 peserta",
    accent: "amber",
    bullets: [
      "Design workshop bersama klien",
      "Fasilitasi onsite (Jakarta / luar kota)",
      "Pre-read materials & frameworks",
      "Synthesis deck pasca-workshop",
      "Follow-up coaching 1 jam",
    ],
    outcomes: [
      "Tim selaras dalam 2 hari, bukan 2 bulan",
      "Output yang siap eksekusi",
      "Energi baru di tim leadership",
    ],
  },
];

export function findService(slug: string): Service | undefined {
  return SEED_SERVICES.find((s) => s.slug === slug);
}
