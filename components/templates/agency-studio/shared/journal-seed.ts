import type { Article, ProcessStep } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

const LONG_BODY = `Setiap brand system yang kami kerjakan dimulai dari satu pertanyaan: apa yang akan diukur tim ini enam bulan setelah peluncuran? Kalau jawabannya kabur, identitas visual tidak akan menyelamatkan. Strategi dulu, baru bentuk.

Dalam project ini kami menjalankan delapan stakeholder interview, tiga competitor audit, dan satu sprint naming dua hari. Hasilnya bukan deck cantik — tapi satu kalimat positioning yang dipakai sales, satu set token warna yang dipakai engineering, dan satu motion principle yang dipakai marketing.

Yang menarik: tim klien lebih suka membahas trade-off daripada melihat 40 logo direction. Itu sinyal kuat bahwa mereka siap menjalankan sistem, bukan sekadar membeli aset.

Pelajaran untuk studio kami: lebih sedikit revision round, lebih banyak workshop. Klien yang dilibatkan sejak hari pertama akan mengadopsi sistem 3× lebih cepat.`;

export const SEED_ARTICLES: Article[] = [
  {
    id: "art-1",
    slug: "northwind-rebrand-six-month-revisit",
    title: "Northwind: enam bulan setelah rebrand",
    excerpt: "Apa yang berubah setelah identitas baru diluncurkan ke 14 pasar — angka, friksi, dan satu surprise.",
    body: LONG_BODY,
    category: "case-study",
    author: "Asti R.",
    readMinutes: 7,
    publishedAt: day(12),
    cover: "https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=1400&q=70",
    featured: true,
  },
  {
    id: "art-2",
    slug: "design-system-adoption-playbook",
    title: "Playbook adopsi design system — versi 2026",
    excerpt: "Dari Storybook ke production: bagaimana memastikan komponen dipakai, bukan dipajang.",
    body: LONG_BODY,
    category: "essay",
    author: "Bagas P.",
    readMinutes: 9,
    publishedAt: day(28),
    cover: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1400&q=70",
    featured: true,
  },
  {
    id: "art-3",
    slug: "naming-sprint-two-day-format",
    title: "Naming sprint dalam dua hari, bukan dua bulan",
    excerpt: "Format workshop terkompresi yang kami pakai untuk semua project sejak Q3.",
    body: LONG_BODY,
    category: "field-notes",
    author: "Citra W.",
    readMinutes: 5,
    publishedAt: day(45),
  },
  {
    id: "art-4",
    slug: "motion-tokens-oklch-experiment",
    title: "Motion tokens + OKLch: eksperimen cross-platform",
    excerpt: "Mendokumentasikan motion seperti color tokens — apa yang berhasil, apa yang patah.",
    body: LONG_BODY,
    category: "essay",
    author: "Daniel S.",
    readMinutes: 11,
    publishedAt: day(60),
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=70",
  },
  {
    id: "art-5",
    slug: "zenith-launch-1200-preorders",
    title: "Zenith — 1.200 pre-order dalam 14 hari",
    excerpt: "Anatomi launch site yang ramping: tiga halaman, satu form, nol distraksi.",
    body: LONG_BODY,
    category: "case-study",
    author: "Asti R.",
    readMinutes: 8,
    publishedAt: day(85),
    cover: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=70",
  },
];

export const SEED_PROCESS_STEPS: ProcessStep[] = [
  {
    id: "step-discovery",
    index: 1,
    phase: "Discovery",
    blurb: "Stakeholder interviews, market scan, dan workshop positioning. Kami pulang dengan satu kalimat positioning yang tim sales bisa pakai besok.",
    duration: "1–2 minggu",
    deliverables: ["Stakeholder map", "Competitor audit", "Positioning canvas", "Audience hypothesis"],
  },
  {
    id: "step-design",
    index: 2,
    phase: "Design Sprint",
    blurb: "Dua minggu intensif. Bukan 40 logo direction — tiga territory yang berbeda secara strategis, masing-masing teruji ke audience proxy.",
    duration: "2–3 minggu",
    deliverables: ["Brand territories", "Type + color tokens", "Motion principles", "Naming exploration"],
  },
  {
    id: "step-build",
    index: 3,
    phase: "Build",
    blurb: "Production-ready: tokens di Figma + Tailwind, komponen di Storybook, motion primitives di Framer. Engineering di-loop sejak hari satu.",
    duration: "5–10 minggu",
    deliverables: ["Token architecture", "Component library", "Storybook docs", "Adoption playbook"],
  },
  {
    id: "step-launch",
    index: 4,
    phase: "Launch & Revisit",
    blurb: "Soft launch internal dulu, kemudian eksternal. Kami kembali setelah 6 minggu untuk audit adopsi — gratis, bagian dari paket.",
    duration: "2 minggu + 6 minggu revisit",
    deliverables: ["Launch checklist", "Internal training session", "Adoption metrics dashboard", "Six-week revisit audit"],
  },
];
