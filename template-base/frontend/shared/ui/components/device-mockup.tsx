"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function isExternalImage(src: string): boolean {
  return /^https?:\/\//.test(src);
}

type Props = {
  desktopImages: string[];
  mobileImages?: string[];
  alt?: (i: number, frame: "desktop" | "mobile") => string;
  /** Combined index: 0..desktopImages.length-1 for desktop, then mobile. */
  onImageClick?: (combinedIndex: number) => void;
  /** Address shown in the browser URL bar. */
  urlLabel?: string;
  className?: string;
  /** Tag for view-transition-name on slide 0 of desktop frame. */
  heroName?: string;
};

/**
 * Side-by-side device chrome wrapper for portfolio screenshots.
 * Desktop = browser-window frame (traffic lights + URL bar).
 * Phone   = rounded slab with notch + side buttons.
 * Each frame has its own index nav when multiple images are supplied.
 * Click an image → onImageClick(i) using the combined index, so the
 * existing Lightbox can show all shots together.
 */
export function DeviceMockup({
  desktopImages,
  mobileImages,
  alt,
  onImageClick,
  urlLabel = "rahmanef.com",
  className,
  heroName,
}: Props) {
  const hasMobile = !!(mobileImages && mobileImages.length > 0);
  const fallbackMobile = !hasMobile ? desktopImages.slice(0, 1) : (mobileImages as string[]);

  return (
    <div
      className={cn(
        "grid gap-6 lg:gap-8",
        hasMobile || desktopImages.length > 0
          ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
          : "grid-cols-1",
        className,
      )}
    >
      <DesktopFrame
        images={desktopImages}
        urlLabel={urlLabel}
        alt={(i) => alt?.(i, "desktop") ?? `Desktop ${i + 1}`}
        onImageClick={(i) => onImageClick?.(i)}
        heroName={heroName}
      />
      <PhoneFrame
        images={fallbackMobile}
        alt={(i) => alt?.(i, "mobile") ?? `Mobile ${i + 1}`}
        onImageClick={(i) =>
          onImageClick?.(desktopImages.length + (hasMobile ? i : 0))
        }
        muted={!hasMobile}
      />
    </div>
  );
}

function useIndex(len: number) {
  const [i, set] = React.useState(0);
  React.useEffect(() => {
    if (i >= len) set(0);
  }, [len, i]);
  const prev = () => set((x) => Math.max(0, x - 1));
  const next = () => set((x) => Math.min(len - 1, x + 1));
  return { i, set, prev, next };
}

function DesktopFrame({
  images,
  urlLabel,
  alt,
  onImageClick,
  heroName,
}: {
  images: string[];
  urlLabel: string;
  alt: (i: number) => string;
  onImageClick?: (i: number) => void;
  heroName?: string;
}) {
  const { i, set, prev, next } = useIndex(images.length || 1);

  return (
    <figure className="relative group/desktop border-2 border-foreground rounded-lg shadow-sm bg-card overflow-hidden">
      <header className="flex items-center gap-3 px-3 py-2 border-b-2 border-foreground bg-background">
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            aria-hidden
            className="size-2.5 rounded-full border border-foreground/40"
            style={{ background: "oklch(var(--chart-3) / 1)" }}
          />
          <span
            aria-hidden
            className="size-2.5 rounded-full border border-foreground/40"
            style={{ background: "oklch(var(--chart-4) / 1)" }}
          />
          <span
            aria-hidden
            className="size-2.5 rounded-full border border-foreground/40"
            style={{ background: "oklch(var(--chart-2) / 1)" }}
          />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2 border border-foreground/40 rounded-sm bg-muted/40 px-2 py-1 font-mono text-[10px] text-muted-foreground truncate">
          <span aria-hidden>https://</span>
          <span className="truncate text-foreground/80">{urlLabel}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 shrink-0 text-[9px] uppercase tracking-brutal text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        </div>
      </header>

      <div className="relative aspect-[16/10] bg-foreground/5 flex items-center justify-center">
        {images.length === 0 ? (
          <div className="text-[10px] uppercase tracking-brutal text-muted-foreground">
            no desktop shot
          </div>
        ) : (
          images.map((src, idx) => (
            <ImageSlide
              key={`${src}-${idx}`}
              src={src}
              alt={alt(idx)}
              active={idx === i}
              onClick={() => onImageClick?.(idx)}
              eager={idx === 0}
              viewTransitionName={idx === 0 ? heroName : undefined}
            />
          ))
        )}
      </div>

      {images.length > 1 && (
        <>
          <FrameButton side="left" onClick={prev} disabled={i === 0} />
          <FrameButton side="right" onClick={next} disabled={i === images.length - 1} />
          <Dots count={images.length} active={i} onClick={set} />
        </>
      )}
    </figure>
  );
}

