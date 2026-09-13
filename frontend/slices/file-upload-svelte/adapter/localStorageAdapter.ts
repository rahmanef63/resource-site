import type { FilesAdapter } from "./types";

const KEY_PREFIX = "files-demo:";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): StorageLike {
  if (typeof localStorage === "undefined") {
    throw new Error("createLocalStorageFilesAdapter requires a browser localStorage implementation");
  }
  return localStorage;
}

function blobToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function genId(): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createLocalStorageFilesAdapter(storage?: StorageLike): FilesAdapter {
  const bucket = storage ?? browserStorage();
  return {
    async upload(file) {
      const id = genId();
      const dataUrl = await blobToDataUrl(file);
      try {
        bucket.setItem(KEY_PREFIX + id, dataUrl);
      } catch (error) {
        throw new Error(
          `localStorage quota exceeded — file too large for demo adapter. Wire a real FilesAdapter for production. (${(error as Error).message})`,
        );
      }
      return id;
    },
    async remove(storageId) {
      bucket.removeItem(KEY_PREFIX + storageId);
    },
    resolveUrl(storageId) {
      if (!storageId) return null;
      try {
        return bucket.getItem(KEY_PREFIX + storageId);
      } catch {
        return null;
      }
    },
  };
}
