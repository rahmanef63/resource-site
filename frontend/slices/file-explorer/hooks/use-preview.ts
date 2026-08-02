import { useCallback, useState } from "react";
import { previewKind } from "../lib/icons";
import type { FsEntry } from "../adapter";

type Target = { path: string; entry: FsEntry };

// In-explorer modal state: the preview lightbox (image/pdf/audio/video/text) and
// the Properties editor. `handleOpen` routes a previewable file into the
// lightbox; anything else falls through to the host's onOpenFile.
export function usePreview(onOpenFile?: (path: string, entry: FsEntry) => void) {
  const [preview, setPreview] = useState<Target | null>(null);
  const [properties, setProperties] = useState<Target | null>(null);
  const handleOpen = useCallback(
    (path: string, entry: FsEntry) => {
      if (previewKind(entry)) setPreview({ path, entry });
      else onOpenFile?.(path, entry);
    },
    [onOpenFile],
  );
  return {
    preview,
    properties,
    handleOpen,
    closePreview: () => setPreview(null),
    openProperties: (path: string, entry: FsEntry) => setProperties({ path, entry }),
    closeProperties: () => setProperties(null),
  };
}
