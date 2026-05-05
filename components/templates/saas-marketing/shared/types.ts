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
};

export type ChangelogEntry = {
  id: string;
  version: string;
  date: number;
  kind: "feature" | "fix" | "chore";
  title: string;
  body: string;
};

export type State = {
  pricing: PricingTier[];
  features: FeatureItem[];
  posts: BlogPost[];
  changelog: ChangelogEntry[];
};

export type Action =
  | { type: "hydrate"; state: State }
  | { type: "reset" };
