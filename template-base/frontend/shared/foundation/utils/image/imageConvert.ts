/**
 * Pure Canvas-based image utilities. No React, no Convex.
 *
 * Why client-side WebP:
 *  - Self-hosted Convex has no sharp/imagemagick runtime available.
 *  - Converting in the browser saves upload bandwidth (raw → webp before POST).
 *  - Canvas re-encode strips EXIF (including GPS) as a free privacy win.
 */

export const MAX_CONVERT_BYTES = 10 * 1024 * 1024
export const WEBP_QUALITY = 0.9

// Canvas allocates width × height × 4 bytes of RGBA. 30 MP caps that at
// ~120 MB which mobile Safari will tolerate; above this the drawImage-into-
// canvas step reliably OOMs even for small-byte files (e.g. a 20000×10000
// JPEG with aggressive compression sits under 8 MB yet is 200 MP decoded).
export const MAX_PIXEL_COUNT = 30 * 1024 * 1024

export const CONVERTIBLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type ConvertibleImageType = (typeof CONVERTIBLE_IMAGE_TYPES)[number]

export type ImageConvertErrorCode =
  | "too-large"
  | "too-many-pixels"
  | "unsupported"
  | "decode"
  | "encode"

const INDONESIAN_MESSAGES: Record<ImageConvertErrorCode, string> = {
  "too-large":
    "Gambar terlalu besar untuk dikonversi (maks 10 MB). Kompres dulu atau pilih gambar lebih kecil.",
  "too-many-pixels":
    "Gambar memiliki terlalu banyak piksel (maks 30 megapiksel). Kecilkan dimensi dulu.",
  unsupported: "Tipe gambar tidak didukung. Gunakan JPG, PNG, atau WebP.",
  decode: "Gambar tidak bisa dibaca. Pastikan file tidak rusak.",
  encode: "Gagal mengonversi gambar ke WebP.",
}

export class ImageConvertError extends Error {
  readonly code: ImageConvertErrorCode
  constructor(code: ImageConvertErrorCode, message?: string) {
    super(message ?? INDONESIAN_MESSAGES[code])
    this.code = code
    this.name = "ImageConvertError"
  }
}

function isConvertibleMime(type: string): type is ConvertibleImageType {
  return (CONVERTIBLE_IMAGE_TYPES as readonly string[]).includes(type)
}

/**
 * Decode a file to an ImageBitmap with EXIF orientation applied.
 * Throws ImageConvertError("decode") on failure.
 */
async function decodeToBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    throw new ImageConvertError("decode")
  }
}

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement

function makeCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height)
  }
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

async function canvasToWebPBlob(canvas: AnyCanvas): Promise<Blob> {
  if (typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    try {
      return await canvas.convertToBlob({
        type: "image/webp",
        quality: WEBP_QUALITY,
      })
    } catch {
      throw new ImageConvertError("encode")
    }
  }
  return await new Promise<Blob>((resolve, reject) => {
    ;(canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new ImageConvertError("encode"))),
      "image/webp",
      WEBP_QUALITY,
    )
  })
}

function renameToWebP(originalName: string): string {
  return originalName.replace(/\.(jpe?g|png|webp)$/i, "") + ".webp"
}

/**
 * Convert a JPG / PNG / WebP file to a WebP File at quality 0.9.
 * Preserves original pixel dimensions. No-op pass-through for already-webp.
 *
 * Throws ImageConvertError with a localized Indonesian message on failure.
 */
export async function convertImageToWebP(file: File): Promise<File> {
  if (!isConvertibleMime(file.type)) {
    throw new ImageConvertError("unsupported")
  }
  if (file.size > MAX_CONVERT_BYTES) {
    throw new ImageConvertError("too-large")
  }
  if (file.type === "image/webp") {
    return file
  }

  const bitmap = await decodeToBitmap(file)
  try {
    if (bitmap.width * bitmap.height > MAX_PIXEL_COUNT) {
      throw new ImageConvertError("too-many-pixels")
    }
    const canvas = makeCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null
    if (!ctx) throw new ImageConvertError("encode")
    ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0)
    const blob = await canvasToWebPBlob(canvas)
    return new File([blob], renameToWebP(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    })
  } finally {
    bitmap.close?.()
  }
}

export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Crop a source file to the given pixel rectangle and re-encode as WebP.
 * pixelCrop coordinates are in the source image's natural pixel space
 * (the shape react-easy-crop emits as the second argument to onCropComplete).
 */
export async function applyCropToImage(
  file: File,
  pixelCrop: PixelCrop,
): Promise<File> {
  if (!isConvertibleMime(file.type)) {
    throw new ImageConvertError("unsupported")
  }
  if (file.size > MAX_CONVERT_BYTES) {
    throw new ImageConvertError("too-large")
  }
  if (pixelCrop.width <= 0 || pixelCrop.height <= 0) {
    throw new ImageConvertError("encode", "Crop region is empty")
  }
  if (pixelCrop.width * pixelCrop.height > MAX_PIXEL_COUNT) {
    throw new ImageConvertError("too-many-pixels")
  }

  const bitmap = await decodeToBitmap(file)
  try {
    if (bitmap.width * bitmap.height > MAX_PIXEL_COUNT) {
      throw new ImageConvertError("too-many-pixels")
    }
    const canvas = makeCanvas(
      Math.round(pixelCrop.width),
      Math.round(pixelCrop.height),
    )
    const ctx = canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null
    if (!ctx) throw new ImageConvertError("encode")
    ctx.drawImage(
      bitmap as unknown as CanvasImageSource,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      Math.round(pixelCrop.width),
      Math.round(pixelCrop.height),
    )
    const blob = await canvasToWebPBlob(canvas)
    return new File([blob], renameToWebP(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    })
  } finally {
    bitmap.close?.()
  }
}

/**
 * Indonesian savings summary, e.g. "3,4 MB → 1,1 MB (−68%)".
 * Uses id-ID decimal comma and U+2212 minus sign.
 */
export function describeConversion(
  originalBytes: number,
  convertedBytes: number,
): string {
  const fmtMB = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    const rounded = mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)
    return rounded.replace(".", ",") + " MB"
  }
  if (originalBytes <= 0) {
    return `${fmtMB(convertedBytes)}`
  }
  const pct = Math.round(((originalBytes - convertedBytes) / originalBytes) * 100)
  const sign = pct >= 0 ? "−" : "+"
  return `${fmtMB(originalBytes)} → ${fmtMB(convertedBytes)} (${sign}${Math.abs(pct)}%)`
}
