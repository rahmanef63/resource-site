# `cal-com-booking` slice

Cal.com inline booking UI plus a real Convex webhook mirror. React/Next remains the default distribution; SvelteKit gets native Svelte 5 UI over Cal.com's vanilla embed script.

## React / Next

```tsx
import { CalEmbed } from "@/features/cal-com-booking";

<CalEmbed calLink="team/event-type" />
```

Pass `calOrigin` for another Cal deployment (for example a self-hosted or regional Cal origin). No account identifier is hardcoded and an omitted `calLink` renders an explicit wiring notice.

## Backend mirror

`convex/features/bookings/http.ts` verifies `CALCOM_WEBHOOK_SECRET` and mirrors Cal webhook events into the real `bookings` table. Keep this secret server-side and wire the HTTP action from `convex/http.ts`.

The mirrored backend only upserts webhook events. `calComBookingTools.list/cancel/reschedule` are adapter contracts: if you expose those tools, bind `CalComBookingCtx` to your own authorized Cal API/server actions. The bundled mirror does **not** implement cancel, reschedule, or list endpoints.

## SvelteKit

```bash
npx rr add cal-com-booking --framework sveltekit
```

The Svelte distribution uses Cal.com's vanilla inline embed API and does not ship React, `@calcom/embed-react`, Next, or React shadcn runtime code.
