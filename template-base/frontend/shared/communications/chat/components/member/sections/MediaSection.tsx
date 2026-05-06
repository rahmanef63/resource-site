import { Film, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { SharedMediaItem } from "../types";

type MediaSectionProps = {
  isMobile: boolean;
  items?: SharedMediaItem[];
  isLoading?: boolean;
};

export function MediaSection({ isMobile, items, isLoading }: MediaSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-lg border border-border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={isMobile ? "py-6 text-center" : "py-8 text-center"}>
        <ImageIcon className={isMobile ? "mx-auto h-10 w-10 text-wa-muted" : "mx-auto h-12 w-12 text-wa-muted"} />
        <p className="mt-3 text-sm text-wa-muted">No shared media yet</p>
      </div>
    );
  }

  return (
    <div
      className={[
        "grid gap-2",
        isMobile ? "grid-cols-2" : "grid-cols-3",
      ].join(" ")}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square overflow-hidden rounded-wa-md border border-wa-border bg-muted transition-opacity hover:opacity-80"
        >
          {item.url ? (
            <Image
              src={item.url}
              alt={item.fileName || "Shared media item"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-wa-muted">
              {item.type === "video" ? <Film className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
            </div>
          )}
          {item.type === "video" && (
            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
              Video
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
