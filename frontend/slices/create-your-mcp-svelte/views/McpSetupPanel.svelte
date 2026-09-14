<script lang="ts">
  import { copyToClipboard, type SetupField } from "../../create-your-mcp/views/mcp-admin-helpers";

  let { fields }: { fields: SetupField[] } = $props();
  let open = $state(true);
</script>

<section class="rounded-lg border-2 border-foreground bg-card">
  <button
    type="button"
    class="flex w-full items-center justify-between border-b-2 border-foreground px-5 py-3 text-left hover:bg-foreground hover:text-background"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span class="text-sm font-bold uppercase tracking-widest">
      Setup an AI client (ChatGPT / Claude / Cursor)
    </span>
    <span class="text-xs">{open ? "▼ Hide" : "▶ Show"}</span>
  </button>

  {#if open}
    <div class="space-y-3 p-5">
      <p class="text-xs text-muted-foreground">
        Paste these values into your AI client's connector form. Authentication = OAuth.
      </p>
      <dl class="grid gap-2 sm:grid-cols-[200px_1fr]">
        {#each fields as field (field.label)}
          <dt class="py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            {field.label}
          </dt>
          <dd class="flex items-center justify-between gap-2 rounded-md border border-foreground/20 bg-background px-3 py-1.5">
            <code class="break-all font-mono text-xs">{field.value}</code>
            {#if field.kind === "copyable"}
              <button
                type="button"
                class="shrink-0 border border-foreground/40 px-2 py-0.5 text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background"
                onclick={() => void copyToClipboard(field.value)}
              >Copy</button>
            {/if}
          </dd>
        {/each}
      </dl>
      <div class="space-y-1 border-t border-foreground/20 pt-3 text-xs text-muted-foreground">
        <p>Discovery JSON: <code>/.well-known/oauth-authorization-server</code></p>
        <p>Tokens default to 1-year TTL. Revoke cuts access on the next call.</p>
      </div>
    </div>
  {/if}
</section>
