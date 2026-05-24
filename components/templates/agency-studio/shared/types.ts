export type ProjectStatus = "discovery" | "design" | "build" | "delivered" | "archived";

export type Project = {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  cover: string;
  blurb: string;
  brief: string;
  outcome: string;
  status: ProjectStatus;
  publishedAt: number;
  featured: boolean;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  contact: string;
  email: string;
  status: "active" | "prospect" | "alumni";
  startedAt: number;
  notes: string;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  priceLabel: string;
  duration: string;
  bullets: string[];
  featured: boolean;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: "case-study" | "essay" | "field-notes";
  author: string;
  readMinutes: number;
  publishedAt: number;
  cover?: string;
  featured?: boolean;
  /** CK-2A: emoji hero placeholder (admin editor picker). */
  heroEmoji?: string;
  /** CK-2A: tag chips. */
  tags?: string[];
  /** CK-2A: draft/published toggle for journal editor. */
  status?: "draft" | "published";
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  initials: string;
  location?: string;
  links?: { label: string; href: string }[];
};

export type ProcessStep = {
  id: string;
  index: number;
  phase: string;
  blurb: string;
  duration: string;
  deliverables: string[];
};

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  topic: string;
  source: string;
  budget?: string;
  status: LeadStatus;
  ts: number;
};

export type CommentStatus = "pending" | "approved" | "spam";

export type Comment = {
  id: string;
  postId: string;
  postTitle: string;
  author: string;
  email: string;
  body: string;
  status: CommentStatus;
  aiFlag?: "spam" | "toxic" | null;
  ts: number;
};

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type Subscriber = {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: string; // "footer" | "lead-magnet" | "journal:<slug>"
  ts: number;
};

export type NewsletterStatus = "draft" | "scheduled" | "sent";

export type NewsletterDraft = {
  id: string;
  subject: string;
  preheader: string;
  body: string;
  status: NewsletterStatus;
  sentAt: number; // 0 if not sent
  recipients: number;
  ts: number;
};

export type AiTone = "Executive" | "Friendly" | "Concise" | "Storyteller" | "Field-notes";

export type AiConfig = {
  model: string; // "claude-opus-4-7" | "gpt-4o" | "mistral-large"
  tone: AiTone;
  temperature: number; // 0..1, step 0.05
  systemPrompt: string;
  playgroundDraft: string;
  playgroundResponse: string;
};

export type ArticleStatus = "draft" | "published";

export type State = {
  projects: Project[];
  clients: Client[];
  services: Service[];
  leads: Lead[];
  /** CK-2A: journal articles CRUD (mirrors SEED_ARTICLES). */
  articles: Article[];
  /** CK-2A: moderated comments on journal posts. */
  comments: Comment[];
  /** CK-2A: newsletter subscriber list. */
  subscribers: Subscriber[];
  /** CK-2A: newsletter compose drafts. */
  newsletters: NewsletterDraft[];
  /** CK-2A: AI assistant config (model, tone, prompt, playground). */
  aiConfig: AiConfig;
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
  | { type: "project.upsert"; project: Project }
  | { type: "project.delete"; id: string }
  | { type: "client.upsert"; client: Client }
  | { type: "client.delete"; id: string }
  | { type: "service.upsert"; service: Service }
  | { type: "service.delete"; id: string }
  | { type: "lead.create"; lead: Lead }
  | { type: "lead.update"; id: string; patch: Partial<Lead> }
  | { type: "lead.delete"; id: string }
  | { type: "article.upsert"; article: Article }
  | { type: "article.delete"; id: string }
  | { type: "comment.upsert"; comment: Comment }
  | { type: "comment.moderate"; id: string; status: CommentStatus }
  | { type: "comment.delete"; id: string }
  | { type: "subscriber.upsert"; sub: Subscriber }
  | { type: "subscriber.delete"; id: string }
  | { type: "newsletter.upsert"; draft: NewsletterDraft }
  | { type: "newsletter.delete"; id: string }
  | { type: "newsletter.send"; id: string }
  | { type: "ai-config.update"; patch: Partial<AiConfig> }
  | { type: "ai-config.reset" }
  | { type: "hydrate"; state: State }
  | { type: "reset" };
