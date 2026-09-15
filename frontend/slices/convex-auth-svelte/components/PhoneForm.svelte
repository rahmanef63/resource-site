<script lang="ts">
  import type { AuthResult } from "../types";

  let {
    onSend,
    onVerify,
    onResult,
  }: {
    onSend: (phone: string) => Promise<AuthResult>;
    onVerify: (phone: string, code: string) => Promise<AuthResult>;
    onResult: (result: AuthResult) => void | Promise<void>;
  } = $props();

  let step = $state<"phone" | "otp">("phone");
  let phone = $state("");
  let code = $state("");
  let pending = $state(false);

  async function send(event: SubmitEvent) {
    event.preventDefault();
    pending = true;
    try {
      const result = await onSend(phone);
      if (result.ok) step = "otp";
      else await onResult(result);
    } finally {
      pending = false;
    }
  }

  async function verify(event: SubmitEvent) {
    event.preventDefault();
    pending = true;
    try {
      await onResult(await onVerify(phone, code));
    } finally {
      pending = false;
    }
  }
</script>

{#if step === "phone"}
  <form class="space-y-2" onsubmit={send}>
    <label class="text-sm font-medium" for="auth-phone">Phone number</label>
    <input id="auth-phone" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="+62 812 3456 7890" bind:value={phone} required class="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    <button class="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50" type="submit" disabled={pending}>{pending ? "Sending…" : "Send code"}</button>
    <p class="text-xs text-muted-foreground">We'll text you a 6-digit verification code.</p>
  </form>
{:else}
  <form class="space-y-3 text-center" onsubmit={verify}>
    <p class="text-sm text-muted-foreground">Enter the 6-digit code sent to <span class="font-mono">{phone || "your phone"}</span>.</p>
    <input aria-label="Verification code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" bind:value={code} class="mx-auto h-10 w-40 rounded-md border bg-background px-3 text-center font-mono tracking-[0.35em] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    <button class="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50" type="submit" disabled={pending || code.length < 6}>{pending ? "Verifying…" : "Verify"}</button>
    <button class="text-sm text-muted-foreground underline-offset-4 hover:underline" type="button" onclick={() => { step = "phone"; }}>Use a different number</button>
  </form>
{/if}
