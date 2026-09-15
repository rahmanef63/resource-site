<script lang="ts">
  import { createMockAuthFlow } from "../../convex-auth/lib/flow-core";
  import { DEFAULT_LABELS } from "../../convex-auth/lib/labels";
  import MagicLinkForm from "./MagicLinkForm.svelte";
  import PasswordBlock from "./PasswordBlock.svelte";
  import PhoneForm from "./PhoneForm.svelte";
  import type { AuthCardProps, AuthMethod, AuthResult, SignInLabels } from "../types";

  let {
    methods = ["password", "google"],
    defaultPasswordMode = "signin",
    title,
    description,
    labels: overrides,
    footer,
    class: className = "",
    forgotPasswordHref = "/forgot-password",
    flow,
    onGithub = async () => ({ ok: true }),
    onPhoneSend = async () => ({ ok: true }),
    onPhoneVerify = async () => ({ ok: true }),
    onSuccess,
  }: AuthCardProps = $props();

  const mock = createMockAuthFlow();
  let auth = $derived({ ...mock, ...flow });
  let labels = $derived<SignInLabels>({ ...DEFAULT_LABELS, ...overrides });
  let error = $state("");
  let oauthPending = $state<AuthMethod | null>(null);
  let has = (method: AuthMethod) => methods.includes(method);
  let oauth = $derived(has("google") || has("github"));
  let fieldMethod = $derived(has("password") || has("magic-link") || has("phone"));

  async function handle(result: AuthResult, method: AuthMethod) {
    if (result.ok) {
      error = "";
      await onSuccess?.(method);
    } else {
      error = result.error || labels.genericError;
    }
  }

  async function runOauth(method: "google" | "github") {
    oauthPending = method;
    try {
      const result = method === "google" ? await auth.signInWithGoogle() : await onGithub();
      await handle(result, method);
    } finally {
      oauthPending = null;
    }
  }
</script>

<section class={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`.trim()}>
  <header class="space-y-1.5 p-6 pb-4">
    <h2 class="text-2xl font-semibold leading-none tracking-tight">{title ?? labels.title}</h2>
    <p class="text-sm text-muted-foreground">{description ?? labels.description}</p>
  </header>
  <div class="space-y-4 px-6 pb-6">
    {#if error}<div role="alert" class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>{/if}
    {#if oauth}
      <div class="space-y-2">
        {#if has("google")}<button type="button" class="h-10 w-full rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-50" disabled={oauthPending !== null} onclick={() => runOauth("google")}>{oauthPending === "google" ? labels.googleButtonLoading : labels.googleButton}</button>{/if}
        {#if has("github")}<button type="button" class="h-10 w-full rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-50" disabled={oauthPending !== null} onclick={() => runOauth("github")}>{oauthPending === "github" ? "Redirecting to GitHub…" : "Continue with GitHub"}</button>{/if}
      </div>
    {/if}
    {#if oauth && fieldMethod}<div class="relative flex items-center py-1"><span class="h-px flex-1 bg-border"></span><span class="px-2 text-xs uppercase text-muted-foreground">{labels.divider}</span><span class="h-px flex-1 bg-border"></span></div>{/if}
    {#if has("password")}<PasswordBlock labels={labels} flow={auth} {forgotPasswordHref} {defaultPasswordMode} onResult={(result) => handle(result, "password")} />{/if}
    {#if has("magic-link")}<MagicLinkForm labels={labels} send={auth.sendMagicLink} onResult={(result) => handle(result, "magic-link")} />{/if}
    {#if has("phone")}<PhoneForm onSend={onPhoneSend} onVerify={onPhoneVerify} onResult={(result) => handle(result, "phone")} />{/if}
    {#if has("anonymous")}<button type="button" class="h-10 w-full rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted" onclick={async () => handle(await auth.signInAnonymous(), "anonymous")}>{labels.anonymousButton}</button>{/if}
  </div>
  {#if footer}<footer class="px-6 pb-6 text-center text-sm text-muted-foreground">{@render footer()}</footer>{/if}
</section>
