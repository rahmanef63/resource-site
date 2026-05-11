# Recipe: doku-payment

Indonesian payment via DOKU — sibling to `midtrans-payment`. Both modes shipped:

- **Checkout** — hosted page, all enabled channels, redirect-based.
- **Direct** — single-channel call, returns VA / QRIS / deeplink inline.

Already at `frontend/slices/doku-payment/` + `convex/features/payment/doku/` + `convex/features/payment/actions/doku.ts`.

## What's in the box

Backend (Convex):

- `convex/features/payment/doku/types.ts` — request/response shapes (19 channels)
- `convex/features/payment/doku/client.ts` — signed fetch wrapper
- `convex/features/payment/doku/signature.ts` — HMAC-SHA256 sign + verify
- `convex/features/payment/actions/doku.ts` — `createCheckoutPayment`, `createDirectPayment`, `getPaymentStatus`
- `convex/features/payment/http.ts` — `dokuWebhook` httpAction
- `convex/features/payment/{mutations,queries,schema}.ts` — shared with midtrans

Frontend (slice):

- `frontend/slices/doku-payment/components/checkout-page.tsx` — demo page
- `components/providers/doku.tsx` — hosted-page button
- `DokuDirectForm.tsx` — channel picker
- `DokuPaymentInstructions.tsx` — VA / QRIS / e-Wallet render
- `DokuStatusBadge.tsx` — reactive status with manual re-sync
- `lib/{channels,format}.ts` — 19-channel registry + IDR helpers

## Three integration patterns

### A) Quickest — Hosted Checkout

User clicks "Bayar" → backend creates checkout URL → user redirected to DOKU page → after pay, user lands on `callbackUrl` you set → webhook fires async to mark order paid.

```tsx
import { DokuCheckout } from "@/features/doku-payment/components/providers/doku";

<DokuCheckout
  amount={150_000}
  orderId={`ord_${Date.now()}`}
  customer={{ name: user.name, email: user.email }}
  callbackUrl="/orders/confirmation"
/>
```

### B) Custom UI — Direct

Channel picker + form inside your site. Returns VA number / QR string / deep link to render with your own design.

```tsx
import { DokuDirectForm } from "@/features/doku-payment/components/DokuDirectForm";
import { DokuPaymentInstructions } from "@/features/doku-payment/components/DokuPaymentInstructions";

const [pay, setPay] = useState(null);
{pay ? (
  <DokuPaymentInstructions channel={pay.channel} instructions={pay.instructions} expiresAt={pay.expiresAt} />
) : (
  <DokuDirectForm amount={amount} orderId={id} onSuccess={setPay} />
)}
```

### C) AI agent / chatbot — same backend, different caller

If your template has `ai-router`, the chatbot can invoke `createCheckoutPayment` and reply with the URL. No additional code — the action's auth check (`getAuthUserId`) is the same regardless of caller.

For an MCP-style integration where Claude itself drives the call, see `docs/integrations/doku-mcp.md`.

## Webhook setup

1. After deploy, get your Convex site URL — `https://<deploy>.convex.site`.
2. In DOKU dashboard → Configuration → **Notification URL**:
   `https://<deploy>.convex.site/webhooks/doku`
3. Register the handler in your project's `convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { dokuWebhook } from "./features/payment/http";
const http = httpRouter();
http.route({ path: "/webhooks/doku", method: "POST", handler: dokuWebhook });
export default http;
```

Idempotent: duplicate `Request-Id` short-circuits via the `by_provider_request` index on `paymentWebhookEvents`.

## Standalone use

```bash
npx rahman-resources add doku-payment
```

Or manual:

```bash
cp -r template-base/convex/features/payment/{doku,actions/doku.ts} convex/features/payment/
cp -r template-base/frontend/slices/doku-payment frontend/slices/doku-payment
# update convex/schema.ts to include paymentTables
# register webhook in convex/http.ts
```

## Sandbox vs Live

```
DOKU_IS_PRODUCTION=false   # → api-sandbox.doku.com
DOKU_IS_PRODUCTION=true    # → api.doku.com
```

Sandbox doesn't process real money; use the credentials from DOKU's Sandbox Portal. Live requires production credentials issued by sales.

## Templates that ship this

Auto-recommended via `lib/build/compat.ts` for:

- `personal-brand-os`
- `agency-studio-os`
- `konsultan-os`
- `wirausaha-os`
- `kreator-studio-os`
- `riset-kit`
- `cms-public-storefront`

Marked `warn` for `saas-marketing-os` (DOKU lacks recurring billing — use Stripe for subscriptions).

## See also

- `recipes/midtrans-payment/` — sibling provider, same schema
- `docs/integrations/doku-mcp.md` — Track B: MCP client wiring
- `frontend/slices/doku-payment/README.md` — slice-internal docs
