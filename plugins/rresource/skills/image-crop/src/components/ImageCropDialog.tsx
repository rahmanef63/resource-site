// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";
import { applyCropToImage } from "../lib/crop";

type Props = {
  open: boolean;
  src: string;
  aspect?: number;
  onClose: () => void;
  onCropped: (blob: Blob) => void;
};

export function ImageCropDialog({ open, src, aspect = 1, onClose, onCropped }: Props) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [area, setArea] = React.useState<Area | null>(null);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex h-[80vh] w-[90vw] max-w-2xl flex-col rounded-lg bg-background">
        <div className="relative flex-1">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, p) => setArea(p)}
          />
        </div>
        <div className="flex justify-end gap-2 border-t p-3">
          <button onClick={onClose} className="rounded border px-3 py-1.5 text-sm">Cancel</button>
          <button
            onClick={async () => {
              if (!area) return;
              const blob = await applyCropToImage(src, area);
              onCropped(blob);
              onClose();
            }}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Crop
          </button>
        </div>
      </div>
    </div>
  );
}
