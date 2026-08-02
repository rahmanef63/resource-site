import { fmtGiB } from "../lib/format";
import type { Clipboard } from "../lib/types";
import type { FsUsage } from "../adapter";

// Bottom status strip: item count, selection count, storage usage, and the
// pending clipboard hint. Pure presentational — all state passed in.
export function FileStatusBar({
  itemCount,
  selectedCount,
  usage,
  clip,
}: {
  itemCount: number | null;
  selectedCount: number;
  usage: FsUsage | null;
  clip: Clipboard | null;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
      <span>{itemCount !== null ? `${itemCount} items` : "—"}</span>
      {selectedCount > 0 && <span>{selectedCount} selected</span>}
      {usage && (
        <span className="ml-auto font-mono tabular-nums">
          {fmtGiB(usage.used)} of {fmtGiB(usage.total)}
        </span>
      )}
      {clip && (
        <span className={usage ? "" : "ml-auto"}>
          {clip.names.length} {clip.mode === "cut" ? "cut" : "copied"} — ⌘V to paste
        </span>
      )}
    </div>
  );
}
