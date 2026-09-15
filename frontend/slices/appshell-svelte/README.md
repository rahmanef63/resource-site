# AppShell — Svelte 5 / SvelteKit

Native Svelte distribution of the manifest-driven OS shell. It shares the canonical window store, geometry, snap/space/layout/profile/command/notification/clipboard/lock cores with the React default while rendering native Svelte macOS, Windows, iOS and Android surfaces.

```svelte
<script lang="ts">
  import { AppShell } from "@/features/appshell-svelte";
  import Files from "./Files.svelte";
  const manifest = { brand:{name:"Acme"}, apps:[{ id:"files", title:"Files", icon:"F", load:async()=>({default:Files}) }] };
</script>
<AppShell {manifest}/>
```

React remains the default distribution. Use `npx rr add appshell --framework sveltekit` to select this renderer.
