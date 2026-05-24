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

/** CK-2B — third-party integration registry shown on /admin/integrations. */
export type IntegrationStatus = "connected" | "disconnected" | "error";
export type IntegrationProvider =
  | "slack"
  | "linear"
  | "hubspot"
  | "resend"
  | "stripe"
  | "github"
  | "intercom"
  | "segment";
export type Integration = {
  id: string;
  provider: IntegrationProvider;
  label: string;
  status: IntegrationStatus;
  webhookUrl: string;
  scopes: string[];
  /** ms epoch — last successful sync */
  lastSyncAt: number;
  /** masked secret hint, e.g. "sk_live_…3Az9" */
  secretHint: string;
  notes?: string;
};

/** CK-2B — SaaS KPI snapshot powering /admin/analytics. Stored as a tiny
 *  fixed seed (4 weeks of weekly samples) so the view renders deterministic
 *  ASCII charts without a real warehouse. */
export type AnalyticsKpi = {
  /** week label, e.g. "W-04" (oldest) … "W-01" (current) */
  week: string;
  mrrCents: number;
  newCustomers: number;
  churnedCustomers: number;
  trials: number;
  trialsConverted: number;
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
  /** AB-wave: home-page section composition. Ordered + toggleable. */
  landingSections: import("@/components/templates/_shared/landing/types").LandingSection[];
  /** CK-2B — third-party integrations registry. */
  integrations: Integration[];
  /** CK-2B — last 4 weekly KPI samples for analytics view. */
  analytics: AnalyticsKpi[];
};

export type LandingSection = import("@/components/templates/_shared/landing/types").LandingSection;
export type LandingSectionKind = import("@/components/templates/_shared/landing/types").LandingSectionKind;

export type PostsAction =
  | { type: "POST_CREATE"; payload: BlogPost }
  | { type: "POST_UPDATE"; payload: { id: string; patch: Partial<Omit<BlogPost, "id">> } }
  | { type: "POST_DELETE"; payload: { id: string } };

export type CustomerAction =
  | { type: "CUSTOMER_UPSERT"; payload: Customer }
  | { type: "CUSTOMER_DELETE"; payload: { id: string } };

export type SubscriptionAction =
  | { type: "SUBSCRIPTION_UPSERT"; payload: Subscription }
  | { type: "SUBSCRIPTION_DELETE"; payload: { id: string } };

export type LeadAction =
  | { type: "LEAD_UPSERT"; payload: Lead }
  | { type: "LEAD_DELETE"; payload: { id: string } };

export type ChangelogAction =
  | { type: "CHANGELOG_UPSERT"; payload: ChangelogEntry }
  | { type: "CHANGELOG_DELETE"; payload: { id: string } };

export type PricingAction =
  | { type: "PRICING_UPSERT"; payload: PricingTier }
  | { type: "PRICING_DELETE"; payload: { id: string } };

export type FeatureAction =
  | { type: "FEATURE_UPSERT"; payload: FeatureItem }
  | { type: "FEATURE_DELETE"; payload: { id: string } };

export type IntegrationAction =
  | { type: "INTEGRATION_UPSERT"; payload: Integration }
  | { type: "INTEGRATION_DELETE"; payload: { id: string } };

export type LandingAction = import("@/components/templates/_shared/landing/types").LandingAction;

export type Action =
  | { type: "hydrate"; state: State }
  | { type: "reset" }
  | PostsAction
  | CustomerAction
  | SubscriptionAction
  | LeadAction
  | ChangelogAction
  | PricingAction
  | FeatureAction
  | IntegrationAction
  | LandingAction
  | import("@/components/templates/_shared/pages/types").PagesAction;
