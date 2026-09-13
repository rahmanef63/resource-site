import type { FilesAdapter } from "../adapter/types";
import { makeStorageRef } from "./parse";
import type { FileRef } from "../types";

export async function uploadFile(adapter: FilesAdapter, file: File): Promise<FileRef> {
  const storageId = await adapter.upload(file);
  return makeStorageRef(storageId, file.name);
}

export async function uploadFiles(
  adapter: FilesAdapter,
  files: Iterable<File>,
  onUploaded?: (ref: FileRef, file: File) => void,
): Promise<FileRef[]> {
  const refs: FileRef[] = [];
  for (const file of files) {
    const ref = await uploadFile(adapter, file);
    refs.push(ref);
    onUploaded?.(ref, file);
  }
  return refs;
}
