/** cover — page cover-image picker lifted from notion-page-clone, made fully
 *  portable. Gallery (colours / gradients / textures) · Upload (inject your
 *  storage via `onUpload`) · Link (paste a URL) · Unsplash (curated set + live
 *  search via injected `searchUnsplash`). Drag-to-reposition focal point.
 *  Imports no other slice + no backend — wire the upload + Unsplash adapters at
 *  the app level (e.g. the `files` slice + a server route). */

export { CoverBanner } from "./components/CoverBanner";
export { CoverPicker } from "./components/CoverPicker";
export { AddCoverButton } from "./components/AddCoverButton";

export { parseCover, isCssCover, isImageCover, coverRef } from "./lib/parseCover";
export { coverStyle } from "./lib/coverStyle";
export { GALLERY_SECTIONS } from "./lib/galleryPresets";
export { CURATED_UNSPLASH } from "./lib/unsplashCurated";
export { unsplashSearchVia } from "./lib/unsplashSearch";

export type {
  CoverData, CoverField, CoverType,
  UnsplashPhoto, UnsplashSearchResult,
  UploadFn, UnsplashSearchFn, CoverSourceProps,
} from "./types";
