"use client";

import { ImageEditor } from "@/features/image-editor";

// Live preview: a full Photoshop-style raster editor mounted with no props — it
// opens on a blank 1080×1080 canvas with one paint layer. Try it:
//  • Brush/Eraser (B/E) paint on the active layer; tune size/opacity/hardness.
//  • Add Text / Rectangle / Ellipse from the tool rail; Move (V) to transform.
//  • Open an image, then "Remove BG" → free in-browser cutout (downloads a small
//    model on first run), dropped back as a transparent layer.
//  • Layer styles tab: stroke, drop shadow (angle/distance/size), outer glow,
//    clipping mask, blend modes. Adjustments tab: brightness/contrast/hue/etc.
//  • Export tab → PNG/JPG/WebP at 1×/2×/3×. ⌘Z / ⌘⇧Z undo/redo.

export default function ImageEditorPreview() {
  return (
    <div className="h-dvh w-full">
      <ImageEditor onSave={(url) => console.log("save", url.slice(0, 48) + "…")} />
    </div>
  );
}
