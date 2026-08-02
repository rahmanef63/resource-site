"use client";

import { forwardRef } from "react";
import { FilePicker, type FilePickerHandle } from "@/shared/ui/FilePicker";
import type { UploadFile } from "../adapter";

// Hidden file picker → binary-safe {relPath, file} batch. `directory` renders a
// folder picker (webkitdirectory), where relPath = the file's path within the
// chosen folder. The parent triggers it via ref.current.open().
export const UploadInput = forwardRef<
  FilePickerHandle,
  { onFiles: (files: UploadFile[]) => void; directory?: boolean }
>(function UploadInput({ onFiles, directory }, ref) {
  return (
    <FilePicker
      ref={ref}
      multiple
      directory={directory}
      onFiles={(picked) =>
        onFiles(picked.map((file) => ({ relPath: file.webkitRelativePath || file.name, file })))
      }
    />
  );
});
