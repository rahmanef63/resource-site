import type { FileRef, ParsedFileRef } from "../types";

const STORAGE_PREFIX = "storage:";

export function parseFileRef(ref: FileRef): ParsedFileRef {
  if (ref.startsWith(STORAGE_PREFIX)) {
    const rest = ref.slice(STORAGE_PREFIX.length);
    const idx = rest.indexOf(":");
    const storageId = idx === -1 ? rest : rest.slice(0, idx);
    const filename = idx === -1 ? storageId : rest.slice(idx + 1);
    return { kind: "storage", storageId, filename, raw: ref };
  }
  if (isHttpUrl(ref)) return { kind: "url", filename: urlTail(ref), raw: ref };
  return { kind: "name", filename: ref, raw: ref };
}

export function makeStorageRef(storageId: string, filename: string): FileRef {
  return `${STORAGE_PREFIX}${storageId}:${filename}`;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function urlTail(value: string): string {
  try {
    const url = new URL(value);
    const tail = url.pathname.split("/").filter(Boolean).at(-1);
    return tail ? decodeURIComponent(tail) : url.hostname;
  } catch {
    return value;
  }
}
