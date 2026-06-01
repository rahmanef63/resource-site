"use client";

/** Template glue between the `cover` slice and the `files` slice. The cover
 *  slice is backend-agnostic (props-driven); here at the composition layer we
 *  wire its upload to the files localStorage adapter, resolve upload FileRefs
 *  to display URLs, and point Unsplash search at the /api/unsplash proxy. */

import {
  CoverBanner, CoverPicker, parseCover, coverRef, unsplashSearchVia,
  type CoverData, type CoverField,
} from "@/features/cover";
import { useFileUpload, useFileUrl, parseFileRef } from "@/features/files";

const searchUnsplash = unsplashSearchVia("/api/unsplash");

/** Resolve an upload (FileRef) cover to a display URL; null for non-uploads. */
function useResolvedCover(cover: CoverField): string | null {
  const ref = coverRef(parseCover(cover));
  const parsed = ref ? parseFileRef(ref) : null;
  const storageId = parsed && parsed.kind === "storage" ? parsed.storageId : null;
  return useFileUrl(storageId);
}

/** The cover band — render as NotionPage's `coverSlot`. */
export function CoverArea({
  cover, onChange,
}: { cover: CoverField; onChange: (c: CoverData | null) => void }) {
  const { upload } = useFileUpload();
  const resolvedUrl = useResolvedCover(cover);
  return (
    <CoverBanner
      cover={cover}
      onChange={onChange}
      resolvedUrl={resolvedUrl}
      onUpload={upload}
      searchUnsplash={searchUnsplash}
    />
  );
}

/** The "Add cover" picker (no-cover state — opened from the page menu). */
export function AddCoverPicker({
  open, onOpenChange, onPick,
}: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (c: CoverData) => void }) {
  const { upload } = useFileUpload();
  return (
    <CoverPicker
      open={open}
      onOpenChange={onOpenChange}
      onPick={onPick}
      onUpload={upload}
      searchUnsplash={searchUnsplash}
    />
  );
}
