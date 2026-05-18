// Kreator Studio — domain types.

export type Channel = "instagram" | "tiktok" | "youtube" | "twitter" | "newsletter" | "linkedin";
export type ContentStatus = "idea" | "draft" | "scheduled" | "published";

export type ContentItem = {
  id: string;
  title: string;
  channel: Channel;
  status: ContentStatus;
  hook: string;
  body: string;
  scheduledAt: number;
  views: number;
  likes: number;
};

export type VoiceProfile = {
  id: string;
  name: string;
  description: string;
  doExamples: string[];
  dontExamples: string[];
  tone: string; // "energetic, friendly"
  trainedAt: number;
};

export type Script = {
  id: string;
  title: string;
  channel: Channel;
  durationSec: number;
  hook: string;
  beats: string[];
  cta: string;
  updatedAt: number;
};

export type Carousel = {
  id: string;
  title: string;
  slides: { heading: string; body: string }[];
  channel: Channel;
  updatedAt: number;
};

export type Asset = {
  id: string;
  title: string;
  kind: "photo" | "video" | "audio" | "graphic";
  url: string;
  fileLabel: string;
  uploadedAt: number;
};

export type NewsletterIssue = {
  id: string;
  subject: string;
  preview: string;
  status: "draft" | "scheduled" | "sent";
  scheduledAt: number;
  recipients: number;
  openRate: number;
};

export type PerformanceMetric = {
  id: string;
  channel: Channel;
  period: string; // "Jan 2026"
  views: number;
  followers: number;
  engagementRate: number;
};

export type CommentDraft = {
  id: string;
  channel: Channel;
  postRef: string;
  comment: string;
  reply: string;
  status: "draft" | "sent";
  ts: number;
};

export type State = {
  contents: ContentItem[];
  voices: VoiceProfile[];
  scripts: Script[];
  carousels: Carousel[];
  assets: Asset[];
  newsletters: NewsletterIssue[];
  performance: PerformanceMetric[];
  commentDrafts: CommentDraft[];
  /** O-wave: public pages CRUD slice. */
  pages: import("@/components/templates/_shared/pages/types").PageEntry[];
};

export type Action =
  | import("@/components/templates/_shared/pages/types").PagesAction
  | { type: "content.upsert"; item: ContentItem }
  | { type: "content.delete"; id: string }
  | { type: "voice.upsert"; voice: VoiceProfile }
  | { type: "voice.delete"; id: string }
  | { type: "script.upsert"; script: Script }
  | { type: "script.delete"; id: string }
  | { type: "carousel.upsert"; carousel: Carousel }
  | { type: "carousel.delete"; id: string }
  | { type: "asset.upsert"; asset: Asset }
  | { type: "asset.delete"; id: string }
  | { type: "newsletter.upsert"; issue: NewsletterIssue }
  | { type: "newsletter.delete"; id: string }
  | { type: "performance.upsert"; metric: PerformanceMetric }
  | { type: "performance.delete"; id: string }
  | { type: "comment.upsert"; draft: CommentDraft }
  | { type: "comment.delete"; id: string }
  | { type: "hydrate"; state: State }
  | { type: "reset" };
