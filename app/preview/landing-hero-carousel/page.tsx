"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/previews/hero-carousel/HeroCarousel";

const IMAGES = [
  { src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2000&q=80", alt: "Sun-lit interior" },
  { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2000&q=80", alt: "Modern living room" },
  { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80", alt: "Warm dining nook" },
  { src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=2000&q=80", alt: "Studio bedroom" },
];

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const p = useSearchParams();
  const transition = (p.get("transition") ?? "fade") as "fade" | "slide" | "kenburns";
  const interval = Number(p.get("interval") ?? 4000);
  const arrows = p.get("arrows") !== "0";
  const indicators = p.get("indicators") !== "0";
  const overlay = p.get("overlay") !== "0";
  const dim = p.get("dim") !== "0";

  return (
    <HeroCarousel
      images={IMAGES}
      intervalMs={interval}
      transition={transition}
      showArrows={arrows}
      showIndicators={indicators}
      dim={dim}
      overlay={overlay ? (
        <div className="text-center text-white drop-shadow-lg">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/80">Cesca · Studio</p>
          <h1 className="mt-3 font-serif text-5xl font-light leading-tight md:text-7xl">Spaces that breathe</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/85 md:text-base">
            Interior design rooted in light, texture, and quiet detail.
          </p>
        </div>
      ) : undefined}
    />
  );
}
