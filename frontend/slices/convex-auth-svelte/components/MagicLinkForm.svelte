<script lang="ts">
  import type { AuthResult, SignInLabels } from "../types";

  let {
    labels,
    send,
    onResult,
  }: {
    labels: SignInLabels;
    send: (email: string) => Promise<AuthResult>;
    onResult: (result: AuthResult) => void | Promise<void>;
  } = $props();

  let email = $state("");
  let pending = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    pending = true;
    try {
      await onResult(await send(email));
    } finally {
      pending = false;
    }
  }
</script>

<form class="space-y-2" onsubmit={submit}>
  <div class="space-y-2">
    <label class="text-sm font-medium" for="magic-link-email">{labels.emailLabel}</label>
    <input
      id="magic-link-email"
      name="email"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder={labels.emailPlaceholder}
      bind:value={email}
      required
      class="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  </div>
  <button class="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50" type="submit" disabled={pending}>
    {pending ? labels.magicLinkButtonLoading : labels.magicLinkButton}
  </button>
  <p class="text-xs text-muted-foreground">{labels.magicLinkHint}</p>
</form>
