import type { Lead } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_LEADS: Lead[] = [
  { id: "lead-1", name: "Rina Halim",  company: "Halim Furniture", email: "rina@halim.example", topic: "Visual identity refresh",     source: "Contact form",   budget: "Rp 80–120jt", status: "new",       ts: now - 2 * 60 * 60 * 1000 },
  { id: "lead-2", name: "Bayu A.",     company: "PT Sumber Tani",  email: "bayu@stani.example", topic: "Brand strategy + naming",     source: "Service: Brand Strategy", budget: "Rp 65jt",    status: "contacted", ts: day(2) },
  { id: "lead-3", name: "Cinta M.",    company: "Cinta & Co",      email: "cinta@cintaco.example", topic: "Web launch site",          source: "Referral",       budget: "Rp 40–60jt",  status: "qualified", ts: day(5) },
  { id: "lead-4", name: "Tom P.",      company: "Tomo Tools",      email: "tom@tomotools.example", topic: "Design system audit",      source: "Service: Design System", budget: ">Rp 200jt",  status: "won",       ts: day(12) },
];
