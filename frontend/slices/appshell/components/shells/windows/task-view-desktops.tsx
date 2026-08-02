"use client";
/* Win11 Task View's bottom desktops strip — thumbnails of the existing Spaces
   (reused as-is; no new desktop state) so Task View can preview/switch them,
   the way real Windows does below the window thumbnails. */
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SPACE_IDS, useActiveSpace, setActiveSpace } from "../../../lib/spaces";

export function TaskViewDesktops() {
  const active = useActiveSpace();
  return (
    <div className="flex items-center justify-center gap-3 px-6 pb-6 pt-3">
      {SPACE_IDS.map((n) => (
        <Button
          key={n}
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); setActiveSpace(n); }}
          className={cn(
            "h-16 w-28 flex-col gap-1 rounded-lg p-0 wp-win11 bg-cover",
            active === n ? "ring-2 ring-[var(--os-accent)]" : "ring-1 ring-white/20",
          )}
        >
          <span className="mt-auto w-full truncate rounded-b-lg bg-black/40 px-2 py-1 text-[11px] text-white">
            Desktop {n}
          </span>
        </Button>
      ))}
      <Button
        variant="ghost"
        onClick={(e) => e.stopPropagation()}
        className="h-16 w-28 flex-col gap-1 rounded-lg border border-dashed border-white/30 text-white/70 hover:text-white"
      >
        <Plus className="size-4" />
        <span className="text-[11px]">New desktop</span>
      </Button>
    </div>
  );
}
