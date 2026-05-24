import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { SEED_PAGES } from "./pages-seed";
import { SEED_JOURNAL, SEED_PACKAGES, SEED_SHOWCASE } from "./public-seed";
import { SEED_FEATURED_CLIENTS, SEED_TESTIMONIALS } from "./testimonials-seed";
import {
  SEED_MONETIZATION_MONTHS,
  SEED_MONETIZATION_SOURCES,
  SEED_PAYOUTS,
} from "./monetization-seed";

export const SEED_LANDING_SECTIONS: LandingSection[] = [
  {
    id: "ls-hero",
    order: 10,
    kind: "hero",
    title: "Newsletter & content notes untuk creator yang serius.",
    subtitle:
      "Tiap minggu — strategi konten, breakdown viral hits, dan template yang bisa kamu pakai langsung.",
    enabled: true,
    config: '{"badge":"Issue mingguan untuk creator"}',
  },
  {
    id: "ls-newsletter",
    order: 20,
    kind: "newsletter",
    title: "Subscribe newsletter",
    subtitle: "12K subscribers · 38% avg open rate · gratis selamanya.",
    enabled: true,
  },
  {
    id: "ls-features",
    order: 30,
    kind: "features",
    title: "Apa yang ada di balik newsletter ini",
    subtitle: "Workspace kreator yang sama saya pakai untuk produce content tiap minggu.",
    enabled: true,
  },
  {
    id: "ls-blog",
    order: 40,
    kind: "blog",
    title: "Issue terbaru",
    subtitle: "Klik untuk baca arsip lengkap.",
    enabled: true,
  },
  {
    id: "ls-portfolio",
    order: 50,
    kind: "portfolio",
    title: "Highlight social posts",
    subtitle: "Yang paling resonance bulan ini di IG, TikTok, dan YouTube.",
    enabled: true,
  },
];
import type {
  Asset,
  Carousel,
  CommentDraft,
  ContentItem,
  NewsletterIssue,
  PerformanceMetric,
  Script,
  State,
  VoiceProfile,
} from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;
const future = (n: number) => now + n * 24 * 60 * 60 * 1000;

export const SEED_CONTENTS: ContentItem[] = [
  {
    id: "ct-1",
    title: "5 trik produktivitas yang underrated",
    channel: "instagram",
    status: "scheduled",
    hook: "Yang nomor 3 mungkin bikin kamu kaget.",
    body: "Lorem ipsum dolor sit amet — list 5 trik produktivitas yang jarang dibahas tapi efeknya gede.",
    scheduledAt: future(2),
    views: 0,
    likes: 0,
  },
  {
    id: "ct-2",
    title: "Cara saya plan content 1 minggu dalam 1 jam",
    channel: "tiktok",
    status: "published",
    hook: "POV: kamu bisa plan seminggu cuma 1 jam.",
    body: "Step by step bikin content calendar pakai sistem batching.",
    scheduledAt: day(3),
    views: 48200,
    likes: 3140,
  },
  {
    id: "ct-3",
    title: "Why your newsletter ga grow",
    channel: "newsletter",
    status: "draft",
    hook: "Bukan karena writing kamu jelek.",
    body: "Analisis 5 alasan utama newsletter kamu stagnan dan cara fix-nya.",
    scheduledAt: 0,
    views: 0,
    likes: 0,
  },
];

export const SEED_VOICES: VoiceProfile[] = [
  {
    id: "v-1",
    name: "Casual Indonesian",
    description: "Brand voice utama — santai, relate-able, sedikit humor.",
    doExamples: [
      "Pakai 'gue/lo' kalau audiens Jakarta-centric.",
      "Mulai dengan hook pertanyaan atau POV.",
      "Pakai metafora sehari-hari.",
    ],
    dontExamples: [
      "Jangan pakai jargon corporate.",
      "Hindari kata 'sinergi', 'leverage'.",
      "Jangan terlalu formal.",
    ],
    tone: "santai, friendly, sedikit playful",
    trainedAt: day(20),
  },
  {
    id: "v-2",
    name: "Profesional EYD",
    description: "Untuk konten LinkedIn, newsletter B2B, partnership pitch.",
    doExamples: [
      "Pakai 'saya/Anda', struktur EYD.",
      "Sertakan data atau studi kasus.",
      "Tutup dengan CTA yang jelas.",
    ],
    dontExamples: ["Jangan slang.", "Hindari emoji berlebihan."],
    tone: "profesional, lugas, tepercaya",
    trainedAt: day(8),
  },
  {
    id: "v-3",
    name: "Edukatif Singkat",
    description: "Untuk reel/short — caption pendek, eduktif, snackable.",
    doExamples: ["Maks 3 kalimat.", "Bullet point.", "End dengan call-to-think."],
    dontExamples: ["Jangan story panjang.", "Hindari detail teknis."],
    tone: "padat, jelas, action-oriented",
    trainedAt: day(2),
  },
];

export const SEED_SCRIPTS: Script[] = [
  {
    id: "sc-1",
    title: "Reel — 5 trik produktivitas",
    channel: "instagram",
    durationSec: 60,
    hook: "Yang nomor 3 mungkin bikin kamu kaget.",
    beats: [
      "0-5s: Hook + gestur tunjuk kamera",
      "5-15s: Trik #1 + visual transisi",
      "15-30s: Trik #2 dan #3",
      "30-50s: Trik #4 dan #5",
      "50-60s: CTA follow + next reel",
    ],
    cta: "Follow buat tips harian.",
    updatedAt: day(1),
  },
  {
    id: "sc-2",
    title: "TikTok — content batching",
    channel: "tiktok",
    durationSec: 45,
    hook: "POV: bisa plan seminggu cuma 1 jam.",
    beats: [
      "0-3s: Hook visual",
      "3-15s: Setup masalah",
      "15-35s: Sistem batching 4-step",
      "35-45s: CTA save + share",
    ],
    cta: "Save untuk weekend planning kamu.",
    updatedAt: day(4),
  },
  {
    id: "sc-3",
    title: "YouTube — content strategy",
    channel: "youtube",
    durationSec: 480,
    hook: "Saya posting tiap hari selama 90 hari. Ini hasilnya.",
    beats: [
      "0-30s: Cold open + claim",
      "30-180s: Setup eksperimen",
      "180-360s: 3 lesson learned",
      "360-480s: CTA + outro",
    ],
    cta: "Subscribe + comment lesson #1 yang paling kamu setuju.",
    updatedAt: day(7),
  },
];

