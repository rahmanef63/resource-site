<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { FILES_ADAPTER_CONTEXT } from "../adapter/context";
  import type { FilesAdapter } from "../adapter/types";

  type Props = { adapter: FilesAdapter; children: Snippet };
  let { adapter, children }: Props = $props();

  const delegated: FilesAdapter = {
    upload: (file) => adapter.upload(file),
    remove: (storageId) => adapter.remove(storageId),
    resolveUrl: (storageId) => adapter.resolveUrl(storageId),
    subscribeUrl: (storageId, run) => adapter.subscribeUrl?.(storageId, run) ?? (() => {}),
  };
  setContext(FILES_ADAPTER_CONTEXT, delegated);
</script>

{@render children()}
