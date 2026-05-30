import type { LibraryCopy, KindLabelMap } from "./types";

export const DEFAULT_KIND_LABELS: KindLabelMap = {
  prompt: "Prompt",
  image: "Image",
  video: "Video",
  link: "Link",
  download: "Download",
  snippet: "Snippet",
};

export const ALL_KINDS = [
  "prompt",
  "image",
  "video",
  "link",
  "download",
  "snippet",
] as const;

export const DEFAULT_COPY: LibraryCopy = {
  eyebrow: "Library",
  title: "Prompt · Visual · Snippet · Recipe",
  body:
    "Curated resources: ready-to-use AI prompts, moodboards, automation recipes, and snippets. Every item ships with its source + license. Use, remix, attribute back.",
  allLabel: "All",
  toolLabel: "Tool:",
  toolAllLabel: "all",
  emptyText: "No resources match this filter.",
  backLabel: "← Library",
  attributionHeading: "Attribution",
  sourceLabel: "Source",
  licenseLabel: "License",
  tagsLabel: "Tags",
  copyLabel: "Copy",
  copyPromptLabel: "Copy prompt",
  copyCodeLabel: "Copy code",
  copiedLabel: "Copied",
  openLinkLabel: "Open link ↗",
  downloadLabel: "Download",
  upvoteLabel: "Upvote",
};
