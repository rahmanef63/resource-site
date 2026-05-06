"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function isExternalImage(src: string): boolean {
  return /^https?:\/\//.test(src);
}

type CarouselProps = {
  images: string[];
  alt?: (i: number) => string;
  onImageClick?: (i: number) => void;
  className?: string;
  aspectClass?: string; // e.g. "aspect-[4/3]"
  /** "contain" — letterbox, never crop; "cover" — fill frame, may crop. */
  fit?: "contain" | "cover";
  /** Tag for view-transition-name on slide 0 (SSG → detail morph). */
  heroName?: string;
};

/**
 * Snap-scrolling image carousel with arrow buttons and dot indicators.
 * Native scroll-snap handles drag/swipe — no JS gesture library needed.
 * Arrow buttons programmatically scroll the container by one track.
 *
 * Click an image → onImageClick(i). Use with <Lightbox> for popup.
 */
export function Carousel({
  images,
  alt,
  onImageClick,
  className,
  aspectClass = "aspect-[4/3]",
  fit = "contain",
  heroName,
}: CarouselProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);

  const scrollTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  };

  // Detect active slide via IntersectionObserver on each child.
  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const slides = Array.from(el.children) as HTMLElement[];
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with highest intersection ratio.
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const idx = slides.indexOf(best.target as HTMLElement);
        if (idx >= 0) setActive(idx);
      },
      { root: el, threshold: [0.5, 0.75, 1] },
    );

    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [images.length]);

  if (images.length === 0) return null;

  const prev = () => scrollTo(Math.max(0, active - 1));
  const next = () => scrollTo(Math.min(images.length - 1, active + 1));

  return (
    <div className={cn("relative group/carousel", className)}>
      <div
        ref={trackRef}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory scroll-smooth border-2 border-foreground rounded-lg shadow-sm bg-card",
          aspectClass,
        )}
        style={{ scrollbarWidth: "none" }}
        aria-label="Carousel"
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative shrink-0 w-full h-full snap-start snap-always flex items-center justify-center bg-foreground/5"
            onClick={() => onImageClick?.(i)}
          >
            <Image
              src={src}
              alt={alt?.(i) ?? `Slide ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              unoptimized={isExternalImage(src)}
              className={cn(
                "cursor-zoom-in",
                fit === "contain" ? "object-contain" : "object-cover",
              )}
              style={i === 0 && heroName ? { viewTransitionName: heroName } : undefined}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            disabled={active === 0}
            aria-label="Sebelumnya"
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-10 border-2 border-foreground rounded-md bg-background text-foreground shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-foreground hover:text-background disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={active === images.length - 1}
            aria-label="Selanjutnya"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-10 border-2 border-foreground rounded-md bg-background text-foreground shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-foreground hover:text-background disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Ke gambar ${i + 1}`}
                className={cn(
                  "size-1.5 rounded-full border-2 border-foreground transition-all",
                  i === active ? "bg-foreground w-6" : "bg-background",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
