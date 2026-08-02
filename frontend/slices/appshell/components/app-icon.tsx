import { cn } from "@/lib/utils";
import type { AppDescriptor } from "../lib/types";
import { AppBadge } from "./app-badge";

// macOS-style squircle app icon. The shade/depth (top dome, lit-top → dark-bottom
// fill shade, hairline rim, layered shadow) lives in ONE place — the `.icon-tile`
// class in appshell.css — so every icon surface shares it DRY + dynamically over
// each app's `gradient`. Here we just supply the fill, the glyph, and the badge.
export function AppIcon({
  app,
  className,
}: {
  app: AppDescriptor;
  className?: string;
}) {
  const Icon = app.icon;
  return (
    <span
      className={cn("icon-tile grid size-full place-items-center text-white", className)}
      style={{ background: app.gradient }}
    >
      {/* text-inherit opts the glyph OUT of the global accent-icon rule
          (appshell.css) so it follows the tile's white `color`, not the accent —
          an accent glyph on the app's brand-gradient tile would vanish. */}
      <Icon className="size-[52%] text-inherit" />
      <AppBadge appId={app.id} />
    </span>
  );
}
