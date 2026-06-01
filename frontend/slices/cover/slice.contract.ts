/**
 * cover — portable Notion-style page cover image picker.
 *
 * Pure / props-driven · imports no sibling slice + no backend. The upload
 * backend (onUpload) and Unsplash search (searchUnsplash) are injected by the
 * host (wire to the `files` slice + a server route holding UNSPLASH_ACCESS_KEY).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "cover",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["CoverBanner", "CoverPicker", "AddCoverButton"],
    utils: ["parseCover", "isCssCover", "isImageCover", "coverRef", "coverStyle", "GALLERY_SECTIONS", "CURATED_UNSPLASH", "unsplashSearchVia"],
    hooks: [],
    types: ["CoverData", "CoverField", "CoverType", "UnsplashPhoto", "UnsplashSearchResult", "UploadFn", "UnsplashSearchFn", "CoverSourceProps"],
  },
  requires: {
    npm: [],
    shadcn: ["dialog", "button", "input"],
    env: ["UNSPLASH_ACCESS_KEY"],
    peers: [],
    routes: [],
    tables: [],
  },
});
