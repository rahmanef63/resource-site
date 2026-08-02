"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroCarouselProps = {
  images: { src: string; alt?: string }[];
  intervalMs?: number;
  className?: string;
  overlay?: React.ReactNode;
  transition?: "fade" | "slide" | "kenburns";
  showArrows?: boolean;
  showIndicators?: boolean;
  dim?: boolean;
};

export function HeroCarousel({
  images,
  intervalMs = 4000,
  className,
  overlay,
  transition = "fade",
  showArrows = true,
  showIndicators = true,
  dim = true,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const next = useCallback(
    () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length],
  );

  useEffect(() => {
    if (intervalMs <= 0 || images.length <= 1) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [next, intervalMs, images.length]);

  return (
    <section className={cn("relative h-screen w-full overflow-hidden bg-zinc-900", className)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-zinc-800" />}
      {images.map((img, i) => {
        const active = i === index;
        const base = "absolute inset-0 transition-all duration-1000";
        let stateClass = "";
        if (transition === "fade") {
          stateClass = active ? "opacity-100" : "opacity-0";
        } else if (transition === "slide") {
          const offset = active ? "translate-x-0" : i < index ? "-translate-x-full" : "translate-x-full";
          stateClass = "opacity-100 " + offset;
        } else if (transition === "kenburns") {
          stateClass = active ? "opacity-100 scale-110" : "opacity-0 scale-100";
        }
        return (
          <div key={img.src} className={cn(base, stateClass)} style={transition === "kenburns" ? { transitionDuration: "8s" } : undefined}>
            <Image
              src={img.src}
              alt={img.alt ?? `Slide ${i + 1}`}
              fill
              priority={i === 0}
              quality={85}
              sizes="100vw"
              className="object-cover"
              onLoad={() => setLoaded(true)}
            />
          </div>
        );
      })}

      {dim && <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-black/40" />}

      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center">{overlay}</div>
      )}

      {showArrows && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/60 p-2 text-zinc-900 backdrop-blur transition hover:bg-white/90"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/60 p-2 text-zinc-900 backdrop-blur transition hover:bg-white/90"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {showIndicators && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
