// Konsultan OS — domain types.

export type ClientStatus = "lead" | "active" | "completed";

export type Client = {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  city: string;
  status: ClientStatus;
  createdAt: number;
};

export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";

export type Proposal = {
  id: string;
  clientId: string;
  title: string;
  scope: string;
  valueLabel: string; // "Rp 80jt"
  durationLabel: string; // "3 bulan"
  status: ProposalStatus;
  createdAt: number;
};

export type ContractStatus = "draft" | "signed" | "expired";

export type Contract = {
  id: string;
  proposalId: string;
  clientId: string;
  title: string;
  termsSummary: string;
  status: ContractStatus;
  signedAt: number;
  endsAt: number;
};

export type ProjectStatus = "kickoff" | "in-progress" | "review" | "delivered";

export type Project = {
  id: string;
  contractId: string;
  clientId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  startedAt: number;
  endsAt: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type Invoice = {
  id: string;
  projectId: string;
  clientId: string;
  number: string; // "INV-2026-001"
  amountLabel: string;
  ppnLabel: string; // "Rp 8.8jt (11%)"
  totalLabel: string;
  status: InvoiceStatus;
  dueAt: number;
  issuedAt: number;
};

export type ConsultDoc = {
  id: string;
  projectId: string;
  title: string;
  kind: "deliverable" | "memo" | "minutes" | "report";
  status: "draft" | "shared";
  updatedAt: number;
};

// AZ-wave types (CalendarEvent, KbArticle, AnalyticsKpi, FaqItem) live in
// ./types-az.ts to keep this file under the 200-LOC cap. Re-exported below.
export type {
  CalendarEvent,
  CalendarEventKind,
  KbArticle,
  KbCategory,
  KbStatus,
  AnalyticsKpi,
  FaqCategory,
  FaqItem,
} from "./types-az";
import type { CalendarEvent, KbArticle } from "./types-az";

/** Public-only seeds. Not in CRUD state — read directly from `public-seed.ts`. */
export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  priceLabel: string;
  durationLabel: string;
  bullets: string[];
  outcomes: string[];
  featured?: boolean;
  accent: "violet" | "amber" | "emerald" | "rose";
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedAt: number;
  readMinutes: number;
  tag: "Strategi" | "Operasi" | "Organisasi" | "Industri";
  /** Body as paragraph array — keeps file size small, no MDX needed. */
  body: string[];
};

export type TeamMember = {
  id: string;
  slug: string;
  name: string;
  role: string;
  city: string;
  initials: string;
  bio: string;
  expertise: string[];
  yearsExp: number;
  linkedinUrl?: string;
};

export type State = {
  clients: Client[];
  proposals: Proposal[];
  contracts: Contract[];
  projects: Project[];
  invoices: Invoice[];
  documents: ConsultDoc[];
  /** AZ-wave: admin calendar — client sessions + deadlines. */
  calendarEvents: CalendarEvent[];
  /** AZ-wave: internal knowledge base / playbook articles. */
  kbArticles: KbArticle[];
  /** O-wave: public pages CRUD slice. */
  pages: import("@/components/templates/_shared/pages/types").PageEntry[];
  /** AB-wave: home-page section composition. Ordered + toggleable. */
  landingSections: import("@/components/templates/_shared/landing/types").LandingSection[];
};

export type LandingSection = import("@/components/templates/_shared/landing/types").LandingSection;
export type LandingSectionKind = import("@/components/templates/_shared/landing/types").LandingSectionKind;
export type LandingAction = import("@/components/templates/_shared/landing/types").LandingAction;

export type Action =
  | import("@/components/templates/_shared/pages/types").PagesAction
  | LandingAction
  | { type: "client.upsert"; client: Client }
  | { type: "client.delete"; id: string }
  | { type: "proposal.upsert"; proposal: Proposal }
  | { type: "proposal.delete"; id: string }
  | { type: "contract.upsert"; contract: Contract }
  | { type: "contract.delete"; id: string }
  | { type: "project.upsert"; project: Project }
  | { type: "project.delete"; id: string }
  | { type: "invoice.upsert"; invoice: Invoice }
  | { type: "invoice.delete"; id: string }
  | { type: "document.upsert"; doc: ConsultDoc }
  | { type: "document.delete"; id: string }
  | { type: "calendar.upsert"; event: CalendarEvent }
  | { type: "calendar.delete"; id: string }
  | { type: "kb.upsert"; article: KbArticle }
  | { type: "kb.delete"; id: string }
  | { type: "hydrate"; state: State }
  | { type: "reset" };
