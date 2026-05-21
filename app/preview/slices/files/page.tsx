"use client";

import * as React from "react";
import {
  FileUploadButton,
  FileChip,
  FilesAdapterProvider,
  useLocalStorageFilesAdapter,
  type FileRef,
} from "@/features/files";

function Inner() {
  const [files, setFiles] = React.useState<FileRef[]>([]);
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center gap-4 bg-background p-6">
      <div className="space-y-1 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">files slice</p>
        <h1 className="text-2xl font-semibold">Storage-adapter demo</h1>
        <p className="text-sm text-muted-foreground">
          Upload routes through localStorage adapter. Swap to S3/Convex via FilesAdapterProvider.
        </p>
      </div>
      <FileUploadButton onUploaded={(ref) => setFiles((prev) => [...prev, ref])} multiple />
      <div className="w-full space-y-2">
        {files.map((ref, i) => (
          <FileChip key={`${ref}-${i}`} fileRef={ref} />
        ))}
        {files.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">No files yet</p>
        )}
      </div>
    </main>
  );
}

export default function Page() {
  const adapter = useLocalStorageFilesAdapter();
  return (
    <FilesAdapterProvider adapter={adapter}>
      <Inner />
    </FilesAdapterProvider>
  );
}
