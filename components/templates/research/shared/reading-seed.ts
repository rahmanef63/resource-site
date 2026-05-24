// Riset Kit — public reading-list seed (curated bacaan eksternal).

import type { PublicReadingItem } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_READING_LIST: PublicReadingItem[] = [
  {
    id: "read-1",
    title: "On the dangers of stochastic parrots",
    source: "Bender, Gebru, McMillan-Major & Mitchell — FAccT 2021",
    year: 2021,
    category: "paper",
    href: "#",
    why: "Wajib baca sebelum bahas etika LLM. Argumen environmental + bias paling sering disitir.",
    addedAt: day(3),
  },
  {
    id: "read-2",
    title: "Research as a stuck process",
    source: "Andy Matuschak (essay)",
    year: 2022,
    category: "essay",
    href: "#",
    why: "Reframing kenapa workflow riset patah. Influence ke desain tool note-taking modern.",
    addedAt: day(6),
  },
  {
    id: "read-3",
    title: "How to take smart notes",
    source: "Sönke Ahrens (book)",
    year: 2017,
    category: "book",
    href: "#",
    why: "Zettelkasten secara praktis. Dasar buat workflow notes ↔ paper di workspace.",
    addedAt: day(9),
  },
  {
    id: "read-4",
    title: "The methodology section that fooled three reviewers",
    source: "Anonymous PI thread",
    year: 2024,
    category: "thread",
    href: "#",
    why: "Studi kasus tentang ambiguitas method writing. Pakai sebagai contoh negatif di seminar.",
    addedAt: day(12),
  },
  {
    id: "read-5",
    title: "Reproducibility of social science research",
    source: "Camerer et al. — Nature Human Behaviour",
    year: 2018,
    category: "paper",
    href: "#",
    why: "Hanya 62% studi sosial yang ter-reproduksi. Patokan empiris saat mendiskusikan replication crisis.",
    addedAt: day(15),
  },
  {
    id: "read-6",
    title: "Open data Indonesia: laporan tahunan",
    source: "AIPI (Akademi Ilmu Pengetahuan Indonesia)",
    year: 2025,
    category: "report",
    href: "#",
    why: "Data terbaru tentang adopsi open data di kampus lokal. Sumber kuantitatif untuk policy paper.",
    addedAt: day(20),
  },
  {
    id: "read-7",
    title: "Writing science in plain English",
    source: "Anne E. Greene (book)",
    year: 2013,
    category: "book",
    href: "#",
    why: "Toolkit konkret untuk membersihkan paragraf akademik yang berbelit. Cocok dipasangkan dengan AI Reader.",
    addedAt: day(24),
  },
  {
    id: "read-8",
    title: "The careful use of AI in qualitative coding",
    source: "Brown & Wei — Qualitative Research Quarterly",
    year: 2025,
    category: "paper",
    href: "#",
    why: "Panduan reproducibility saat pakai LLM untuk thematic coding. Cek sebelum draft method bab 3.",
    addedAt: day(28),
  },
];
