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
 * by file-upload UI to show "PNG → WebP @ 80%" etc. Real impl would
 * format from `_options`.
 */
export function describeConversion(
  _options: ImageConvertOptions = {},
): string {
  return "no conversion (kitab stub)";
}
