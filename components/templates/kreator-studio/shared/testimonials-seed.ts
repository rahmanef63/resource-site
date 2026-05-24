// Testimonials + featured clients — wall-of-love seed.
// Tone: creator-economy ID + EN mix, suara natural subscriber/client.

import type { FeaturedClient, Testimonial } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: "tm-1",
    author: "Mira Yulianti",
    role: "Head of Brand",
    company: "Tokopedia",
    quote:
      "Campaign 8-piece kemarin smooth banget — brief jelas, turnaround on-time, dan numbers exceed target 30%. Saya bakal balik kerja sama lagi pasti.",
    rating: 5,
    channel: "client",
    avatar: "🛍️",
    gradient: "from-emerald-500/40 via-teal-500/30 to-cyan-500/40",
    featured: true,
    receivedAt: day(8),
  },
  {
    id: "tm-2",
    author: "Bagus Pratama",
    role: "Indie hacker, newsletter reader",
    quote:
      "Newsletter ini tiap minggu jadi reading time favorit. Tone-nya jujur, kadang vulnerable, dan saya selalu dapet 1-2 idea actionable.",
    rating: 5,
    channel: "newsletter",
    avatar: "📬",
    gradient: "from-fuchsia-500/40 via-pink-500/30 to-rose-500/40",
    receivedAt: day(3),
  },
  {
    id: "tm-3",
    author: "Sarah Hidayat",
    role: "Marketing Manager",
    company: "Bibit",
    quote:
      "Worked dengan banyak creator, ini salah satu yang paling profesional. Strategy call-nya solid, ga cuma soal aesthetic tapi paham brand outcome.",
    rating: 5,
    channel: "client",
    avatar: "📊",
    gradient: "from-sky-500/40 via-blue-500/30 to-indigo-500/40",
    featured: true,
    receivedAt: day(18),
  },
  {
    id: "tm-4",
    author: "Dimas Anugrah",
    role: "Content creator, 28K followers",
    quote:
      "Workshop strategy sprint-nya unlock banyak hal — sekarang konten saya ada pilar yang jelas dan ga lagi posting random tiap minggu.",
    rating: 5,
    channel: "audience",
    avatar: "🎬",
    gradient: "from-amber-500/40 via-orange-500/30 to-red-500/40",
    receivedAt: day(25),
  },
  {
    id: "tm-5",
    author: "Putri Anggraini",
    role: "Founder",
    company: "Lokal Studio",
    quote:
      "Carousel pack-nya hands down salah satu deliverable terbaik dari freelancer mana pun. Copy + desain nyatu, brand voice kami kebawa.",
    rating: 5,
    channel: "client",
    avatar: "🎨",
    gradient: "from-violet-500/40 via-purple-500/30 to-fuchsia-500/40",
    receivedAt: day(35),
  },
  {
    id: "tm-6",
    author: "Andi Rahman",
    role: "Subscribers since issue #12",
    quote:
      "Jarang banget newsletter ID yang konsisten quality kayak gini. Worth banget subscribe — tiap issue saya save buat referensi.",
    rating: 5,
    channel: "newsletter",
    avatar: "✉️",
    gradient: "from-indigo-500/40 via-violet-500/30 to-purple-500/40",
    receivedAt: day(12),
  },
  {
    id: "tm-7",
    author: "Lina Marpaung",
    role: "Brand Lead",
    company: "GoTo",
    quote:
      "Narrative campaign yang kami collab cukup tricky karena internal+external, tapi eksekusinya rapi. Senior-level thinking di balik post yang playful.",
    rating: 5,
    channel: "client",
    avatar: "🚀",
    gradient: "from-emerald-600/40 via-green-500/30 to-lime-500/40",
    receivedAt: day(45),
  },
  {
    id: "tm-8",
    author: "Reza Kurniawan",
    role: "Aspiring creator",
    quote:
      "Saya follow dari 5K followers. Yang bikin stay: konsistensi tone + transparansi soal angka & lesson. Itu rare di scene lokal.",
    rating: 5,
    channel: "instagram",
    avatar: "📱",
    gradient: "from-rose-500/40 via-pink-500/30 to-fuchsia-500/40",
    receivedAt: day(20),
  },
  {
    id: "tm-9",
    author: "Najwa Salsabila",
    role: "Newsletter reader",
    quote:
      "Issue tentang 'kenapa saya stop posting harian' relate banget. Saya apply lesson-nya dan engagement saya naik 2x bulan ini. Makasih.",
    rating: 5,
    channel: "newsletter",
    avatar: "💭",
    gradient: "from-teal-500/40 via-cyan-500/30 to-sky-500/40",
    receivedAt: day(6),
  },
  {
    id: "tm-10",
    author: "Faisal Achmad",
    role: "Senior Producer",
    company: "Vidio",
    quote:
      "Production day-nya organized, kru on-point, output siap publish dalam 1 minggu. Estimasi kasar mereka delivered 110%.",
    rating: 5,
    channel: "client",
    avatar: "🎥",
    gradient: "from-orange-500/40 via-amber-500/30 to-yellow-500/40",
    receivedAt: day(55),
  },
];

export const SEED_FEATURED_CLIENTS: FeaturedClient[] = [
  { id: "fc-1", name: "Tokopedia", initial: "T", gradient: "from-emerald-500/30 to-teal-500/30" },
  { id: "fc-2", name: "Bibit",     initial: "B", gradient: "from-sky-500/30 to-blue-500/30" },
  { id: "fc-3", name: "GoTo",      initial: "G", gradient: "from-green-500/30 to-lime-500/30" },
  { id: "fc-4", name: "Vidio",     initial: "V", gradient: "from-orange-500/30 to-amber-500/30" },
  { id: "fc-5", name: "Lokal",     initial: "L", gradient: "from-violet-500/30 to-purple-500/30" },
  { id: "fc-6", name: "Niagahoster", initial: "N", gradient: "from-rose-500/30 to-pink-500/30" },
  { id: "fc-7", name: "Pijar",     initial: "P", gradient: "from-fuchsia-500/30 to-pink-500/30" },
];
