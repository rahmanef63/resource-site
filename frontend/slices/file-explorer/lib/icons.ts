import {
  Folder, FileText, Image, Code2, FileVideo, Music, FileArchive,
  FileJson, FileSpreadsheet, Terminal, Globe, type LucideIcon,
} from "lucide-react";
import type { FsEntry } from "../adapter";
import { appForFile, fileKind, isImage, previewKind, type PreviewKind } from "./file-kinds";

export { appForFile, isImage, previewKind };
export type { PreviewKind };

export function iconFor(entry: FsEntry): LucideIcon {
  const kind = fileKind(entry);
  return ({
    dir: Folder, image: Image, video: FileVideo, audio: Music, json: FileJson,
    csv: FileSpreadsheet, shell: Terminal, html: Globe, code: Code2,
    archive: FileArchive, pdf: FileText, file: FileText,
  } as Record<ReturnType<typeof fileKind>, LucideIcon>)[kind];
}

export function colorFor(entry: FsEntry): string {
  const kind = fileKind(entry);
  if (kind === "dir") return "text-primary";
  if (kind === "image") return "text-amber-500";
  if (kind === "video") return "text-pink-500";
  if (kind === "audio") return "text-emerald-500";
  if (kind === "csv") return "text-green-500";
  if (kind === "pdf") return "text-red-500";
  if (kind === "archive") return "text-violet-400";
  if (["code", "shell", "html"].includes(kind)) return "text-sky-400";
  return "text-muted-foreground";
}
