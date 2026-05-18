import { SEED_PAGES } from "./pages-seed";
import type { Citation, Document, LitReview, Note, State, AiReaderSession } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    title: "Lorem ipsum: A meta-analysis of cognitive load patterns",
    authors: "Pratama A., Sari R., Wijaya B.",
    year: 2024,
    fileLabel: "PDF · 24 hal",
    abstract:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Studi meta-analisis terhadap 42 paper menunjukkan pola beban kognitif konsisten lintas demografi.",
    tag: "cognitive-science",
    status: "indexed",
    uploadedAt: day(2),
    pages: 24,
    highlights: 12,
  },
  {
    id: "doc-2",
    title: "Ipsum doloremque: Riset etnografi UMKM Indonesia",
    authors: "Hartono L., Setiawan B.",
    year: 2023,
    fileLabel: "PDF · 38 hal",
    abstract:
      "Etnografi 6-bulan di 12 UMKM kuliner Bandung. Temuan: adopsi digital terhambat oleh literasi finansial, bukan akses teknologi.",
    tag: "ethnography",
    status: "reviewed",
    uploadedAt: day(8),
    pages: 38,
    highlights: 27,
  },
  {
    id: "doc-3",
    title: "Sit amet: Tinjauan kebijakan transportasi publik Jakarta",
    authors: "Maharani P., Wijaya A.",
    year: 2025,
    fileLabel: "PDF · 16 hal",
    abstract:
      "Analisis dampak ERP terhadap kongesti dan emisi. Data 2018-2024 menunjukkan korelasi negatif lemah pada koridor utama.",
    tag: "policy",
    status: "uploaded",
    uploadedAt: day(1),
    pages: 16,
    highlights: 0,
  },
];

export const SEED_NOTES: Note[] = [
  {
    id: "note-1",
    title: "Hipotesis utama tesis",
    body: "Beban kognitif berkorelasi dengan friksi onboarding. Lihat [[doc-1]] hal 8-12 untuk metode pengukuran.",
    tags: ["thesis", "hypothesis"],
    linkedDocIds: ["doc-1"],
    updatedAt: day(1),
  },
  {
    id: "note-2",
    title: "Catatan wawancara — Pak Budi",
    body: "UMKM kuliner sering bingung saat handle 3 platform sekaligus. Solusi: single dashboard. Cross-ref [[doc-2]].",
    tags: ["interview", "umkm"],
    linkedDocIds: ["doc-2"],
    updatedAt: day(4),
  },
  {
    id: "note-3",
    title: "Outline bab 2 — Tinjauan pustaka",
    body: "Struktur: (1) Definisi konsep, (2) State of the art, (3) Gap penelitian. Tarik dari lit-1.",
    tags: ["outline"],
    linkedDocIds: [],
    updatedAt: day(6),
  },
];

export const SEED_CITATIONS: Citation[] = [
  {
    id: "cit-1",
    docId: "doc-1",
    style: "APA",
    rendered:
      "Pratama, A., Sari, R., & Wijaya, B. (2024). Lorem ipsum: A meta-analysis of cognitive load patterns. Journal of Cognitive Studies, 12(3), 88-104.",
    bibKey: "pratama2024",
    addedAt: day(2),
  },
  {
    id: "cit-2",
    docId: "doc-2",
    style: "BibTeX",
    rendered:
      "@article{hartono2023, author={Hartono, L. and Setiawan, B.}, title={Ipsum doloremque: Riset etnografi UMKM Indonesia}, year={2023}, journal={Indonesian Ethnography Review}}",
    bibKey: "hartono2023",
    addedAt: day(7),
  },
  {
    id: "cit-3",
    docId: "doc-3",
    style: "Chicago",
    rendered:
      "Maharani, Putri, and Asep Wijaya. \"Sit amet: Tinjauan kebijakan transportasi publik Jakarta.\" Jakarta Policy Journal 8, no. 2 (2025): 14-29.",
    bibKey: "maharani2025",
    addedAt: day(1),
  },
];

export const SEED_LIT_REVIEWS: LitReview[] = [
  {
    id: "lit-1",
    topic: "Adopsi teknologi UMKM",
    question: "Apa faktor utama yang menghambat adopsi platform digital di UMKM kuliner Indonesia?",
    docIds: ["doc-1", "doc-2"],
    matrix: [
      {
        docId: "doc-1",
        method: "Meta-analisis kuantitatif",
        finding: "Beban kognitif > akses sebagai prediktor",
        gap: "Belum ada data dari konteks Indonesia",
      },
      {
        docId: "doc-2",
        method: "Etnografi 6-bulan",
        finding: "Literasi finansial > literasi teknologi",
        gap: "Sample terbatas Bandung saja",
      },
    ],
    updatedAt: day(3),
  },
  {
    id: "lit-2",
    topic: "Kebijakan transportasi urban",
    question: "Bagaimana efektivitas ERP di kota besar Asia Tenggara?",
    docIds: ["doc-3"],
    matrix: [
      {
        docId: "doc-3",
        method: "Analisis data sekunder",
        finding: "Korelasi negatif lemah dengan kongesti",
        gap: "Data emisi belum granular per koridor",
      },
    ],
    updatedAt: day(1),
  },
];

export const SEED_AI_SESSIONS: AiReaderSession[] = [
  {
    id: "ai-1",
    docId: "doc-1",
    question: "Apa metodologi utama yang digunakan?",
    answer:
      "Paper ini menggunakan meta-analisis terhadap 42 studi primer (2010-2023) dengan random-effects model. Lihat hal 6-9.",
    ts: day(1),
  },
  {
    id: "ai-2",
    docId: "doc-2",
    question: "Sampel responden seperti apa?",
    answer: "12 UMKM kuliner di Bandung, dipilih purposive berdasarkan omzet < Rp 50jt/bulan dan minimum 2 tahun beroperasi.",
    ts: day(7),
  },
];

export const SEED_STATE: State = {
  documents: SEED_DOCUMENTS,
  notes: SEED_NOTES,
  citations: SEED_CITATIONS,
  litReviews: SEED_LIT_REVIEWS,
  aiReaderSessions: SEED_AI_SESSIONS,
  pages: SEED_PAGES,
};
