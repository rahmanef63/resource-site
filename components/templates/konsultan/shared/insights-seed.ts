// Konsultan OS — insights/articles seed (public-only thought leadership).

import type { Article } from "./types";

const DAY = 86_400_000;
const NOW = 1_780_000_000_000; // stable timestamp for deterministic seed

export const SEED_ARTICLES: Article[] = [
  {
    id: "art-okr-2026",
    slug: "okr-bukan-kpi-baru",
    title: "OKR bukan KPI baru — kenapa banyak perusahaan Indonesia salah implementasi",
    excerpt:
      "OKR diadopsi karena trendy, tapi diukur seperti KPI. Hasilnya tim burnout dan target dipangkas tiap kuartal. Begini cara memperbaikinya.",
    author: "Lorem Konsultan",
    authorRole: "Principal Consultant",
    publishedAt: NOW - DAY * 3,
    readMinutes: 7,
    tag: "Organisasi",
    body: [
      "Sejak Google mempopulerkan OKR lewat buku Measure What Matters, framework ini meledak di Indonesia. Hampir tiap perusahaan menengah-besar yang kami temui sudah pernah coba — atau sedang menjalankannya sekarang.",
      "Tapi 8 dari 10 kasus yang kami audit menunjukkan masalah yang sama: OKR diperlakukan sebagai KPI dengan packaging baru. Target dipasang tinggi, lalu dievaluasi seperti penilaian kinerja tahunan. Akibatnya tim main aman, set target rendah, dan culture ambisi yang seharusnya tumbuh malah hilang.",
      "Perbedaan filosofisnya sederhana: KPI mengukur kesehatan operasional yang harus dicapai. OKR mendorong ambisi yang belum tentu tercapai — target 70% sudah dianggap sukses. Ketika dua hal ini dicampur, tim akan otomatis menurunkan ambisi karena takut dinilai gagal.",
      "Rekomendasi praktis: pisahkan dengan tegas. KPI tetap di scorecard operasional, dievaluasi tiap bulan. OKR fokus pada inisiatif transformatif kuartalan, dievaluasi dengan retrospektif — bukan penilaian.",
      "Perusahaan yang berhasil biasanya membatasi maksimal 3 OKR per tim. Lebih dari itu, fokus pecah dan tidak ada yang benar-benar tercapai. Less is more, terutama di kuartal pertama transisi.",
    ],
  },
  {
    id: "art-konsolidasi-pasca-merger",
    slug: "konsolidasi-pasca-merger-id",
    title: "Konsolidasi pasca-merger di Indonesia: tiga jebakan yang sering kami temui",
    excerpt:
      "M&A sukses bukan ditentukan saat tanda tangan, tapi 100 hari sesudahnya. Tiga jebakan paling sering dialami klien kami.",
    author: "Sari Widyaningsih",
    authorRole: "Senior Manager",
    publishedAt: NOW - DAY * 12,
    readMinutes: 9,
    tag: "Strategi",
    body: [
      "Pasar M&A Indonesia tumbuh konsisten dalam 5 tahun terakhir, terutama di sektor consumer, fintech, dan healthtech. Tapi data integrasi pasca-merger menunjukkan 60% tidak mencapai sinergi yang dijanjikan deal memo.",
      "Jebakan pertama: terlalu cepat mendorong unifikasi budaya. Tim akuisisi sering merasa identitasnya dihapus. Solusinya adalah memberi runway 6–12 bulan dengan tim integrasi netral sebelum unifikasi penuh.",
      "Jebakan kedua: sistem IT yang dipaksa migrate dalam 90 hari. Setiap kasus yang kami tangani membuktikan timeline ini menghasilkan downtime operasional dan kehilangan revenue. Plan realistis di 12–18 bulan.",
      "Jebakan ketiga: retensi key talent yang tidak dianggarkan. Top 5% performer di perusahaan akuisisi biasanya pergi dalam 18 bulan jika tidak ada retention package yang clear sejak day 30. Anggarkan 2–3% dari deal value untuk ini.",
      "Yang paling sukses dari klien kami adalah yang membentuk Integration Management Office (IMO) independen — bukan bagian dari salah satu entitas. IMO ini punya mandat eksekutif penuh selama 18 bulan.",
    ],
  },
  {
    id: "art-cost-restructure",
    slug: "cost-restructure-tanpa-phk-massal",
    title: "Restrukturisasi cost tanpa PHK massal: pengalaman 7 klien manufaktur",
    excerpt:
      "Cost cutting tidak selalu berarti PHK. Tujuh klien manufaktur kami berhasil memangkas opex 18–24% sambil mempertahankan headcount.",
    author: "Bagas Hermawan",
    authorRole: "Operations Director",
    publishedAt: NOW - DAY * 21,
    readMinutes: 6,
    tag: "Operasi",
    body: [
      "Reflex pertama saat margin tertekan adalah PHK. Ini efektif jangka pendek, tapi merusak engagement dan kapabilitas jangka panjang — terutama di pabrik dengan teknisi senior yang sulit dicari pengganti.",
      "Tujuh klien manufaktur kami di sektor F&B dan packaging mencoba pendekatan berbeda: zero-based opex review, energy efficiency audit, dan supplier renegotiation paralel. Hasilnya pemangkasan 18–24% opex tanpa PHK.",
      "Komponen terbesar biasanya datang dari kontrak supplier yang tidak pernah di-review ulang sejak ditandatangani 3–5 tahun lalu. Renegotiation berbasis benchmarking pasar bisa hemat 8–12% sendiri.",
      "Komponen kedua: energi. Audit listrik dan steam di 3 dari 7 klien kami menemukan kebocoran yang setara 4–7% total opex. Payback investasi perbaikan rata-rata 8 bulan.",
      "Komponen ketiga yang sering diabaikan: travel & entertainment plus konsumsi rapat. Bukan komponen besar, tapi simbolis — manajemen yang memangkas T&E sendiri lebih dipercaya saat meminta tim efisiensi.",
    ],
  },
  {
    id: "art-data-governance",
    slug: "data-governance-untuk-board",
    title: "Data governance untuk Board: empat pertanyaan yang harus dijawab CIO",
    excerpt:
      "Board Indonesia mulai peduli data governance — tapi tidak tahu harus tanya apa. Empat pertanyaan ini cukup untuk membuka percakapan substantif.",
    author: "Lorem Konsultan",
    authorRole: "Principal Consultant",
    publishedAt: NOW - DAY * 35,
    readMinutes: 5,
    tag: "Industri",
    body: [
      "UU PDP 2022 dan tekanan dari investor global membuat data governance naik ke agenda board. Tapi kebanyakan komisaris yang kami coach mengaku tidak tahu harus tanya apa ke CIO.",
      "Pertanyaan 1: di mana data customer kami disimpan, dan siapa yang punya akses? Jawaban yang baik adalah satu diagram sederhana, bukan dokumen 40 halaman.",
      "Pertanyaan 2: jika ada breach besok, berapa cepat kita bisa notify Kominfo dan customer? UU PDP mensyaratkan 3x24 jam. Banyak perusahaan tidak siap.",
      "Pertanyaan 3: berapa banyak third-party processor yang kita pakai, dan apakah kontrak mereka sudah PDP-compliant? Audit cepat biasanya menemukan 30–50% kontrak belum di-update.",
      "Pertanyaan 4: siapa Data Protection Officer (DPO) kita, dan kepada siapa dia lapor? DPO yang lapor ke CIO punya konflik kepentingan struktural. Best practice lapor ke board atau audit committee.",
    ],
  },
  {
    id: "art-leadership-pipeline",
    slug: "leadership-pipeline-keluarga",
    title: "Leadership pipeline di perusahaan keluarga: jangan tunggu suksesi",
    excerpt:
      "Banyak perusahaan keluarga Indonesia baru membangun pipeline kepemimpinan saat pendiri mendekati pensiun. Itu 10 tahun terlambat.",
    author: "Sari Widyaningsih",
    authorRole: "Senior Manager",
    publishedAt: NOW - DAY * 48,
    readMinutes: 8,
    tag: "Organisasi",
    body: [
      "Lebih dari 70% bisnis besar di Indonesia adalah perusahaan keluarga. Dan lebih dari 60% gagal mempertahankan dominasi pasar setelah suksesi generasi kedua ke ketiga. Penyebab paling sering: pipeline kepemimpinan tidak pernah dibangun secara sistematis.",
      "Pendiri biasanya membuat keputusan operasional sehari-hari. Ini efisien saat perusahaan kecil, tapi mencegah generasi berikutnya — baik anggota keluarga maupun profesional — mengembangkan judgment eksekutif.",
      "Solusi struktural: bentuk Executive Committee non-keluarga dengan mandat real, bukan ceremonial. Anggotanya rotasi setiap 2–3 tahun antar divisi untuk membangun perspektif lintas-fungsi.",
      "Untuk anggota keluarga generasi muda: jangan langsung ke posisi senior. Wajibkan 3–5 tahun di perusahaan lain dulu (bisa portfolio company atau industri sejenis). Pengalaman external menumbuhkan kredibilitas internal.",
      "Yang paling berhasil dari klien kami adalah keluarga yang membentuk Family Council terpisah dari board operasional. Council mengelola dinamika keluarga; board fokus pada bisnis. Pemisahan ini krusial.",
    ],
  },
];

export function findArticle(slug: string): Article | undefined {
  return SEED_ARTICLES.find((a) => a.slug === slug);
}
