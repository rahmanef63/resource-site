import type { ImageValue, UnsplashPhoto } from "../types";

export const IMAGE_UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
export const IMAGE_LINK_URL_RX = /^https?:\/\/[^\s]+/i;
export const IMAGE_LINK_ERROR = "Paste a full https:// image URL";

export type ImagePickerTab = "gallery" | "upload" | "link" | "unsplash";

export function pickerTabs(canUpload: boolean): ImagePickerTab[] {
  return ["gallery", ...(canUpload ? (["upload"] as const) : []), "link", "unsplash"];
}

export function pickerTabLabel(tab: ImagePickerTab): string {
  return tab[0].toUpperCase() + tab.slice(1);
}

export function validateImageLink(value: string): string | null {
  return IMAGE_LINK_URL_RX.test(value.trim()) ? null : IMAGE_LINK_ERROR;
}

export function validateUploadFile(file: Pick<File, "type" | "size">): string | null {
  if (!file.type.startsWith("image/")) return "Images only";
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) return "Max 8 MB";
  return null;
}

export function clampPositionY(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function positionYFromClient(clientY: number, top: number, height: number): number {
  if (!Number.isFinite(height) || height <= 0) return 50;
  return clampPositionY(((clientY - top) / height) * 100);
}

export function toUnsplashImageValue(photo: UnsplashPhoto): ImageValue {
  return {
    type: "unsplash",
    value: photo.regular,
    positionY: 50,
    metadata: {
      id: photo.id,
      thumb: photo.thumb,
      full: photo.full,
      photographer: photo.photographer,
      photographerUrl: photo.photographerUrl,
      source: photo.source,
    },
  };
}
