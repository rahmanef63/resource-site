# Convex Auth — SvelteKit

Native Svelte 5 UI for the `convex-auth` slice. It reuses the same labels, validation helpers, normalized result envelope, and framework-neutral auth-flow core as the React distribution.

`@convex-dev/auth` currently exports official React/Next adapters, not a Svelte adapter. Therefore the Svelte `SignInPage` requires an `AuthFlow` supplied by the host. This keeps provider/session wiring explicit instead of emulating undocumented internals. `AuthCard` is presentational and defaults to a mock flow, matching the React preview behavior.

```svelte
<script lang="ts">
  import { SignInPage, type AuthFlow } from "./frontend/slices/convex-auth-svelte";
  const flow: AuthFlow = /* host bridge */;
</script>

<SignInPage {flow} providers={["password", "google"]} />
```

The bundled Convex auth backend and environment contract are unchanged. Keep JWT/OAuth/Resend secrets server-side.
