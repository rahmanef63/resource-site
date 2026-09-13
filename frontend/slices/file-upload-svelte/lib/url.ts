import type { FilesAdapter, FileUrlSubscriber } from "../adapter/types";

export function watchFileUrl(
  adapter: FilesAdapter,
  storageId: string | null | undefined,
  run: FileUrlSubscriber,
): () => void {
  let active = true;
  if (!storageId) {
    run(null);
    return () => { active = false; };
  }

  Promise.resolve(adapter.resolveUrl(storageId)).then(
    (url) => { if (active) run(url); },
    () => { if (active) run(null); },
  );
  const unsubscribe = adapter.subscribeUrl?.(storageId, (url) => {
    if (active) run(url);
  });
  return () => {
    active = false;
    unsubscribe?.();
  };
}
