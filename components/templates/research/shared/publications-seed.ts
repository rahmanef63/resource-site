// Riset Kit — public publications + extra public citations seed.
// Split from shared/seed.ts so per-template seed.ts stays focused on
// workspace state, and to stay under the 200 LOC cap.

import type { Publication } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_PUBLICATIONS: Publication[] = [
  {
    id: "pub-1",
    slug: "cognitive-load-meta-analysis-2024",
    title: "Lorem ipsum: A meta-analysis of cognitive load patterns",
    authors: "Pratama A., Sari R., Wijaya B.",
    year: 2024,
    venue: "Journal of Cognitive Studies",
    type: "journal",
    doi: "10.1234/jcs.2024.0088",
    pages: "88-104",
    pdfHref: "#",
    abstract:
      "Meta-analisis terhadap 42 studi primer (2010-2023) menggunakan random-effects model. Temuan utama: beban kognitif konsisten lintas demografi, dengan friksi onboarding sebagai prediktor terkuat (β=0.41, p<.001).",
    keywords: ["cognitive load", "meta-analysis", "onboarding", "UX"],
  },
  {
    id: "pub-2",
    slug: "etnografi-umkm-kuliner-bandung-2023",
    title: "Ipsum doloremque: Riset etnografi UMKM kuliner Indonesia",
    authors: "Hartono L., Setiawan B.",
    year: 2023,
    venue: "Indonesian Ethnography Review",
    type: "journal",
    doi: "10.5678/ier.2023.0214",
    pages: "214-238",
    pdfHref: "#",
    abstract:
      "Etnografi 6-bulan di 12 UMKM kuliner Bandung. Temuan: adopsi digital terhambat oleh literasi finansial, bukan akses teknologi. Implikasi kebijakan: program literasi finansial > subsidi gadget.",
    keywords: ["ethnography", "UMKM", "literasi finansial", "Bandung"],
  },
  {
    id: "pub-3",
    slug: "kebijakan-erp-jakarta-2025",
    title: "Sit amet: Tinjauan kebijakan transportasi publik Jakarta",
    authors: "Maharani P., Wijaya A.",
    year: 2025,
    venue: "Jakarta Policy Journal",
    type: "journal",
    doi: "10.9012/jpj.2025.0014",
    pages: "14-29",
    pdfHref: "#",
    abstract:
      "Analisis dampak ERP terhadap kongesti dan emisi periode 2018-2024. Korelasi negatif lemah pada koridor utama (r=-0.18). Rekomendasi: integrasi ERP dengan BRT untuk efek substitusi modal.",
    keywords: ["ERP", "transportasi", "Jakarta", "policy analysis"],
  },
  {
    id: "pub-4",
    slug: "preprint-llm-akademik-id-2026",
    title: "Consectetur: Evaluasi LLM untuk parafrase teks akademik bahasa Indonesia",
    authors: "Nugroho D., Lestari M., Ramadhan F.",
    year: 2026,
    venue: "arXiv:2601.04421",
    type: "preprint",
    doi: "10.48550/arXiv.2601.04421",
    pdfHref: "#",
    abstract:
      "Benchmark 6 LLM terhadap 1.200 paragraf tesis berbahasa Indonesia. Metrik: kesesuaian EYD, retensi makna, originalitas (Turnitin proxy). LLM open-weights mendekati closed-source untuk teks ekspositori.",
    keywords: ["LLM", "bahasa Indonesia", "akademik", "benchmark"],
  },
  {
    id: "pub-5",
    slug: "konferensi-icic-2024",
    title: "Adipiscing elit: Sistem rekomendasi sitasi berbasis graph attention",
    authors: "Wibowo H., Putri R.",
    year: 2024,
    venue: "Proc. ICIC 2024",
    type: "conference",
    doi: "10.1109/icic.2024.10455",
    pages: "1102-1109",
    pdfHref: "#",
    abstract:
      "Model GAT untuk merekomendasikan sitasi relevan dari knowledge-base personal peneliti. F1@10 = 0.71 pada dataset 8.400 paper, mengungguli BM25 (+12 pts) dan SciBERT (+4 pts).",
    keywords: ["citation recommendation", "graph attention", "scholarly NLP"],
  },
  {
    id: "pub-6",
    slug: "laporan-kebijakan-sains-id-2025",
    title: "Eiusmod tempor: Pemetaan ekosistem riset terbuka di kampus Indonesia",
    authors: "Tim Kebijakan Sains Terbuka",
    year: 2025,
    venue: "Riset Kit Policy Brief 03",
    type: "report",
    doi: "10.99999/riset.brief.03",
    pdfHref: "#",
    abstract:
      "Survei 64 kampus tentang kebijakan repositori institusional, preprint, dan data sharing. Hanya 18% punya policy formal; 51% bergantung pada inisiatif individual dosen.",
    keywords: ["open science", "kebijakan", "repositori", "data sharing"],
  },
];

/** Extra public citations (selain SEED_CITATIONS workspace) — ditampilkan
 *  di CitationsPage publik supaya direktori tidak kelihatan kosong saat
 *  workspace store masih default-fresh. */
export const SEED_PUBLIC_CITATIONS_EXTRA = [
  {
    id: "pcit-1",
    bibKey: "nugroho2026",
    style: "APA" as const,
    rendered:
      "Nugroho, D., Lestari, M., & Ramadhan, F. (2026). Consectetur: Evaluasi LLM untuk parafrase teks akademik bahasa Indonesia. arXiv:2601.04421.",
    addedAt: day(2),
  },
  {
    id: "pcit-2",
    bibKey: "wibowo2024",
    style: "IEEE" as const,
    rendered:
      "H. Wibowo and R. Putri, \"Adipiscing elit: Sistem rekomendasi sitasi berbasis graph attention,\" in Proc. ICIC, 2024, pp. 1102-1109.",
    addedAt: day(5),
  },
  {
    id: "pcit-3",
    bibKey: "openscience2025",
    style: "BibTeX" as const,
    rendered:
      "@techreport{openscience2025, author={Tim Kebijakan Sains Terbuka}, title={Pemetaan ekosistem riset terbuka di kampus Indonesia}, institution={Riset Kit}, year={2025}, number={Policy Brief 03}}",
    addedAt: day(11),
  },
];