export const SEED_CAROUSELS: Carousel[] = [
  {
    id: "ca-1",
    title: "10 alat creator wajib coba",
    channel: "instagram",
    updatedAt: day(2),
    slides: [
      { heading: "10 alat creator wajib coba", body: "Swipe →" },
      { heading: "1. Notion", body: "Untuk plan content + database ide." },
      { heading: "2. CapCut", body: "Edit video mobile yang super fleksibel." },
      { heading: "3. Canva", body: "Design grafis cepat + template ID." },
      { heading: "Mana favorit kamu?", body: "Comment di bawah." },
    ],
  },
  {
    id: "ca-2",
    title: "5 mistake creator pemula",
    channel: "linkedin",
    updatedAt: day(6),
    slides: [
      { heading: "5 mistake creator pemula", body: "Yang masih kamu lakukan?" },
      { heading: "1. Posting tanpa niche", body: "Audiens bingung mau follow buat apa." },
      { heading: "2. Ga konsisten", body: "Algoritma butuh sinyal regular." },
      { heading: "3. Ga ada CTA jelas", body: "Tiap post harus ada next step." },
    ],
  },
];

export const SEED_ASSETS: Asset[] = [
  {
    id: "as-1",
    title: "B-roll office aerial",
    kind: "video",
    url: "/placeholder-video-1.mp4",
    fileLabel: "MP4 · 12 MB",
    uploadedAt: day(2),
  },
  {
    id: "as-2",
    title: "Headshot studio Jakarta 2025",
    kind: "photo",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=70",
    fileLabel: "JPG · 2.4 MB",
    uploadedAt: day(6),
  },
  {
    id: "as-3",
    title: "Logo Kreator Studio v3",
    kind: "graphic",
    url: "/placeholder-logo.png",
    fileLabel: "PNG · 80 KB",
    uploadedAt: day(14),
  },
];

export const SEED_NEWSLETTERS: NewsletterIssue[] = [
  {
    id: "nl-1",
    subject: "Issue #42 — Content Calendar Sistem Saya",
    preview: "Step by step plan 1 minggu dalam 1 jam.",
    status: "scheduled",
    scheduledAt: future(1),
    recipients: 8240,
    openRate: 0,
  },
  {
    id: "nl-2",
    subject: "Issue #41 — 5 Trik Produktivitas",
    preview: "Yang nomor 3 mungkin bikin kamu kaget.",
    status: "sent",
    scheduledAt: day(7),
    recipients: 8120,
    openRate: 38.4,
  },
  {
    id: "nl-3",
    subject: "Issue #40 — Build in Public Update",
    preview: "Apa yang berhasil + apa yang flop bulan ini.",
    status: "sent",
    scheduledAt: day(14),
    recipients: 7980,
    openRate: 41.2,
  },
];

export const SEED_PERFORMANCE: PerformanceMetric[] = [
  { id: "pf-1", channel: "instagram", period: "Mei 2026", views: 482000, followers: 84200, engagementRate: 4.8 },
  { id: "pf-2", channel: "tiktok",    period: "Mei 2026", views: 1240000, followers: 124000, engagementRate: 8.2 },
  { id: "pf-3", channel: "youtube",   period: "Mei 2026", views: 84000,  followers: 12400,  engagementRate: 6.1 },
];

export const SEED_COMMENTS: CommentDraft[] = [
  {
    id: "cm-1",
    channel: "instagram",
    postRef: "Reel — 5 trik produktivitas",
    comment: "Trik #3 bener-bener game-changer makasih!",
    reply: "Glad helpful! Yang lain juga coba ya 🙌",
    status: "draft",
    ts: now - 30 * 60 * 1000,
  },
  {
    id: "cm-2",
    channel: "tiktok",
    postRef: "Cara plan content 1 minggu",
    comment: "Pakai aplikasi apa untuk batching-nya?",
    reply: "Aku pakai Notion + Apple Calendar. Akan bikin tutorial detail di newsletter besok.",
    status: "sent",
    ts: now - 2 * 60 * 60 * 1000,
  },
];

export const SEED_STATE: State = {
  contents: SEED_CONTENTS,
  voices: SEED_VOICES,
  scripts: SEED_SCRIPTS,
  carousels: SEED_CAROUSELS,
  assets: SEED_ASSETS,
  newsletters: SEED_NEWSLETTERS,
  performance: SEED_PERFORMANCE,
  commentDrafts: SEED_COMMENTS,
  packages: SEED_PACKAGES,
  showcase: SEED_SHOWCASE,
  journal: SEED_JOURNAL,
  testimonials: SEED_TESTIMONIALS,
  featuredClients: SEED_FEATURED_CLIENTS,
  monetizationSources: SEED_MONETIZATION_SOURCES,
  monetizationMonths: SEED_MONETIZATION_MONTHS,
  payouts: SEED_PAYOUTS,
  pages: SEED_PAGES,
  landingSections: SEED_LANDING_SECTIONS,
};
