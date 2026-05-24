import type { NewsletterDraft, Subscriber } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_SUBSCRIBERS: Subscriber[] = [
  { id: "sub-1", email: "founder@northwind.example",  status: "confirmed",   source: "footer",       ts: day(120) },
  { id: "sub-2", email: "diego@cumulus.example",      status: "confirmed",   source: "lead-magnet",  ts: day(80)  },
  { id: "sub-3", email: "maya@zenith.example",        status: "confirmed",   source: "journal:naming-sprint-two-day-format", ts: day(45) },
  { id: "sub-4", email: "anto@atlas.example",         status: "confirmed",   source: "footer",       ts: day(30) },
  { id: "sub-5", email: "sari@kira.example",          status: "pending",     source: "lead-magnet",  ts: day(7)  },
  { id: "sub-6", email: "studio@halim.example",       status: "confirmed",   source: "footer",       ts: day(20) },
  { id: "sub-7", email: "ceo@sumber-tani.example",    status: "confirmed",   source: "journal:design-system-adoption-playbook", ts: day(18) },
  { id: "sub-8", email: "ops@cintaco.example",        status: "pending",     source: "footer",       ts: day(3)  },
  { id: "sub-9", email: "founder@tomotools.example",  status: "unsubscribed",source: "lead-magnet",  ts: day(150) },
  { id: "sub-10", email: "design@nucleo.example",     status: "confirmed",   source: "footer",       ts: day(12) },
  { id: "sub-11", email: "growth@vela.example",       status: "confirmed",   source: "journal:zenith-launch-1200-preorders", ts: day(9)  },
  { id: "sub-12", email: "rahmat@kandang-studio.example", status: "pending", source: "footer",       ts: day(1)  },
];

const PREVIEW_BODY = `Halo,

Bulan ini kami mengirimkan tiga catatan singkat dari studio:

1. Naming sprint dua-hari — format workshop terkompresi yang sudah kami pakai untuk lima project terakhir.
2. Northwind enam-bulan revisit — angka adopsi setelah identitas baru diluncurkan ke 14 pasar.
3. Motion tokens + OKLch — eksperimen cross-platform yang berhasil dan yang patah.

Kalau ada yang relevan untuk roadmap tim Anda, balas email ini — kami senang diskusi.

— Asti R., Studio principal`;

export const SEED_NEWSLETTERS: NewsletterDraft[] = [
  {
    id: "nl-1",
    subject: "Studio dispatch — Mei 2026",
    preheader: "Naming sprint, OKLch motion, dan revisit klien enam-bulan.",
    body: PREVIEW_BODY,
    status: "sent",
    sentAt: day(7),
    recipients: 9,
    ts: day(8),
  },
  {
    id: "nl-2",
    subject: "Quarterly digest — Q2 2026",
    preheader: "Tiga case study + dua field-notes dari tim.",
    body: "Draft awal — perlu poles intro + sisipkan dua link case study terakhir.",
    status: "draft",
    sentAt: 0,
    recipients: 0,
    ts: day(2),
  },
  {
    id: "nl-3",
    subject: "Welcome ke Agency Studio Journal",
    preheader: "Apa yang akan Anda terima — dan kapan.",
    body: "Onboarding email untuk subscriber baru. Status: scheduled, kirim setiap H+1 setelah konfirmasi.",
    status: "scheduled",
    sentAt: 0,
    recipients: 0,
    ts: day(1),
  },
];
