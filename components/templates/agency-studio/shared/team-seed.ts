import type { TeamMember } from "./types";
import { PUBLIC_BASE } from "./nav-config";

export const SEED_TEAM: TeamMember[] = [
  {
    id: "tm-1",
    name: "Asti Rahmadhani",
    role: "Studio principal · strategy",
    bio: "Membangun atelier.studio sejak 2019. Sebelumnya design lead di dua agency Jakarta. Spesialisasi: positioning B2B, naming, dan governance brand system.",
    avatar: "🪐",
    initials: "AR",
    location: "Jakarta",
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "Read writing", href: `${PUBLIC_BASE}/journal?author=Asti` },
    ],
  },
  {
    id: "tm-2",
    name: "Bagas Pranoto",
    role: "Design lead · identity systems",
    bio: "Type-nerd, motion-curious. Lead untuk semua identity work — dari logo lockup hingga motion principles. Eks-team brand Tokopedia.",
    avatar: "🎨",
    initials: "BP",
    location: "Yogyakarta",
    links: [
      { label: "Dribbble", href: "#" },
      { label: "Are.na", href: "#" },
    ],
  },
  {
    id: "tm-3",
    name: "Citra Wijaya",
    role: "Strategy lead · research",
    bio: "Strategy lead untuk semua discovery sprint. Latar belakang qualitative research + service design. Memimpin proses interview dan synthesis.",
    avatar: "🧭",
    initials: "CW",
    location: "Bandung",
    links: [
      { label: "Substack", href: "#" },
    ],
  },
  {
    id: "tm-4",
    name: "Daniel Suharto",
    role: "Engineering lead · design ops",
    bio: "Menjembatani Figma ke production. Token architecture, Storybook setup, dan handoff tooling. React + Tailwind di siang hari, motion di malam hari.",
    avatar: "⚙️",
    initials: "DS",
    location: "Singapore (remote)",
    links: [
      { label: "GitHub", href: "#" },
    ],
  },
  {
    id: "tm-5",
    name: "Maya Putri",
    role: "Account director · partnerships",
    bio: "Titik kontak pertama untuk semua project baru. Menjaga scope, timeline, dan komunikasi dua arah dengan tim klien.",
    avatar: "🤝",
    initials: "MP",
    location: "Jakarta",
    links: [
      { label: "Email", href: "mailto:halo@atelier.studio" },
    ],
  },
];
