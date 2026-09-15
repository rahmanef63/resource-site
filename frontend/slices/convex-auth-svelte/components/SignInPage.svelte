<script lang="ts">
  import AuthCard from "./AuthCard.svelte";
  import type { AuthMethod, AuthProvider, SignInPageProps } from "../types";

  let {
    flow,
    appName = "Your App",
    redirectTo = "/dashboard",
    forgotPasswordHref = "/forgot-password",
    providers = ["password", "google"],
    labels,
    footer,
    onSuccess,
  }: SignInPageProps = $props();

  let methods = $derived(providers as ReadonlyArray<AuthMethod>);

  async function succeed(method: AuthMethod) {
    const provider = method as AuthProvider;
    if (onSuccess) {
      await onSuccess(provider);
      return;
    }
    if (typeof window !== "undefined") window.location.assign(redirectTo);
  }
</script>

<main class="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
  <AuthCard {flow} {methods} {labels} {forgotPasswordHref} onSuccess={succeed} />
  <div class="mt-6 text-center text-sm text-muted-foreground">
    {#if footer}{@render footer()}{:else}<p>© {new Date().getFullYear()} {appName}</p>{/if}
  </div>
</main>
