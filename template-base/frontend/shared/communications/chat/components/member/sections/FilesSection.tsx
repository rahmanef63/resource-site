import { FileText } from "lucide-react";
import type { SharedFileItem } from "../types";

type FilesSectionProps = {
  isMobile: boolean;
  files?: SharedFileItem[];
  isLoading?: boolean;
};

function formatSize(size?: number) {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function FilesSection({ isMobile, files, isLoading }: FilesSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="h-14 rounded-wa-lg border border-wa-border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className={isMobile ? "py-6 text-center" : "py-8 text-center"}>
        <FileText className={isMobile ? "mx-auto h-10 w-10 text-wa-muted" : "mx-auto h-12 w-12 text-wa-muted"} />
        <p className="mt-3 text-sm text-wa-muted">No files shared yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 rounded-wa-lg border border-wa-border bg-wa-surface p-3 transition-colors hover:bg-wa-hover"
        >
          <div
            className={[
              "flex items-center justify-center rounded-wa-lg bg-primary text-primary-foreground",
              isMobile ? "h-10 w-10 text-sm" : "h-12 w-12 text-base",
            ].join(" ")}
          >
            {(file.type ?? "file").toUpperCase().slice(0, 4)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-wa-text">{file.name}</p>
            <p className="text-sm text-wa-muted">
              {[formatSize(file.size), file.type].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
