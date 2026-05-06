"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type LightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  alt?: (i: number) => string;
};

/**
 * Full-screen image viewer. Arrows + keyboard + click-outside. Uses
 * its own Dialog primitive (no chrome, no border, just the image).
 */
export function Lightbox({
  open,
  onOpenChange,
  images,
  index,
  onIndexChange,
  alt,
}: LightboxProps) {
  const safeIndex = Math.max(0, Math.min(index, Math.max(0, images.length - 1)));
  const canPrev = safeIndex > 0;
  const canNext = safeIndex < images.length - 1;

  const prev = React.useCallback(() => {
    if (canPrev) onIndexChange(safeIndex - 1);
  }, [canPrev, onIndexChange, safeIndex]);

  const next = React.useCallback(() => {
    if (canNext) onIndexChange(safeIndex + 1);
  }, [canNext, onIndexChange, safeIndex]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (images.length === 0) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[70] bg-foreground/90 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[71] flex items-center justify-center p-4 sm:p-8 outline-none focus-visible:outline-none"
          onPointerDownOutside={(e) => {
            // don't close when clicking arrow buttons
            const target = e.target as HTMLElement;
            if (target.closest("[data-lightbox-control]")) e.preventDefault();
          }}
        >
          <DialogPrimitive.Title className="sr-only">Pratinjau gambar</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Tekan panah kiri/kanan untuk berpindah gambar, ESC untuk menutup.
          </DialogPrimitive.Description>

          <DialogPrimitive.Close
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center size-10 border-2 border-background rounded-md bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
            aria-label="Tutup"
            data-lightbox-control
          >
            <X className="size-4" />
          </DialogPrimitive.Close>

          {canPrev && (
            <button
              type="button"
              onClick={prev}
              aria-label="Gambar sebelumnya"
              data-lightbox-control
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center size-11 border-2 border-background rounded-md bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {canNext && (
            <button
              type="button"
              onClick={next}
              aria-label="Gambar selanjutnya"
              data-lightbox-control
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center size-11 border-2 border-background rounded-md bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          {/* Image itself — clicking outside (the overlay) closes */}
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[safeIndex]}
              alt={alt?.(safeIndex) ?? `Gambar ${safeIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain border-2 border-background rounded-md bg-foreground"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 border-2 border-background rounded-md bg-foreground/80 backdrop-blur px-3 py-1.5 text-[10px] uppercase tracking-brutal font-medium text-background tabular-nums">
              {safeIndex + 1} / {images.length}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
