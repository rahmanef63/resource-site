// Journal entries — separate file to keep public-seed.ts under 200 LOC cap.

import type { JournalEntry } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_JOURNAL: JournalEntry[] = [
  {
    id: "jn-1",
    slug: "kenapa-saya-stop-posting-tiap-hari",
    title: "Kenapa saya stop posting tiap hari",
    excerpt: "Setelah 18 bulan posting harian, saya berhenti. Ini analisis jujur kenapa cadence tinggi malah merusak voice.",
    body: "Setelah 18 bulan posting harian, saya berhenti.\n\nBukan karena burnout — meskipun itu juga ada. Saya stop karena sadar setiap post mulai terasa formulaic. Hook, problem, list 3, CTA. Setiap. Hari.\n\nAlgoritma memang reward konsistensi. Tapi yang lebih dia reward sebenarnya: konten yang bikin orang berhenti scroll. Dan konten yang bikin orang berhenti scroll datang dari thinking, bukan production line.\n\nSekarang saya posting 3x seminggu. Engagement naik 40%. Newsletter subscribers naik 2x. Yang lebih penting: saya enjoy proses lagi.\n\nPelajaran: cadence yang tepat itu yang sustainable, bukan yang maksimal.",
    category: "lesson",
    readMinutes: 4,
    publishedAt: day(5),
  },
  {
    id: "jn-2",
    slug: "behind-the-scene-launch-creator-os",
    title: "Behind-the-scene: launch Creator OS",
    excerpt: "Detail teknis + emotional rollercoaster launching produk pertama dengan 0 paid marketing.",
    body: "Launch hari pertama: 84 sales. Hari kedua: 12. Hari ketiga: 3.\n\nClassic launch curve. Yang tidak classic: revenue total cuma cukup buat bayar editor saya bulan itu, tidak lebih.\n\nApa yang work: bundle pre-order ke subscriber existing (40% conversion). Apa yang tidak work: cold outreach ke creator lain (0.2%).\n\nLesson: audience yang sudah ada itu compound. Audience baru itu sprint.",
    category: "behind-the-scenes",
    readMinutes: 6,
    publishedAt: day(11),
  },
  {
    id: "jn-3",
    slug: "eksperimen-90-hari-tanpa-instagram",
    title: "Eksperimen: 90 hari tanpa Instagram",
    excerpt: "Hasil tak terduga ketika saya log out IG selama 3 bulan dan fokus ke newsletter + YouTube.",
    body: "Saya log out Instagram selama 90 hari.\n\nFollowers turun 3% (expected). Newsletter subscribers naik 28% (unexpected). Tabungan waktu: ~14 jam/minggu yang tadinya buat scrolling + reply DM.\n\nYang menarik: kualitas pertanyaan dari audience naik drastis. Lewat newsletter reply, orang nulis 2-3 paragraf. Lewat DM IG, kebanyakan emoji + 'cara gimana kak?'.\n\nKesimpulan saya: platform shape conversation. Long-form medium attract long-form thinker.",
    category: "experiment",
    readMinutes: 5,
    publishedAt: day(22),
  },
  {
    id: "jn-4",
    slug: "essay-creator-economy-indonesia-2026",
    title: "Essay: Creator economy Indonesia 2026",
    excerpt: "Observasi pasar setelah 3 tahun full-time — kemana arah creator economy lokal akan bergerak.",
    body: "Tiga observasi setelah 3 tahun full-time.\n\nPertama: brand budget bergeser dari celebrity ke micro-creator (10K–100K followers). Reason: trust + ROI yang lebih terukur.\n\nKedua: monetisasi langsung dari audience (newsletter berbayar, course, community) mulai out-grow ads/sponsor untuk creator tier menengah.\n\nKetiga: bahasa Indonesia jadi competitive moat. Konten English makin saturated; ID-first creator dapat market yang lebih friendly.",
    category: "essay",
    readMinutes: 8,
    publishedAt: day(40),
  },
  {
    id: "jn-5",
    slug: "lesson-saying-no-ke-brief-jelek",
    title: "Lesson: saying no ke brief jelek",
    excerpt: "Tiga campaign yang saya tolak dan kenapa. Trade-off antara pendapatan jangka pendek vs reputasi.",
    body: "Saya nolak brief total Rp 180jt tahun ini.\n\nKenapa: tiga campaign — semuanya brand bagus, fee oke, tapi creative direction yang mereka inginkan tidak align dengan voice saya.\n\nDulu saya akan ambil. Sekarang saya tahu: satu campaign yang feels off di feed bisa cost lebih banyak (trust audiens, momentum) dibanding fee yang masuk.\n\nThumb rule saya: kalau saya tidak akan post organic, saya tidak post sponsored.",
    category: "lesson",
    readMinutes: 3,
    publishedAt: day(55),
  },
];
