# `resend-newsletter` slice

Newsletter subscription UI + Convex subscriber/campaign backend + Resend delivery worker.

## Behavior

- Public subscribe is **single opt-in**: success immediately activates the normalized address.
- Public unsubscribe is idempotent.
- Subscriber listing and campaign scheduling are host-authorized adapter operations; the bundled backend exposes only internal campaign functions.
- Campaign delivery is the only path that calls Resend. Tests/previews do not send email.
- `RESEND_API_KEY` and `RESEND_FROM` are server-only.

## React / Next

Configure the adapter before rendering `SubscribeForm`:

```tsx
import { configureResendNewsletter, SubscribeForm } from "@/features/resend-newsletter";

configureResendNewsletter({
  subscribe: ({ email, website }) => newsletterSubscribeMutation({ email, website }),
});

<SubscribeForm />
```

## SvelteKit

```bash
npx rr add resend-newsletter --framework sveltekit
```

The Svelte distribution is native Svelte 5 and shares the same `lib/core.ts` + `lib/host.ts`. It carries no React/shadcn runtime.

## Backend

```ts
import { newsletterTables } from "./features/newsletter/_schema";
export default defineSchema({ ...newsletterTables });
```

Real tables: `newsletterSubscribers`, `newsletterIssues`, `newsletterSubscribeAttempts`.

Set `RESEND_API_KEY` and `RESEND_FROM`. Use `mutation.subscribe` and `mutation.unsubscribe` directly. For list/send tools, bind your own authenticated server adapters. After host authz, a Convex server action may call `internal.features.newsletter.actions.send.sendCampaign`; the internal worker then schedules Resend delivery.
