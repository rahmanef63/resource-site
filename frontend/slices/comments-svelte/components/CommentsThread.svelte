<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    createCommentsState,
    type CommentsBindings,
    type CommentsState,
  } from "../../comments/lib/state";
  import type { TargetRef } from "../../comments/types";

  type Props = {
    target: TargetRef;
    bindings: CommentsBindings;
    forbiddenWords?: readonly string[];
    children: Snippet<[CommentsState]>;
  };

  let { target, bindings, forbiddenWords, children }: Props = $props();
  let state = $derived(createCommentsState(bindings, { target, forbiddenWords }));
</script>

{@render children(state)}
