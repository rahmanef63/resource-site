<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LandingStore } from "../../sections/lib/core";
  import { provideLandingStore } from "../lib/context";

  type Props = { value: LandingStore; children: Snippet };
  let { value, children }: Props = $props();
  provideLandingStore(() => value);
</script>

{@render children()}
