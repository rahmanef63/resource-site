import { probeMedia } from "./media-probe";
import type { MediaRef, MediaType } from "./mock-timeline";

export const SAMPLES: { label: string; url: string; type: MediaType }[] = [
  { label: "Forest photo", url: "/demo-media/photo-forest.webp", type: "image" },
  { label: "Ocean photo", url: "/demo-media/photo-ocean.webp", type: "image" },
  { label: "Sunset photo", url: "/demo-media/photo-sunset.webp", type: "image" },
  { label: "Demo clip", url: "/demo-media/clip.webm", type: "video" },
  { label: "Tone (audio)", url: "/demo-media/tone.wav", type: "audio" },
];

export function mediaTypeFromName(name: string, mime = ""): MediaType | null {
  const type = mime.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"].includes(ext)) return "image";
  if (["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a", "aac", "flac", "ogg"].includes(ext)) return "audio";
  return null;
}

export async function createMediaRef(url: string, type: MediaType): Promise<MediaRef> {
  return { url, type, ...(await probeMedia(url, type)) };
}