function PhoneFrame({
  images,
  alt,
  onImageClick,
  muted,
}: {
  images: string[];
  alt: (i: number) => string;
  onImageClick?: (i: number) => void;
  muted?: boolean;
}) {
  const { i, set, prev, next } = useIndex(images.length || 1);

  return (
    <figure className="relative group/phone mx-auto w-full max-w-[280px] lg:max-w-none">
      <div
        className={cn(
          "relative border-2 border-foreground rounded-[2.25rem] shadow-sm bg-foreground p-2.5",
          muted && "opacity-95",
        )}
      >
        {/* side buttons (cosmetic) */}
        <span aria-hidden className="absolute left-[-4px] top-20 h-8 w-1 bg-foreground rounded-l-sm" />
        <span aria-hidden className="absolute right-[-4px] top-24 h-12 w-1 bg-foreground rounded-r-sm" />

        <div className="relative overflow-hidden rounded-[1.6rem] bg-background">
          {/* notch */}
          <div
            aria-hidden
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-5 w-24 bg-foreground rounded-b-2xl flex items-center justify-center gap-1.5"
          >
            <span className="size-1 rounded-full bg-background/40" />
            <span className="size-1.5 rounded-full bg-background/30" />
          </div>

          <div className="relative aspect-[9/19] bg-foreground/5 flex items-center justify-center">
            {images.length === 0 ? (
              <div className="text-[10px] uppercase tracking-brutal text-muted-foreground px-4 text-center">
                no mobile shot
              </div>
            ) : (
              images.map((src, idx) => (
                <ImageSlide
                  key={`${src}-${idx}`}
                  src={src}
                  alt={alt(idx)}
                  active={idx === i}
                  onClick={() => onImageClick?.(idx)}
                  eager={false}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={i === 0}
            aria-label="Sebelumnya"
            className="inline-flex items-center justify-center size-8 border-2 border-foreground rounded-md bg-background hover:bg-foreground hover:text-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => set(idx)}
                aria-label={`Ke gambar ${idx + 1}`}
                className={cn(
                  "size-1.5 rounded-full border-2 border-foreground transition-all",
                  idx === i ? "bg-foreground w-5" : "bg-background",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            disabled={i === images.length - 1}
            aria-label="Selanjutnya"
            className="inline-flex items-center justify-center size-8 border-2 border-foreground rounded-md bg-background hover:bg-foreground hover:text-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}

      {muted && (
        <p className="mt-2 text-center text-[9px] uppercase tracking-brutal text-muted-foreground">
          mobile shot belum diunggah
        </p>
      )}
    </figure>
  );
}

function ImageSlide({
  src,
  alt,
  active,
  onClick,
  eager,
  viewTransitionName,
}: {
  src: string;
  alt: string;
  active: boolean;
  onClick?: () => void;
  eager?: boolean;
  viewTransitionName?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, 60vw"
      priority={eager}
      loading={eager ? "eager" : "lazy"}
      unoptimized={isExternalImage(src)}
      onClick={onClick}
      style={viewTransitionName ? { viewTransitionName } : undefined}
      className={cn(
        "object-cover cursor-zoom-in transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    />
  );
}

function FrameButton({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Sebelumnya" : "Selanjutnya"}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-10 border-2 border-foreground rounded-md bg-background text-foreground shadow-sm opacity-0 group-hover/desktop:opacity-100 transition-opacity hover:bg-foreground hover:text-background disabled:opacity-30 disabled:pointer-events-none",
        side === "left" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function Dots({
  count,
  active,
  onClick,
}: {
  count: number;
  active: number;
  onClick: (i: number) => void;
}) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onClick(i)}
          aria-label={`Ke gambar ${i + 1}`}
          className={cn(
            "size-1.5 rounded-full border-2 border-foreground transition-all",
            i === active ? "bg-foreground w-6" : "bg-background",
          )}
        />
      ))}
    </div>
  );
}
