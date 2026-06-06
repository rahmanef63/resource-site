import Image from "next/image";
import { cn } from "@/lib/utils";
import shots from "@/lib/preview/shots.gen.json";

/** Slug → captured-thumbnail path (scripts/capture-shots.mjs). */
const LAYOUT_SHOTS = (shots as { layouts: Record<string, string> }).layouts;

export function layoutShot(slug: string): string | undefined {
  return LAYOUT_SHOTS[slug];
}

/**
 * Static catalog thumbnail (VP wave screenshot pipeline) — a captured webp of
 * the live preview route instead of a scaled live iframe. 36 iframes on
 * /layouts each booted a full Next page; a shot costs one ~40KB image.
 * Falls back to nothing — callers keep their iframe/mock chain for slugs
 * without a capture.
 */
export function ShotThumbnail({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const src = layoutShot(slug);
  if (!src) return null;
  return (
    <div className={cn("relative aspect-[8/5] w-full overflow-hidden bg-muted", className)}>
      <Image
        src={src}
        alt={`${title} preview`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}
