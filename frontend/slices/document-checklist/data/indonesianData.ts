// Default Indonesian seed list for the document checklist.
// Ported from CareerPack `shared/data/indonesianData.ts` 2026-05-15 — only the
// subset relevant to this slice is included.

import type { ChecklistItem } from "../types"

export const indonesianDocumentChecklist: Omit<ChecklistItem, "completed">[] = [
  // Dokumen Lokal
  {
    id: "doc-1",
    title: "KTP (Kartu Tanda Penduduk)",
    description: "Kartu identitas warga negara Indonesia yang masih berlaku",
    category: "local",
    subcategory: "identity",
    required: true,
  },
  {
    id: "doc-2",
    title: "NPWP (Nomor Pokok Wajib Pajak)",
    description:
      "Nomor identitas perpajakan — biasanya diurus setelah diterima kerja. Belum punya? Tidak masalah untuk fresh graduate.",
    category: "local",
    subcategory: "identity",
    required: false,
  },
  {
    id: "doc-3",
    title: "Ijazah & Transkrip Nilai",
    description: "Ijazah terakhir dan transkrip nilai akademik",
    category: "local",
    subcategory: "education",
    required: true,
  },
  {
    id: "doc-4",
    title: "SKCK (Surat Keterangan Catatan Kepolisian)",
    description: "Surat keterangan tidak pernah terlibat tindak pidana",
    category: "local",
    subcategory: "identity",
    required: true,
  },
  {
    id: "doc-5",
    title: "BPJS Kesehatan & Ketenagakerjaan",
    description:
      "Kartu BPJS aktif sebagai jaminan kesehatan dan ketenagakerjaan",
    category: "local",
    subcategory: "health",
    required: true,
  },
  {
    id: "doc-6",
    title: "Kartu Keluarga",
    description: "Dokumen keluarga yang berisi data anggota keluarga",
    category: "local",
    subcategory: "identity",
    required: true,
  },
  {
    id: "doc-7",
    title: "Akte Kelahiran",
    description: "Dokumen resmi kelahiran dari Dinas Kependudukan",
    category: "local",
    subcategory: "identity",
    required: true,
  },
  {
    id: "doc-8",
    title: "Sertifikat Kompetensi/Pelatihan",
    description: "Sertifikat pelatihan atau kursus yang relevan dengan pekerjaan",
    category: "local",
    subcategory: "professional",
    required: false,
  },
  {
    id: "doc-9",
    title: "Surat Pengalaman Kerja",
    description:
      "Surat referensi atau pengalaman kerja dari perusahaan sebelumnya",
    category: "local",
    subcategory: "professional",
    required: false,
  },
  // Dokumen Internasional
  {
    id: "doc-10",
    title: "Paspor",
    description: "Paspor dengan masa berlaku minimal 6 bulan",
    category: "international",
    subcategory: "travel",
    required: true,
  },
  {
    id: "doc-11",
    title: "Sertifikat IELTS/TOEFL",
    description: "Sertifikat kemampuan bahasa Inggris yang masih berlaku",
    category: "international",
    subcategory: "professional",
    required: true,
  },
  {
    id: "doc-12",
    title: "Visa Kerja",
    description: "Visa pekerjaan untuk negara tujuan",
    category: "international",
    subcategory: "travel",
    required: true,
  },
  {
    id: "doc-13",
    title: "Medical Check-up",
    description: "Surat keterangan sehat dari rumah sakit yang diakui",
    category: "international",
    subcategory: "health",
    required: true,
  },
  {
    id: "doc-14",
    title: "Riwayat Vaksinasi",
    description: "Bukti vaksinasi yang diwajibkan negara tujuan",
    category: "international",
    subcategory: "health",
    required: true,
  },
  {
    id: "doc-15",
    title: "Rekening Koran Bank",
    description: "Rekening koran 3-6 bulan terakhir sebagai bukti finansial",
    category: "international",
    subcategory: "financial",
    required: true,
  },
  {
    id: "doc-16",
    title: "Kontrak Kerja",
    description:
      "Surat penawaran atau kontrak kerja dari perusahaan di luar negeri",
    category: "international",
    subcategory: "professional",
    required: true,
  },
  {
    id: "doc-17",
    title: "Surat Rekomendasi",
    description: "Surat rekomendasi dari profesor atau atasan sebelumnya",
    category: "international",
    subcategory: "professional",
    required: false,
  },
  {
    id: "doc-18",
    title: "Dokumen Apostille",
    description: "Dokumen pendidikan yang telah dilegalisir dengan apostille",
    category: "international",
    subcategory: "education",
    required: true,
  },
]

// Category subcategory labels — Indonesian.
export const indonesianCategoryLabels: Record<string, string> = {
  identity: "Dokumen Identitas",
  education: "Pendidikan",
  professional: "Profesional",
  financial: "Keuangan",
  health: "Kesehatan",
  travel: "Perjalanan",
}
