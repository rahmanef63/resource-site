import { useCallback, useState } from "react";
import { previewKind } from "../lib/icons";
import type { FsEntry } from "../adapter";

// Route opening a previewable file (image/pdf/audio/video/text) into the
// in-explorer lightbox; anything else falls through to the host's onOpenFile.
export function usePreview(onOpenFile?: (path: string, entry: FsEntry) => void) {
  const [preview, setPreview] = useState<{ path: string; entry: FsEntry } | null>(null);
  const handleOpen = useCallback(
    (path: string, entry: FsEntry) => {
      if (previewKind(entry)) setPreview({ path, entry });
      else onOpenFile?.(path, entry);
    },
    [onOpenFile],
  );
  return { preview, handleOpen, closePreview: () => setPreview(null) };
}
