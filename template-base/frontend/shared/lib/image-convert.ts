/**
 * Image-convert stub. Kitab foundation; specific apps wire this to
 * their backend (sharp, browser-canvas, etc.). Default impl returns
 * the input unchanged so callers don't crash.
 *
 * Surface mirrors what `frontend/shared/ui/components/file-upload.tsx`
 * imports (applyCropToImage, describeConversion, PixelCrop) so the
 * shared file-upload UI typechecks against the kitab.
 */

export type ImageConvertOptions = {
  format?: "png" | "jpeg" | "webp" | "avif";
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type PixelCrop = {
  unit: "px";
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function convertImage(
  file: File,
  _options: ImageConvertOptions = {},
): Promise<File> {
  return file;
}

/**
 * No-op stub: returns the input file unchanged. Real impl should crop
 * via canvas or sharp.
 */
export async function applyCropToImage(
  file: File,
  _crop: PixelCrop,
  _options: ImageConvertOptions = {},
): Promise<File> {
  return file;
}

/**
 * Stub: returns a short label describing the planned conversion. Used
 * by file-upload UI to show "PNG → WebP @ 80%" etc. Accepts either an
 * options object or a (originalSize, convertedSize) pair (the latter
 * is what file-upload.tsx passes in).
 */
export function describeConversion(
  optionsOrOriginalSize: ImageConvertOptions | number | undefined = {},
  convertedSize?: number | undefined,
): string {
  if (typeof optionsOrOriginalSize === "number" || optionsOrOriginalSize === undefined) {
    const orig = (typeof optionsOrOriginalSize === "number" ? optionsOrOriginalSize : 0) ?? 0;
    const conv = convertedSize ?? orig;
    if (!orig || conv === orig) return `${(orig / 1024).toFixed(1)} KB`;
    const pct = Math.round((1 - conv / orig) * 100);
    return `${(orig / 1024).toFixed(1)} KB → ${(conv / 1024).toFixed(1)} KB (${pct}%)`;
  }
  return "no conversion (kitab stub)";
}
