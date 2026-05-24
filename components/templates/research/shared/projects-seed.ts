// Riset Kit — research projects seed. Datasets + collaborators moved to
// datasets-seed.ts (re-exported below) to stay under 200 LOC cap.

import type { Project } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Beban kognitif platform UMKM digital di Indonesia",
    hypothesis:
      "Friksi onboarding (bukan literasi teknologi) adalah prediktor terkuat ketidakberhasilan adopsi platform digital di UMKM kuliner Indonesia.",
    status: "writing",
    startedAt: day(180),
    updatedAt: day(2),
    targetVenue: "Journal of Cognitive Studies",
    linkedDocIds: ["doc-1", "doc-2"],
    linkedNoteIds: ["note-1", "note-2"],
    collaboratorIds: ["col-1", "col-2"],
    progress: 72,
  },
  {
    id: "proj-2",
    title: "Evaluasi LLM untuk parafrase teks akademik bahasa Indonesia",
    hypothesis:
      "LLM open-weights (≥ 7B parameter) dapat menyamai performa closed-source untuk parafrase ekspositori bahasa Indonesia, tetapi tertinggal untuk teks argumentatif.",
    status: "active",
    startedAt: day(90),
    updatedAt: day(5),
    targetVenue: "Proc. ACL 2026",
    linkedDocIds: ["doc-1"],
    linkedNoteIds: ["note-3"],
    collaboratorIds: ["col-3", "col-4"],
    progress: 55,
  },
  {
    id: "proj-3",
    title: "Dampak ERP terhadap kongesti Jakarta — extended analysis",
    hypothesis:
      "Efek ERP terhadap kongesti tidak signifikan tanpa integrasi BRT pada koridor sasaran. Substitusi modal transportasi adalah mediator utama.",
    status: "exploring",
    startedAt: day(30),
    updatedAt: day(7),
    targetVenue: "Jakarta Policy Journal",
    linkedDocIds: ["doc-3"],
    linkedNoteIds: [],
    collaboratorIds: ["col-5"],
    progress: 18,
  },
  {
    id: "proj-4",
    title: "Pemetaan ekosistem riset terbuka kampus Indonesia (gelombang 2)",
    hypothesis:
      "Adopsi repositori institusional berkorelasi dengan keberadaan policy formal pada level rektorat, bukan inisiatif fakultas.",
    status: "submitted",
    startedAt: day(365),
    updatedAt: day(14),
    targetVenue: "Riset Kit Policy Brief 04",
    linkedDocIds: [],
    linkedNoteIds: [],
    collaboratorIds: ["col-1", "col-6"],
    progress: 95,
  },
  {
    id: "proj-5",
    title: "Etnografi adopsi AI generatif di newsroom Indonesia",
    hypothesis:
      "Newsroom besar mengadopsi AI generatif secara bottom-up (jurnalis individu) sebelum top-down (kebijakan editorial), menciptakan ketegangan tata kelola.",
    status: "active",
    startedAt: day(60),
    updatedAt: day(1),
    targetVenue: "Indonesian Ethnography Review",
    linkedDocIds: [],
    linkedNoteIds: ["note-2"],
    collaboratorIds: ["col-2", "col-3"],
    progress: 38,
  },
];

// Re-export for callers using the prior bundled API.
export { SEED_DATASETS, SEED_COLLABORATORS } from "./datasets-seed";
