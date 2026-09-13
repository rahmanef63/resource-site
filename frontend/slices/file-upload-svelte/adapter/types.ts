export type ResolvedFileUrl = string | null;
export type FileUrlSubscriber = (url: ResolvedFileUrl) => void;

/** Svelte-friendly storage seam: no framework hooks inside the adapter. */
export interface FilesAdapter {
  upload(file: File): Promise<string>;
  remove(storageId: string): Promise<void>;
  resolveUrl(storageId: string | null | undefined): ResolvedFileUrl | Promise<ResolvedFileUrl>;
  subscribeUrl?: (storageId: string, run: FileUrlSubscriber) => () => void;
}
