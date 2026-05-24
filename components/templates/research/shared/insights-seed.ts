// Riset Kit — public insights seed (short research-blog essays).
// Berbeda dari Publications (paper formal): Insights = catatan singkat
// metodologi, tool review, dan field notes.

import type { Insight } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_INSIGHTS: Insight[] = [
  {
    id: "ins-1",
    slug: "memilih-software-citation-manager-2026",
    title: "Memilih citation manager: Zotero vs Mendeley vs Paperpile (2026)",
    author: "Lorem Peneliti",
    publishedAt: day(3),
    readMinutes: 7,
    category: "tool-review",
    excerpt:
      "Tiga tahun pakai bergantian. Spoiler: Zotero menang untuk peneliti Indonesia karena open-source + plugin Better BibTeX yang reliable.",
    body:
      "Zotero menang di tiga dimensi: harga (gratis selamanya), portabilitas data (SQLite lokal), dan ekosistem plugin. Paperpile bagus untuk pengguna Google Docs garis keras. Mendeley sudah ditinggalkan banyak peneliti sejak Elsevier mengubah kebijakan storage 2024.\n\nUntuk konteks Indonesia: Zotero + plugin Better BibTeX + sync via WebDAV (bukan Zotero cloud, batasnya 300MB) = workflow paling robust. Bisa share library antar device tanpa subscription.",
    tags: ["citation-manager", "zotero", "workflow"],
  },
  {
    id: "ins-2",
    slug: "thematic-analysis-vs-grounded-theory",
    title: "Thematic analysis vs grounded theory: kapan pakai yang mana?",
    author: "Lorem Peneliti",
    publishedAt: day(9),
    readMinutes: 9,
    category: "methodology",
    excerpt:
      "Pertanyaan klasik mahasiswa S2 kualitatif. Jawaban singkat: thematic analysis untuk eksplorasi tema, grounded theory kalau mau bangun teori baru.",
    body:
      "Braun & Clarke (2006) bilang thematic analysis fleksibel — bisa deduktif atau induktif. Grounded theory (Glaser & Strauss) lebih ketat: harus theoretical sampling, constant comparison, dan saturation.\n\nDalam praktik supervisor saya menolak grounded theory kalau sample < 20 informan. Untuk skripsi/tesis dengan deadline, thematic analysis lebih realistis. Grounded theory cocok untuk disertasi multi-tahun.",
    tags: ["qualitative", "methodology", "thematic-analysis"],
  },
  {
    id: "ins-3",
    slug: "field-notes-wawancara-umkm-bandung",
    title: "Field notes: 12 wawancara UMKM kuliner Bandung",
    author: "Lorem Peneliti",
    publishedAt: day(14),
    readMinutes: 6,
    category: "field-notes",
    excerpt:
      "Tiga pelajaran metodologis dari lapangan: jam wawancara penting, gadget bisa intimidating, dan transcript verbatim selalu lebih lama dari estimasi.",
    body:
      "Jam 10-11 pagi: pemilik warung paling rileks (lagi prep menu siang). Sore: terlalu sibuk pelanggan. Malam: capek, jawaban pendek-pendek.\n\nRecorder Zoom H1 mahal tapi worth it. Recorder HP suara jelek + bikin informan canggung. Notebook + pulpen tetap jadi backup utama.\n\nTranskrip: estimasi 4x durasi rekaman. 60 menit wawancara = 4 jam transkrip + tidying. 12 wawancara x 4 jam = 48 jam, ekuivalen 1.5 minggu kerja penuh.",
    tags: ["field-notes", "ethnography", "umkm"],
  },
  {
    id: "ins-4",
    slug: "menulis-literature-review-dengan-matrix",
    title: "Menulis literature review dengan matrix table: template + contoh",
    author: "Lorem Peneliti",
    publishedAt: day(21),
    readMinutes: 8,
    category: "tutorial",
    excerpt:
      "Matrix table = mind-map untuk 30+ paper. Lima kolom wajib: author-year, RQ, metode, temuan utama, gap. Sisanya optional sesuai topik.",
    body:
      "Bikin spreadsheet di Google Sheets. Header: ID | Author-Year | Research Question | Method | N (sample) | Key Findings | Limitations | Gap-to-Mine | Quote-to-Cite.\n\nBaca paper sambil isi kolom Quote-to-Cite — paste verbatim 1-2 kalimat penting. Saat draft chapter, tinggal cari di sheet by keyword. Hemat waktu re-reading.\n\nUntuk 30+ paper, pakai Notion table view sebagai gantinya. Filter & sort lebih powerful daripada Google Sheets, dan bisa link ke note panjang.",
    tags: ["literature-review", "workflow", "tutorial"],
  },
  {
    id: "ins-5",
    slug: "ai-paraphrase-bahasa-indonesia-bahaya",
    title: "AI paraphrase bahasa Indonesia: hati-hati makna geser",
    author: "Lorem Peneliti",
    publishedAt: day(28),
    readMinutes: 5,
    category: "opinion",
    excerpt:
      "Tested 6 LLM untuk parafrase kalimat akademik bahasa Indonesia. Hasil: semua menggeser makna 15-30%. Manusia masih lebih akurat.",
    body:
      "GPT-4, Claude, Gemini, dan tiga open-weights diuji parafrase 200 kalimat dari abstrak jurnal sosial. Setiap output dinilai dua expert reviewer. Skor: kesesuaian makna 70-85%, retensi terminologi 60-75%, gaya bahasa akademik 65-80%.\n\nKesimpulan: AI berguna sebagai drafting tool, bukan finalization. Selalu review manual line-by-line. Untuk konteks Turnitin: parafrase AI sering ketauan karena pola sintaksis kaku.",
    tags: ["LLM", "bahasa-indonesia", "ethics"],
  },
  {
    id: "ins-6",
    slug: "obsidian-vs-notion-untuk-riset",
    title: "Obsidian vs Notion untuk catatan riset: trade-off lokal vs cloud",
    author: "Lorem Peneliti",
    publishedAt: day(35),
    readMinutes: 7,
    category: "tool-review",
    excerpt:
      "Dua tools, dua filosofi. Obsidian: markdown lokal, offline-first, plugin gila. Notion: database cloud, kolaborasi mulus, tapi lock-in.",
    body:
      "Obsidian menang untuk solo researcher yang care soal data ownership. File .md plain text, bisa di-git, bisa di-grep, bisa di-backup ke mana saja. Plugin Dataview turns vault into queryable database.\n\nNotion menang untuk tim riset 2+ orang. Real-time collab, comments, mentions, dan database relations yang lebih native daripada plugin Obsidian. Tapi: semua data di server Notion. Export markdown ada tapi link & relation pecah.\n\nPersonal pick: Obsidian untuk thinking, Notion untuk project management.",
    tags: ["obsidian", "notion", "note-taking"],
  },
  {
    id: "ins-7",
    slug: "tips-coding-data-kualitatif-tanpa-nvivo",
    title: "Coding data kualitatif tanpa NVivo: 3 alternatif gratis",
    author: "Lorem Peneliti",
    publishedAt: day(45),
    readMinutes: 6,
    category: "tool-review",
    excerpt:
      "NVivo license 6 juta/tahun bikin mikir dua kali. Tiga alternatif tested: Taguette (open-source), Atlas.ti free tier, dan Google Docs + comments.",
    body:
      "Taguette: open-source, jalan di browser. Cocok untuk individual project, < 50 dokumen. Limitasi: code co-occurrence matrix masih basic.\n\nAtlas.ti free tier: 5 dokumen, 50 codes. Cukup untuk pilot study, tidak cukup untuk full thesis.\n\nGoogle Docs + comments: hack jadul tapi works. Highlight text, add comment dengan code name, gunakan Find untuk aggregate per code. Limitasi: tidak ada visualisasi.\n\nVerdict: Taguette untuk academic, NVivo masih dominant di industri konsultan.",
    tags: ["qualitative", "nvivo", "tools"],
  },
];
