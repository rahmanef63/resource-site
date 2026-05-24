// Channel + content status — primitives shared across types.ts and
// types-monetization.ts. Tiny file to avoid circular import.

export type Channel =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "newsletter"
  | "linkedin";

export type ContentStatus = "idea" | "draft" | "scheduled" | "published";
