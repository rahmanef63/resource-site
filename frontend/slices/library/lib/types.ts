export type LibraryKind =
  | "prompt"
  | "image"
  | "video"
  | "link"
  | "download"
  | "snippet";

// Card projection for the index grid.
export type LibraryRow = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  kind: LibraryKind;
  cover?: string;
  tools?: string[];
  tags?: string[];
  upvotes?: number;
  collectionSlug?: string;
  collectionTitle?: string;
};

// Full row for the detail view (adds per-kind payload + attribution).
export type LibraryItem = LibraryRow & {
  description?: string;
  promptText?: string;
  promptModel?: string;
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
  videoProvider?: string;
  linkUrl?: string;
  fileStorageId?: string;
  fileName?: string;
  fileSize?: number;
  snippetCode?: string;
  snippetLang?: string;
  sourceName?: string;
  sourceUrl?: string;
  license?: string;
  createdAt?: number;
};

export type KindLabelMap = Partial<Record<string, string>>;

export type LibraryCopy = {
  eyebrow: string;
  title: string;
  body?: string;
  allLabel: string;
  toolLabel: string;
  toolAllLabel: string;
  emptyText: string;
  backLabel: string;
  attributionHeading: string;
  sourceLabel: string;
  licenseLabel: string;
  tagsLabel: string;
  copyLabel: string;
  copyPromptLabel: string;
  copyCodeLabel: string;
  copiedLabel: string;
  openLinkLabel: string;
  downloadLabel: string;
  upvoteLabel: string;
};

/** Toggle upvote handler. Resolve `{ voted }` to reflect the new state.
 *  When omitted, the upvote control renders read-only (count only). */
export type UpvoteHandler = (itemId: string) => Promise<{ voted: boolean }>;

export type LibraryIndexProps = {
  items: LibraryRow[];
  copy?: Partial<LibraryCopy>;
  kindLabels?: KindLabelMap;
};

export type LibraryDetailProps = {
  item: LibraryItem;
  onUpvote?: UpvoteHandler;
  copy?: Partial<LibraryCopy>;
  kindLabels?: KindLabelMap;
};
