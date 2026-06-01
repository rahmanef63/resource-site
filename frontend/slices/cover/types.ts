/** cover — page cover-image picker types. Lifted from notion-page-clone and
 *  made portable: the upload backend + Unsplash search are INJECTED as props
 *  (the slice imports no other slice + no Convex), so it drops into any app. */

export type CoverType = "color" | "gradient" | "texture" | "upload" | "link" | "unsplash";

export interface CoverData {
  type: CoverType;
  /** color/gradient → CSS value; texture/upload/link/unsplash → URL or FileRef. */
  value: string;
  /** Vertical focal point 0–100 (default 50). */
  positionY?: number;
  /** Per-type metadata. unsplash: { photographer, source, thumb, … }. */
  metadata?: Record<string, unknown>;
}

/** A cover field as stored — legacy raw string, a CoverData object, or empty. */
export type CoverField = string | CoverData | null | undefined;

export interface UnsplashPhoto {
  id: string;
  regular: string;
  thumb: string;
  full: string;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  photographerUrl: string;
  /** Click-through page (required by the Unsplash License). */
  source: string;
}

export interface UnsplashSearchResult {
  photos: UnsplashPhoto[];
  total?: number;
  error?: string;
}

/** Inject the upload backend (e.g. wire to the `files` slice). Returns the
 *  stored ref/URL to keep in the cover value. */
export type UploadFn = (file: File) => Promise<string>;

/** Inject the Unsplash searcher (e.g. a server route / Convex action). When
 *  omitted, the Unsplash tab browses the bundled curated set only. */
export type UnsplashSearchFn = (query: string, perPage?: number) => Promise<UnsplashSearchResult>;

/** Shared props threaded from the picker down to the tabs. */
export interface CoverSourceProps {
  onUpload?: UploadFn;
  searchUnsplash?: UnsplashSearchFn;
}
