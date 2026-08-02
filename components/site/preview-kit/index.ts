/**
 * Preview-kit — composite components for the in-site live previews.
 *
 * Every export composes shadcn primitives from @/components/ui/*.
 * Do NOT reinvent UI atoms here — wrap and compose. If a pattern repeats
 * across ≥ 3 preview pages, harvest it into preview-kit instead of
 * copy-pasting per page.
 */

export * from "./preview-page";
export * from "./stat-card";
export * from "./tier-card";
export * from "./preview-faq";
export * from "./blog-card";
export * from "./chat-message";
export * from "./composer";
export * from "./model-picker";
export * from "./tool-toggle-list";
export * from "./param-slider";
export * from "./data/blog-posts";
export * from "./data/ai-fixtures";
export * from "./lib/colors";
export * from "./hooks/use-toggle-set";
export * from "./config/breakpoints";
