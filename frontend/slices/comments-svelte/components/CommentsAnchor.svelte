<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    createCommentsState,
    type CommentsBindings,
  } from "../../comments/lib/state";
  import type { TargetRef } from "../../comments/types";

  export type CommentsAnchorState = {
    isLoading: boolean;
    openCount: number;
    totalCount: number;
    href: string | null;
  };

  type Props = {
    target: TargetRef;
    bindings: CommentsBindings;
    pathMap?: (target: TargetRef) => string;
    children: Snippet<[CommentsAnchorState]>;
  };

  let { target, bindings, pathMap, children }: Props = $props();
  let state = $derived.by(() => {
    const comments = createCommentsState(bindings, { target });
    return {
      isLoading: comments.isLoading,
      openCount: comments.openCount,
      totalCount: comments.items.length,
      href: pathMap ? pathMap(target) : null,
    } satisfies CommentsAnchorState;
  });
</script>

{@render children(state)}
