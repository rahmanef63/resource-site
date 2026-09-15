<script lang="ts">
  import { looksLikeAutofillBug, validatePassword } from "../../convex-auth/lib";
  import type { AuthFlow, AuthResult, PasswordMode, SignInLabels } from "../types";

  let {
    labels,
    flow,
    forgotPasswordHref,
    defaultMode = "signin",
    onResult,
  }: {
    labels: SignInLabels;
    flow: AuthFlow;
    forgotPasswordHref: string | null;
    defaultMode?: PasswordMode;
    onResult: (result: AuthResult) => void | Promise<void>;
  } = $props();

  let mode = $state<PasswordMode | undefined>(undefined);
  let activeMode = $derived(mode ?? defaultMode);
  let name = $state("");
  let email = $state("");
  let password = $state("");
  let show = $state(false);
  let pending = $state(false);
  let isSignup = $derived(activeMode === "signup");

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (looksLikeAutofillBug(password)) {
      await onResult({ ok: false, error: labels.autofillEmailInPasswordError });
      return;
    }
    if (isSignup) {
      const problem = validatePassword(password);
      if (problem) {
        await onResult({ ok: false, error: problem });
        return;
      }
    }
    pending = true;
    try {
      const result = isSignup
        ? await flow.signUpWithPassword({ email, password, name: name || undefined })
        : await flow.signInWithPassword({ email, password });
      await onResult(result);
    } finally {
      pending = false;
    }
  }
</script>

<div class="w-full">
  <div class="grid grid-cols-2 rounded-md bg-muted p-1" role="tablist" aria-label="Password flow">
    <button type="button" role="tab" aria-selected={activeMode === "signin"} class="rounded px-3 py-1.5 text-sm font-medium aria-selected:bg-background aria-selected:shadow-sm" onclick={() => { mode = "signin"; }}>{labels.loginTab}</button>
    <button type="button" role="tab" aria-selected={activeMode === "signup"} class="rounded px-3 py-1.5 text-sm font-medium aria-selected:bg-background aria-selected:shadow-sm" onclick={() => { mode = "signup"; }}>{labels.registerTab}</button>
  </div>
  <form class="mt-4 space-y-3" onsubmit={submit}>
    {#if isSignup}
      <label class="block space-y-2" for="auth-name"><span class="text-sm font-medium">{labels.nameLabel}</span><input id="auth-name" name="name" autocomplete="name" placeholder={labels.namePlaceholder} bind:value={name} required class="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
    {/if}
    <label class="block space-y-2" for="auth-email"><span class="text-sm font-medium">{labels.emailLabel}</span><input id="auth-email" name="email" type="email" inputmode="email" autocomplete={isSignup ? "email" : "username"} placeholder={labels.emailPlaceholder} bind:value={email} required class="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
    <label class="block space-y-2" for="auth-password">
      <span class="text-sm font-medium">{labels.passwordLabel}</span>
      <span class="relative block">
        <input id="auth-password" name={isSignup ? "new-password" : "current-password"} type={show ? "text" : "password"} autocomplete={isSignup ? "new-password" : "current-password"} minlength={isSignup ? 8 : undefined} maxlength={isSignup ? 128 : undefined} placeholder={isSignup ? labels.passwordPlaceholderRegister : labels.passwordPlaceholderLogin} bind:value={password} required class="h-10 w-full rounded-md border bg-background px-3 pr-16 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" aria-label={show ? "Hide password" : "Show password"} onclick={() => { show = !show; }}>{show ? "Hide" : "Show"}</button>
      </span>
    </label>
    {#if isSignup}<p class="text-xs text-muted-foreground">{labels.passwordHint}</p>{/if}
    {#if !isSignup && forgotPasswordHref}<div class="flex justify-end"><a class="text-sm text-muted-foreground hover:text-foreground" href={forgotPasswordHref}>{labels.forgotPassword}</a></div>{/if}
    <button class="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50" type="submit" disabled={pending}>{pending ? (isSignup ? labels.registerButtonLoading : labels.loginButtonLoading) : (isSignup ? labels.registerButton : labels.loginButton)}</button>
  </form>
</div>
