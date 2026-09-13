<script lang="ts">
  import { optimisticVote, settleVote } from "@/features/library/lib/core";
  import type { UpvoteHandler } from "@/features/library/lib/types";

  let {
    itemId,
    initial,
    onUpvote,
    label = "Upvote",
  }: {
    itemId: string;
    initial: number;
    onUpvote?: UpvoteHandler;
    label?: string;
  } = $props();

  class VoteState {
    count = $state(0);
    voted = $state(false);
    busy = $state(false);

    constructor(getInitial: () => number) {
      this.count = getInitial();
    }
  }

  const vote = new VoteState(() => initial);
  let readOnly = $derived(!onUpvote);

  async function toggle() {
    if (vote.busy || !onUpvote) return;
    vote.busy = true;
    const previous = { count: vote.count, voted: vote.voted };
    const optimistic = optimisticVote(vote.count, vote.voted);
    vote.count = optimistic.count;
    vote.voted = optimistic.voted;
    try {
      const result = await onUpvote(itemId);
      const settled = settleVote(previous.count, previous.voted, result.voted);
      vote.count = settled.count;
      vote.voted = settled.voted;
    } catch {
      vote.count = previous.count;
      vote.voted = previous.voted;
    } finally {
      vote.busy = false;
    }
  }
</script>

<button
  type="button"
  onclick={toggle}
  disabled={vote.busy || readOnly}
  aria-pressed={vote.voted}
  class={`inline-flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${vote.voted ? "border-current bg-foreground text-background" : "border-current/40 hover:border-current"} ${readOnly ? "cursor-default" : ""}`}
>
  <span aria-hidden="true">▲</span>
  <span class="tabular-nums">{vote.count}</span>
  {#if !readOnly}<span>{label}</span>{/if}
</button>
