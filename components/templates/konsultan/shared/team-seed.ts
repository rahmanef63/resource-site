// Konsultan OS — team seed (public-only).

import type { TeamMember } from "./types";

export const SEED_TEAM: TeamMember[] = [
  {
    id: "tm-lorem",
    slug: "lorem-konsultan",
    name: "Lorem Konsultan",
    role: "Principal Consultant & Founder",
    city: "Jakarta",
    initials: "LK",
    yearsExp: 18,
    expertise: ["Corporate Strategy", "M&A Integration", "Board Advisory"],
    bio: "Lorem memimpin engagement strategis untuk klien tier-1 di sektor consumer, finance, dan healthcare. Sebelum mendirikan Konsultan OS, ia menghabiskan 12 tahun di tier-1 strategy firm di Singapura dan Jakarta.",
  },
  {
    id: "tm-sari",
    slug: "sari-widyaningsih",
    name: "Sari Widyaningsih",
    role: "Senior Manager",
    city: "Jakarta",
    initials: "SW",
    yearsExp: 11,
    expertise: ["Organization Design", "Leadership Development", "Change Management"],
    bio: "Sari mendampingi tim leadership dalam transformasi organisasi pasca-merger dan ekspansi regional. Latar belakang industrial-organizational psychology dari Universitas Indonesia dan certified executive coach (ICF PCC).",
  },
  {
    id: "tm-bagas",
    slug: "bagas-hermawan",
    name: "Bagas Hermawan",
    role: "Operations Director",
    city: "Surabaya",
    initials: "BH",
    yearsExp: 14,
    expertise: ["Manufacturing Excellence", "Supply Chain", "Lean Six Sigma"],
    bio: "Bagas memimpin praktik operasi dengan fokus pada manufaktur dan supply chain. Sebelumnya plant director di multinasional FMCG, dan certified Lean Six Sigma Black Belt.",
  },
  {
    id: "tm-rizki",
    slug: "rizki-pratama",
    name: "Rizki Pratama",
    role: "Engagement Manager",
    city: "Bandung",
    initials: "RP",
    yearsExp: 8,
    expertise: ["Digital Transformation", "Data Strategy", "Product Strategy"],
    bio: "Rizki memimpin engagement yang melibatkan transformasi digital dan data strategy. Background computer science ITB dan pengalaman 5 tahun di product management di scale-up regional.",
  },
];

export function findMember(slug: string): TeamMember | undefined {
  return SEED_TEAM.find((m) => m.slug === slug);
}
