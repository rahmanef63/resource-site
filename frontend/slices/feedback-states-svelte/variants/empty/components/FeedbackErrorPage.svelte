<script lang="ts">
  import FeedbackEmptyState from "./FeedbackEmptyState.svelte";

  type Props = {
    kind?: "404" | "500" | "403" | "no-results" | "empty-list" | "first-use";
    title?: string;
    description?: string;
    class?: string;
  };

  let { class: className = "", ...props }: Props = $props();
</script>

<main class={`grid min-h-[60vh] place-items-center px-4 py-12 ${className}`}>
  <div class="w-full max-w-md">
    <FeedbackEmptyState {...props} />
  </div>
</main>
