<script lang="ts">
  import "../app.css";
  import { env } from "$env/dynamic/public";
  import { setupConvex } from "convex-svelte";

  let { children } = $props();

  if (env.PUBLIC_CONVEX_URL) {
    setupConvex(env.PUBLIC_CONVEX_URL);
  }
</script>

{@render children()}
