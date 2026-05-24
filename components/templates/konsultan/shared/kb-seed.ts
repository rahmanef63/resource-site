// AZ-wave: internal knowledge base articles — practitioner playbooks.
// 7 articles seeded across 5 categories. Body kept short (3 paragraphs,
// separated by blank line for textarea round-trip).

import type { KbArticle } from "./types";

const day = (n: number) => Date.now() - n * 24 * 60 * 60 * 1000;
const para = (...p: string[]) => p.join("\n\n");

export const SEED_KB_ARTICLES: KbArticle[] = [
  {
    id: "kb-1",
    slug: "strategy-sprint-methodology",
    title: "Strategy Sprint — Metodologi 5 hari",
    category: "Strategi",
    summary:
      "Format intensif untuk validasi inisiatif strategis besar dalam satu minggu kerja. Diadaptasi dari GV Sprint untuk konteks korporat ID.",
    body: para(
      "Strategy Sprint adalah format kerja 5 hari yang dipakai untuk menjawab pertanyaan strategis kritis sebelum komitmen sumber daya besar. Tim klien (5–7 orang lintas-fungsi) full-time bersama 1–2 konsultan kami.",
      "Hari 1 framing & landscape, Hari 2 divergent ideation, Hari 3 storyboard solusi, Hari 4 prototype eksekutif (slide / financial model / mock-up), Hari 5 stress-test dengan steering committee dan keputusan go/no-go.",
      "Output: keputusan terdokumentasi + minimum viable plan (12 minggu). Jangan ditawarkan ke klien tanpa CEO/COO sponsor — sprint butuh decision-maker hadir minimum 4 dari 5 hari.",
    ),
    author: "Lorem Konsultan",
    updatedAt: day(5),
    status: "published",
  },
  {
    id: "kb-2",
    slug: "lean-ops-audit-checklist",
    title: "Lean Operations Audit — Checklist 12 area",
    category: "Operasi",
    summary:
      "Checklist baseline untuk audit operasional manufaktur. Cover 12 area dari demand planning sampai after-sales. Versi rev-7.",
    body: para(
      "Checklist ini turunan dari toolkit yang dipakai di engagement Acme, Sinar Mas, dan Indofood. 12 area: demand planning, S&OP, master scheduling, MRP, supplier mgmt, inbound logistics, plant ops, quality, maintenance, warehouse, outbound, after-sales.",
      "Setiap area punya 8–12 pertanyaan probe + 3–5 tanda red-flag. Total ~120 pertanyaan. Selesai diisi penuh dalam 2 minggu (1 plant visit per area kluster).",
      "Penting: jangan share checklist ke klien sebelum kick-off. Klien yang tahu pertanyaan akan menyiapkan jawaban skripted — kita kehilangan sinyal jujur.",
    ),
    author: "Lorem Konsultan",
    updatedAt: day(2),
    status: "published",
  },
  {
    id: "kb-3",
    slug: "ma-due-diligence-id",
    title: "M&A Due Diligence — Checklist Indonesia",
    category: "M&A",
    summary:
      "Diligence checklist yang sudah disesuaikan dengan UU PT, UU Cipta Kerja, dan praktek pajak ID. Bilingual ID/EN.",
    body: para(
      "Checklist diligence standar Big-4 sering miss konteks ID: BPJS arrears, izin lingkungan (AMDAL/UKL-UPL), tanah HGB vs SHM, dan praktek transfer pricing intra-grup. Versi kami cover semua itu.",
      "Struktur: Legal (40 item), Finance (35), Tax (28 — fokus PPh 23/26 & PPN), HR (22), Commercial (30), IT (15), ESG (18). Total 188 item, ~3 minggu untuk perusahaan medium-size.",
      "Pakai bareng template Data Room Index (lihat kb-5). Klien biasanya tidak punya data room rapi — bantu mereka set up sebelum mulai diligence formal, kalau tidak timeline molor 2–4 minggu.",
    ),
    author: "Aditya Wibowo",
    updatedAt: day(18),
    status: "published",
  },
  {
    id: "kb-4",
    slug: "org-design-career-ladder",
    title: "Org Design — Career Ladder template engineering",
    category: "Organisasi",
    summary:
      "Career ladder 7-level untuk tim engineering 10–50 orang. Format Stripe/Carta-style, diadaptasi untuk pay band rupiah.",
    body: para(
      "Career ladder mendefinisikan 7 level (Junior 1 → Staff 2) dengan 4 dimensi: Technical Craft, Scope of Influence, Communication, Leadership. Setiap sel punya behavioral indicator konkret.",
      "Pay band terlampir (rentang gaji per level, kota Jakarta/Bandung/Surabaya). Update terakhir Q1 2026 — review band Q3 ketika data Mercer keluar.",
      "Jangan publikasi ladder ke klien tanpa dorong proses calibration: minimal 2 sesi 3-jam dengan tech leads untuk re-rate semua engineer existing. Tanpa kalibrasi, ladder jadi politik, bukan tool growth.",
    ),
    author: "Sari Putri",
    updatedAt: day(12),
    status: "published",
  },
  {
    id: "kb-5",
    slug: "data-room-index-template",
    title: "Data Room Index — Template",
    category: "Template",
    summary:
      "Folder structure standar untuk virtual data room. Cocok untuk diligence M&A, fund-raising, atau audit eksternal.",
    body: para(
      "Struktur 8-folder top-level: 01 Corporate, 02 Financial, 03 Tax, 04 Legal Contracts, 05 HR & Org, 06 Commercial, 07 IT & Data, 08 ESG & Compliance. Sub-folder bernomor untuk preservasi urutan di Dropbox/Drive.",
      "Setiap folder punya README.md yang list expected documents. Klien tinggal isi — saat dokumen di-upload, README auto-update via Apps Script (tidak diship default; tanya saja ke ops).",
      "Sudah dipakai di 12 engagement. Iterasi terakhir tambah folder ESG karena bank/investor mulai minta data emisi & supplier audit.",
    ),
    author: "Lorem Konsultan",
    updatedAt: day(30),
    status: "published",
  },
  {
    id: "kb-6",
    slug: "workshop-facilitation-playbook",
    title: "Workshop Facilitation — Playbook",
    category: "Workshop",
    summary:
      "Panduan fasilitasi workshop intensif (2–5 hari). Cover agenda design, energy management, dan handling konflik eksekutif.",
    body: para(
      "Workshop konsultan beda dari training. Output yang dituju: keputusan + komitmen, bukan transfer pengetahuan. Setiap sesi harus produce artifact (canvas terisi, prioritas terurut, ownership tertulis).",
      "Rule energy management: jangan plenary >90 menit. Break-out 4–6 orang lebih produktif. Hari ke-3 selalu paling berat — siapkan ice-breaker dan ubah seating.",
      "Konflik eksekutif: jangan disolve di ruangan. Park ke 1:1 follow-up. Yang penting di workshop adalah surface, bukan resolve. Resolusi private menjaga muka semua pihak.",
    ),
    author: "Bayu Setiawan",
    updatedAt: day(8),
    status: "published",
  },
  {
    id: "kb-7",
    slug: "client-discovery-call-script",
    title: "Discovery Call — Script & probe questions",
    category: "Strategi",
    summary:
      "Script 30 menit untuk discovery call. 4 fase: rapport, situation probe, need probe, next-step framing.",
    body: para(
      "Discovery call gratis 30 menit yang ditawarkan di /services adalah filter, bukan sales pitch. Tujuan: assess fit + decide apakah lanjut proposal atau decline halus.",
      "Fase 1 rapport (3 menit), Fase 2 situation (10 menit — probe 'di mana sekarang', 'apa sudah dicoba'), Fase 3 need (10 menit — probe 'kalau ini selesai, apa berubah'), Fase 4 framing (7 menit — sketch dua-tiga opsi engagement + range pricing).",
      "Red flag yang biasa dropping deal: klien minta 'gambaran solusi' detail di call. Itu sinyal mereka cari free advice, bukan partner. Politely defer ke proposal berbayar.",
    ),
    author: "Lorem Konsultan",
    updatedAt: day(1),
    status: "draft",
  },
];
