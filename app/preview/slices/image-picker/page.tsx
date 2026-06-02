"use client";

import * as React from "react";
import {
  ImageBanner, ImagePickerButton, parseImage, imageRef, unsplashSearchVia,
  type ImageValue,
} from "@/features/image-picker";
import {
  FilesAdapterProvider, useLocalStorageFilesAdapter,
  useFileUpload, useFileUrl, parseFileRef,
} from "@/features/files";

const searchUnsplash = unsplashSearchVia("/api/unsplash");

const INITIAL: ImageValue = {
  type: "gradient",
  value: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 55%,#a855f7 100%)",
  positionY: 50,
};

/** image-picker preview — a "change wallpaper" card. ONE button opens the
 *  picker (gallery / upload / link / Unsplash); the banner above shows the
 *  chosen image and lets you drag to reposition or remove it. Upload persists
 *  to localStorage (files slice); live Unsplash search needs UNSPLASH_ACCESS_KEY
 *  on the /api/unsplash route — otherwise it falls back to the curated set. */
function Demo() {
  const [wallpaper, setWallpaper] = React.useState<ImageValue | null>(INITIAL);
  const { upload } = useFileUpload();
  const ref = imageRef(parseImage(wallpaper));
  const parsed = ref ? parseFileRef(ref) : null;
  const resolvedUrl = useFileUrl(parsed && parsed.kind === "storage" ? parsed.storageId : null);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {wallpaper ? (
          <ImageBanner
            image={wallpaper}
            onChange={setWallpaper}
            resolvedUrl={resolvedUrl}
            onUpload={upload}
            searchUnsplash={searchUnsplash}
            className="h-56 md:h-72"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-muted/40 text-sm text-muted-foreground md:h-72">
            No wallpaper set
          </div>
        )}
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Wallpaper</h1>
            <p className="text-sm text-muted-foreground">
              One button opens the picker — gallery, upload, paste a link, or Unsplash.
              Hover the banner to reposition or remove.
            </p>
          </div>
          <ImagePickerButton
            label="Change wallpaper"
            title="Choose a wallpaper"
            onChange={setWallpaper}
            onUpload={upload}
            searchUnsplash={searchUnsplash}
            variant="default"
            size="default"
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const adapter = useLocalStorageFilesAdapter();
  return (
    <FilesAdapterProvider adapter={adapter}>
      <main className="min-h-screen bg-background px-4">
        <Demo />
      </main>
    </FilesAdapterProvider>
  );
}
