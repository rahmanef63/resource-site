<script lang="ts">
  import { newsletterSuccessMessage } from "../../resend-newsletter/lib/core";
  import { newsletterPublicApi } from "../../resend-newsletter/lib/host";

  let email = $state("");
  let website = $state("");
  let busy = $state(false);
  let message = $state("");
  let error = $state("");
  let configured = $derived(newsletterPublicApi.configured);

  async function submit() {
    if (busy || !configured) return;
    busy = true;
    message = "";
    error = "";
    try {
      const result = await newsletterPublicApi.subscribe({ email, website });
      message = newsletterSuccessMessage(result);
      if (!result.already) email = "";
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Could not subscribe. Try again.";
    } finally {
      busy = false;
    }
  }
</script>

<section class="mx-auto mt-12 flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
  <div>
    <h2 class="text-xl font-semibold">Subscribe to the newsletter</h2>
    <p class="mt-1 text-sm text-muted-foreground">Single opt-in: a successful submit activates the address immediately.</p>
  </div>

  {#if !configured}
    <p class="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground" role="status">
      Configure the newsletter adapter before rendering this form.
    </p>
  {/if}

  <form class="flex flex-col gap-3" onsubmit={(event) => { event.preventDefault(); void submit(); }}>
    <label class="grid gap-1 text-sm" for="newsletter-email-svelte">Email</label>
    <input
      id="newsletter-email-svelte"
      class="h-9 rounded-md border border-input bg-background px-3 text-sm"
      type="email"
      required
      autocomplete="email"
      bind:value={email}
      placeholder="you@domain.com"
    />
    <label class="sr-only" aria-hidden="true">
      Website
      <input tabindex="-1" autocomplete="off" bind:value={website} />
    </label>
    <button
      class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
      type="submit"
      disabled={busy || !configured}
    >{busy ? "Subscribing…" : "Subscribe"}</button>
    {#if message}<p class="text-sm text-emerald-600" role="status">{message}</p>{/if}
    {#if error}<p class="text-sm text-destructive" role="alert">{error}</p>{/if}
  </form>
</section>
