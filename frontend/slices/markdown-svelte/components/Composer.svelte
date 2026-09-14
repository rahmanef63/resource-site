<script lang="ts">
  let { onSubmit, placeholder, autoFocus = false }: {
    onSubmit: (text: string) => void;
    placeholder: string;
    autoFocus?: boolean;
  } = $props();

  let text = $state("");
  let textarea: HTMLTextAreaElement | undefined;

  $effect(() => {
    if (autoFocus) textarea?.focus();
  });

  function submit() {
    const next = text.trim();
    if (!next) return;
    onSubmit(next);
    text = "";
  }
</script>

<div class="flex items-end gap-2">
  <textarea
    bind:this={textarea}
    bind:value={text}
    rows="2"
    {placeholder}
    class="min-h-0 flex-1 rounded-md border bg-background px-3 py-2 text-xs"
    onkeydown={(event) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        submit();
      }
    }}
  ></textarea>
  <button class="h-8 rounded-md bg-foreground px-3 text-xs font-medium text-background disabled:opacity-40" type="button" onclick={submit} disabled={!text.trim()}>Comment</button>
</div>
