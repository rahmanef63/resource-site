# file-upload — Svelte 5 / SvelteKit

Install explicitly:

```sh
npx rr add file-upload --framework sveltekit
```

The default install remains React/Next. The Svelte distribution preserves the same FileRef format, upload/remove seam, URL resolution, demo localStorage storage, file chip and upload-button behavior without React, react-dom, lucide-react or React shadcn.

```svelte
<script lang="ts">
  import {
    FilesAdapterProvider,
    FileUploadButton,
    FileChip,
    createLocalStorageFilesAdapter,
  } from "$lib/slices/file-upload";
  const adapter = createLocalStorageFilesAdapter();
  let refs = $state<string[]>([]);
</script>

<FilesAdapterProvider {adapter}>
  <FileUploadButton onUploaded={(ref) => refs.push(ref)} multiple />
  {#each refs as ref}
    <FileChip fileRef={ref} onRemove={() => refs = refs.filter((item) => item !== ref)} />
  {/each}
</FilesAdapterProvider>
```

## Adapter contract

Svelte adapters use `upload(file)`, `remove(storageId)`, and framework-neutral `resolveUrl(storageId)`. Backends that can invalidate URLs live may also implement `subscribeUrl(storageId, run)`. This intentionally replaces the React-only `useUrl()` hook seam rather than leaking React hook semantics into Svelte.

The bundled localStorage adapter is demo-only and stores data URLs in browser storage, so large uploads can exceed quota. Production hosts should implement the adapter against Convex, S3, GCS, R2, or another checked storage backend.
