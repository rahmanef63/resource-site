# start-here — Svelte 5 / SvelteKit

Install this distribution with:

```sh
npx rr add start-here --framework sveltekit
```

The default `npx rr add start-here` remains the canonical React/Next distribution. This additive Svelte variant preserves the injected Start Here journey contract without React, Next, lucide-react, or shadcn dependencies.

```svelte
<script lang="ts">
  import { StartHere, configureStartHere } from "$lib/slices/start-here";

  configureStartHere({
    mode: "live",
    apps,
    open: (id) => openWindow(id),
    stages,
  });
</script>

<StartHere />
```

## Adapter contract

`configureStartHere()` accepts a `StartHereAdapter` with `mode`, `apps`, `open(id)`, and optional `stages`. The exported `startHereApi` keeps stable identity and notifies subscribers when the adapter is replaced at runtime.

## Journey behavior

- Authored stage IDs resolve against the live injected app catalog.
- Unknown IDs are filtered and stages with zero resolved apps are skipped.
- Visible stages are numbered contiguously and connectors render only between visible stages.
- Apps not placed in authored stages are appended automatically in a final `Everything else` stage.
- Each app action uses `aria-label="Open <title>"` and calls `open(app.id)`.
