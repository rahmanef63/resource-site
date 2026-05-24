// AZ-wave: public FAQ — categorized (Umum, Pricing, Proses, Engagement).
// Static seed — not part of CRUD state. Read directly inside FaqPage.

import type { FaqItem } from "./types";

export const SEED_FAQ: FaqItem[] = [
  // Umum
  {
    id: "faq-1",
    category: "Umum",
    question: "Apa fokus utama praktik konsultasi Anda?",
    answer:
      "Kami fokus di tiga area: strategi pertumbuhan (GTM, market entry, M&A), efisiensi operasi (lean, supply chain, manufacturing), dan desain organisasi (career ladder, reorg, comp design). Skala klien: scale-up sampai mid-cap dengan revenue Rp 50 milyar–Rp 5 triliun.",
  },
  {
    id: "faq-2",
    category: "Umum",
    question: "Industri apa saja yang pernah dikerjakan?",
    answer:
      "Mayoritas engagement di manufaktur (otomotif, FMCG, F&B), teknologi (SaaS B2B, marketplace), jasa keuangan (multifinance, fintech), dan retail/distribusi. Kami tidak menerima engagement di tobacco, gambling, atau ekstraktif tanpa pre-screening ESG.",
  },
  {
    id: "faq-3",
    category: "Umum",
    question: "Apakah bahasa kerja Indonesia atau Inggris?",
    answer:
      "Bilingual — default Bahasa Indonesia untuk klien lokal, English untuk klien dengan stakeholder regional/global. Semua deliverable bisa dipesan bilingual (tambah ~15% durasi untuk translasi-review).",
  },
  // Pricing
  {
    id: "faq-4",
    category: "Pricing",
    question: "Bagaimana model pricing engagement?",
    answer:
      "Tiga model: (1) Fixed-fee per project (paling umum, untuk scope yang jelas), (2) Retainer bulanan (untuk advisory ongoing, Rp 40jt–Rp 120jt/bulan), (3) Workshop intensif (Rp 60jt–Rp 150jt per workshop 2–5 hari, all-in untuk 1 tim).",
  },
  {
    id: "faq-5",
    category: "Pricing",
    question: "Apakah harga sudah termasuk PPN?",
    answer:
      "Harga proposal selalu pre-tax. PPN 11% ditambahkan saat invoice sesuai regulasi DJP. Kami PKP terdaftar — invoice resmi dengan e-faktur, bisa di-credit ke PPN masukan klien yang juga PKP.",
  },
  {
    id: "faq-6",
    category: "Pricing",
    question: "Term pembayaran standar bagaimana?",
    answer:
      "Project fixed-fee: split 40/30/30 (down payment, mid-milestone, deliverable final), term net-14 per termin. Retainer: invoice di awal bulan, net-7. Workshop: 100% pre-payment minimum 5 hari kerja sebelum mulai.",
  },
  {
    id: "faq-7",
    category: "Pricing",
    question: "Apa ada discovery call gratis?",
    answer:
      "Ya. Discovery call 30 menit gratis untuk semua calon klien. Tujuan: assess fit + sketsa awal opsi engagement. Tidak ada commitment dari kedua sisi. Booking via /contact.",
  },
  // Proses
  {
    id: "faq-8",
    category: "Proses",
    question: "Berapa lama dari kontak pertama sampai kick-off?",
    answer:
      "Rata-rata 2 minggu: discovery call (minggu 1), proposal kirim (3–5 hari kerja), revisi & negosiasi (3–5 hari), kontrak sign (1–2 hari), kick-off (1 minggu setelah sign). Bisa di-fast-track jadi 1 minggu kalau urgent.",
  },
  {
    id: "faq-9",
    category: "Proses",
    question: "Siapa yang akan kerja di engagement saya?",
    answer:
      "Setiap engagement punya 1 principal (titik akuntabel + presence ke C-level) + 1–3 senior associate (kerja sehari-hari). Tidak ada model 'pitch dengan partner, eksekusi dengan junior' — principal selalu hands-on di analisis kunci.",
  },
  {
    id: "faq-10",
    category: "Proses",
    question: "Bagaimana laporan progress dilakukan?",
    answer:
      "Weekly memo singkat (1 halaman, async via email/WA) + bi-weekly steering committee 60 menit dengan executive sponsor. Final deliverable selalu di-walk-through live dengan tim klien, tidak di-drop file lalu hilang.",
  },
  {
    id: "faq-11",
    category: "Proses",
    question: "Bagaimana kalau scope berubah di tengah jalan?",
    answer:
      "Scope creep dihandle via Change Request (CR) tertulis singkat — kami estimate impact ke timeline & fee, klien approve sebelum kerja lanjut. Untuk perubahan kecil (<10% effort), biasanya kami absorb tanpa CR formal.",
  },
  // Engagement
  {
    id: "faq-12",
    category: "Engagement",
    question: "Apakah Anda menandatangani NDA?",
    answer:
      "Ya, NDA standar mutual disediakan sebelum discovery call kalau diminta. Kami juga punya template NDA bilingual (ID/EN) yang biasanya bisa diterima compliance klien tanpa revisi besar. Sharing template via email.",
  },
  {
    id: "faq-13",
    category: "Engagement",
    question: "Boleh meminta klien existing sebagai referensi?",
    answer:
      "Bisa — kami minta izin ke klien existing dulu. Beberapa klien (terutama yang publik / scale-up well-known) bersedia di-quoted. Untuk industri sensitif kami biasanya share case study anonim atau referensi by-phone, bukan tertulis.",
  },
  {
    id: "faq-14",
    category: "Engagement",
    question: "Apakah engagement bisa di-pause atau dihentikan?",
    answer:
      "Bisa. Termination clause: notice 14 hari kerja dari salah satu pihak. Fee yang dibayar untuk milestone yang sudah selesai tidak refundable; milestone yang belum mulai di-refund 100%. Tidak ada penalty.",
  },
  {
    id: "faq-15",
    category: "Engagement",
    question: "Bagaimana hak intelektual deliverable diatur?",
    answer:
      "Deliverable spesifik untuk klien (analisis, rekomendasi, slide) jadi milik klien penuh setelah fee dilunasi. Tools & framework underlying (template kami, model proprietary) tetap milik kami — klien dapat license non-exclusive untuk pakai internal.",
  },
];
