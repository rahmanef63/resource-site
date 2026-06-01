"use client";

import * as React from "react";
import {
  CoverBanner, AddCoverButton, parseCover, coverRef, unsplashSearchVia,
  type CoverData, type CoverField,
} from "@/features/cover";
import {
  FilesAdapterProvider, useLocalStorageFilesAdapter,
  useFileUpload, useFileUrl, parseFileRef,
} from "@/features/files";

const searchUnsplash = unsplashSearchVia("/api/unsplash");

const INITIAL: CoverField = {
  type: "gradient",
  value: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  positionY: 50,
};

/** cover preview — a page mock with the full cover picker wired to the files
 *  localStorage adapter (Upload tab) + the /api/unsplash proxy (Unsplash tab).
 *  Gallery + curated Unsplash work with zero config; Upload persists to
 *  localStorage; live Unsplash search needs UNSPLASH_ACCESS_KEY on the route. */
function Demo() {
  const [cover, setCover] = React.useState<CoverField>(INITIAL);
  const { upload } = useFileUpload();
  const ref = coverRef(parseCover(cover));
  const parsed = ref ? parseFileRef(ref) : null;
  const resolvedUrl = useFileUrl(parsed && parsed.kind === "storage" ? parsed.storageId : null);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {cover ? (
          <CoverBanner
            cover={cover}
            onChange={setCover}
            resolvedUrl={resolvedUrl}
            onUpload={upload}
            searchUnsplash={searchUnsplash}
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-muted/40">
            <AddCoverButton onPick={setCover} onUpload={upload} searchUnsplash={searchUnsplash} />
          </div>
        )}
        <div className="space-y-3 p-6">
          <div className="text-4xl">📄</div>
          <h1 className="text-2xl font-semibold">Page title</h1>
          <p className="text-sm text-muted-foreground">
            Hover the cover for <strong>Change · Reposition · Remove</strong>. Open the
            picker for the 4 tabs — <strong>Gallery</strong> (colours / gradients /
            textures), <strong>Upload</strong> (drag/click, stored in localStorage),{" "}
            <strong>Link</strong> (paste any image URL), and <strong>Unsplash</strong>{" "}
            (curated landscapes + live search when a key is configured).
          </p>
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
