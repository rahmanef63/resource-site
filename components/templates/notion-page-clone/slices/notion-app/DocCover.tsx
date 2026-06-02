"use client";

/** Template glue between the `image-picker` slice and the `files` slice. The
 *  image-picker slice is backend-agnostic (props-driven); here at the
 *  composition layer we wire its upload to the files localStorage adapter,
 *  resolve upload FileRefs to display URLs, and point Unsplash search at the
 *  /api/unsplash proxy. The page "cover" is just an ImageBanner. */

import {
  ImageBanner, ImagePickerDialog, parseImage, imageRef, unsplashSearchVia,
  type ImageValue, type ImageField,
} from "@/features/image-picker";
import { useFileUpload, useFileUrl, parseFileRef } from "@/features/files";

const searchUnsplash = unsplashSearchVia("/api/unsplash");

/** Resolve an upload (FileRef) cover to a display URL; null for non-uploads. */
function useResolvedCover(cover: ImageField): string | null {
  const ref = imageRef(parseImage(cover));
  const parsed = ref ? parseFileRef(ref) : null;
  const storageId = parsed && parsed.kind === "storage" ? parsed.storageId : null;
  return useFileUrl(storageId);
}

/** The cover band — render as NotionPage's `coverSlot`. */
export function CoverArea({
  cover, onChange,
}: { cover: ImageField; onChange: (c: ImageValue | null) => void }) {
  const { upload } = useFileUpload();
  const resolvedUrl = useResolvedCover(cover);
  return (
    <ImageBanner
      image={cover}
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
}: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (c: ImageValue) => void }) {
  const { upload } = useFileUpload();
  return (
    <ImagePickerDialog
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onPick}
      onUpload={upload}
      searchUnsplash={searchUnsplash}
      title="Page cover"
    />
  );
}
