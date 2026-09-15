<script lang="ts">
  import type { AppDescriptor } from "../types";
  let { app, payload }: { app: AppDescriptor; payload?: unknown } = $props();
  let loadPromise = $derived(app.load());
</script>
{#await loadPromise}<div class="state">Opening {app.title}…</div>{:then module}{@const Loaded=module.default}<Loaded {payload}/>{:catch error}<div class="state error">{String(error?.message??error)}</div>{/await}
<style>.state{display:grid;height:100%;place-items:center;padding:1rem;color:var(--muted-foreground,#737373);font-size:.82rem}.error{color:#dc2626}</style>
