import type { FsEntry } from "../adapter";
import { iconFor, colorFor } from "../lib/icons";
import { fmtSize, joinPath } from "../lib/format";
import { cn } from "@/lib/utils";

// Info strip for the single selected entry: icon, name, size, kind, full path.
// Hidden when nothing (or more than one item) is selected.
export function FileDetails({
  entry,
  dir,
}: {
  entry: FsEntry | null;
  dir: string;
}) {
  if (!entry) return null;
  const Icon = iconFor(entry);
  const kind =
    entry.kind === "dir" ? "Folder" : (entry.ext ?? "").toUpperCase() || "File";
  return (
    <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-3 py-2">
      <Icon className={cn("size-6 shrink-0", colorFor(entry))} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-medium">{entry.name}</span>
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          {joinPath(dir, entry.name)}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>{kind}</span>
        {entry.kind === "file" && (
          <span className="tabular-nums">{fmtSize(entry.size)}</span>
        )}
      </div>
    </div>
  );
}
