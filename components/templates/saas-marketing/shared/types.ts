export type PricingTier = {
  id: string;
  name: string;
  price: string;
  period: string;
  blurb: string;
  bullets: string[];
  cta: { label: string; href: string };
  featured: boolean;
};

export type FeatureItem = {
  id: string;
  title: string;
  blurb: string;
  icon: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: number;
  tags: string[];
  /** admin-only: workflow status. Optional for backward compat. */
  status?: "draft" | "scheduled" | "published";
};

export type ChangelogEntry = {
  id: string;
  version: string;
  date: number;
  kind: "feature" | "fix" | "chore";
  title: string;
  body: string;
};

export type CustomerStatus = "trial" | "active" | "churned";
export type Customer = {
  id: string;
  email: string;
  name: string;
  plan: "free" | "team" | "scale";
  status: CustomerStatus;
  startedAt: number;
};

export type SubStatus = "active" | "trialing" | "past_due" | "canceled";
export type Subscription = {
  id: string;
  customerId: string;
  customerEmail: string;
  plan: "team" | "scale";
  mrrCents: number;
  status: SubStatus;
  renewsAt: number;
};

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
export type Lead = {
  id: string;
  email: string;
  name: string;
  source: "website" | "referral" | "ad" | "event";
  status: LeadStatus;
  ts: number;
};

export type State = {
  pricing: PricingTier[];
  features: FeatureItem[];
  posts: BlogPost[];
  changelog: ChangelogEntry[];
  customers: Customer[];
  subscriptions: Subscription[];
  leads: Lead[];
  /** alias for changelog from the admin nav perspective */
  changelogEntries: ChangelogEntry[];
  /** O-wave: public pages CRUD slice. */
  pages: import("@/components/templates/_shared/pages/types").PageEntry[];
};

export type Action =
  | { type: "hydrate"; state: State }
  | { type: "reset" }
  | import("@/components/templates/_shared/pages/types").PagesAction;
