# resend-newsletter — Svelte 5 / SvelteKit

Native Svelte 5 subscribe form over the same framework-neutral `lib/core.ts` + `lib/host.ts` contract used by React. No React or shadcn runtime is installed for this distribution.

```bash
npx rr add resend-newsletter --framework sveltekit
```

Configure the public adapter **before** mounting the form. Bind it to your app's real Convex mutation:

```ts
import { configureResendNewsletter } from "@/features/resend-newsletter";

configureResendNewsletter({
  subscribe: ({ email, website }) => newsletterSubscribeMutation({ email, website }),
});
```

The bundled Convex backend is single opt-in: a successful subscribe immediately creates/updates an `active` subscriber. It also includes public unsubscribe, admin-gated subscriber listing, and admin-gated campaign scheduling. `RESEND_API_KEY` and `RESEND_FROM` stay server-side; no email is sent until an authorized host calls the campaign action.
