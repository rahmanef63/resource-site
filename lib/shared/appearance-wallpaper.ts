"use client";
/* Wallpaper CSS helpers for the appearance store (lib/appearance). Pure
   functions — no module state. */
import { imageStyle, isCssImage, type ImageValue } from "@/features/image-picker";

/* Maximize resolution for Unsplash CDN images — a wallpaper covers the whole
   screen, so request a 2560-wide high-quality render regardless of which size
   the picker stored (its `regular` is only 1080 → blurry when upscaled). Other
   hosts pass through unchanged. */
function upgradeUnsplash(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("w", "2560");
      u.searchParams.set("q", "85");
      u.searchParams.delete("h");
      return u.toString();
    }
  } catch { /* not a URL */ }
  return url;
}

/* Build the wallpaper CSS. Remote http(s) images go through the same-origin
   image proxy so they load "from anywhere" (hotlink-protected hosts, mixed CORS)
   without needing next.config remotePatterns, and are cached immutably by the
   proxy. Colour/gradient + data:/blob: uploads render directly — no proxy. */
export function wallpaperCss(img: ImageValue) {
  if (isCssImage(img)) return imageStyle(img);
  const hi = upgradeUnsplash(img.value);
  const resolved = /^https?:\/\//i.test(hi) ? `/api/img?url=${encodeURIComponent(hi)}` : hi;
  return imageStyle(img, resolved);
}
