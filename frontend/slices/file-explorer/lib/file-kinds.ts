import type { FsEntry } from "../adapter/types";

const IMAGE = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"]);
const VIDEO = new Set(["mp4", "mov", "webm", "avi", "mkv"]);
const AUDIO = new Set(["mp3", "wav", "aiff", "m4a", "flac"]);
const CODE = new Set(["ts", "tsx", "js", "jsx", "py", "go", "rs", "css"]);
const ARCHIVE = new Set(["zip", "gz", "tar", "rar", "7z"]);
const TEXT = new Set(["txt", "md", "markdown", "json", "csv", "log", "ts", "tsx", "js", "jsx", "css", "html", "sh", "yml", "yaml", "xml"]);

export type PreviewKind = "image" | "audio" | "video" | "pdf" | "text";
export type FileKind = "dir" | "image" | "video" | "audio" | "json" | "csv" | "shell" | "html" | "code" | "archive" | "pdf" | "file";

export function fileKind(entry: FsEntry): FileKind {
  if (entry.kind === "dir") return "dir";
  const ext = entry.ext?.toLowerCase() ?? "";
  if (IMAGE.has(ext)) return "image";
  if (VIDEO.has(ext)) return "video";
  if (AUDIO.has(ext)) return "audio";
  if (ext === "json") return "json";
  if (ext === "csv") return "csv";
  if (ext === "sh") return "shell";
  if (ext === "html") return "html";
  if (CODE.has(ext)) return "code";
  if (ARCHIVE.has(ext)) return "archive";
  if (ext === "pdf") return "pdf";
  return "file";
}

export function previewKind(entry: FsEntry): PreviewKind | null {
  if (entry.kind !== "file") return null;
  const ext = entry.ext?.toLowerCase() ?? "";
  if (IMAGE.has(ext)) return "image";
  if (VIDEO.has(ext)) return "video";
  if (AUDIO.has(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (TEXT.has(ext)) return "text";
  return null;
}

export function isImage(entry: FsEntry): boolean {
  return entry.kind === "file" && IMAGE.has(entry.ext?.toLowerCase() ?? "");
}

export function appForFile(entry: FsEntry): "media-viewer" | "code-editor" | null {
  const kind = fileKind(entry);
  if (["image", "video", "audio", "pdf"].includes(kind)) return "media-viewer";
  if (["code", "json", "html", "shell"].includes(kind) || ["md", "txt"].includes(entry.ext?.toLowerCase() ?? "")) return "code-editor";
  return null;
}

export function fileGlyph(entry: FsEntry): string {
  return ({
    dir: "📁", image: "🖼️", video: "🎬", audio: "🎵", json: "{}", csv: "▦",
    shell: ">_", html: "🌐", code: "</>", archive: "🗜️", pdf: "PDF", file: "📄",
  } as Record<FileKind, string>)[fileKind(entry)];
}
