# Commerce: checkout/orders/leads/subscribers

Harvest source: personal-brand-os only. Instatic-convex has **no** commerce surface
(it is a visual-CMS engine — orders/leads/subscribers do not exist there). The hint
said "covered"; honest verdict is **partial** — cart + payment + subscribers are
already 1:1 in rr, but the **domain orders layer** and **leads** are net-new gaps.

## What it does (flow)

Two independent public funnels plus two admin read/CRUD views.

**A. Guest checkout → order → payment → tracking** (the "commerce" core)
1. Visitor adds catalog services to a client-side cart (`storefront-checkout`
   `CartProvider`, localStorage-persisted, no login). Price is a display-only number.
2. `CheckoutPage` composes the cart with `doku-payment`'s `DokuDirectForm`. On submit
   it calls the `checkout.placeOrder` **action**.
3. `placeOrder` re-prices **server-side** from the `services` table (`internal.checkout.priceItems`)
   — the client subtotal is never trusted; only services with a fixed `priceNumber`
   are purchasable (retainer/quote services throw). It mints an unguessable
   `orderId` (`PB-<base36ts>-<rand>`), calls the DOKU Direct payment action
   (`api.features.payment.actions.doku.createDirectPayment`) to create the
   `paymentOrders` row + VA/QRIS instructions, then records the **domain order**
   row via `internal.checkout.recordOrder` into `pbOrders`.
4. Client redirects to `/order/[id]`. `OrderTrackingPage` calls `checkout.trackOrder`
   (a public query — the orderId is the capability token) which **joins** `pbOrders`
   with `paymentOrders`. Reactive: shows pending instructions, then flips to "paid"
   the instant the DOKU webhook patches `paymentOrders.status`, and walks fulfilment
   steps (new → processing → shipped → delivered).
5. Admin `OrdersView` (`orders.list`, auth-gated) renders a read-only joined list
   (buyer PII + items + payment badge). Fulfilment CRUD is intentionally out of scope.

**B. Lead capture** — a public contact form calls `leads.create` (email validated,
rate-limited via `limitPublicWrite`, fields length-clamped) → `leads` table with
`status:"new"`. Admin `LeadsView` is a generic CRUD list (status new/contacted/closed).

**C. Subscribers** — newsletter signup calls `subscribers.subscribe` (rate-limited,
idempotent on email, resurrects unsubscribed rows to "pending"); admin can
list/confirm/unsubscribe/upsert/remove.

## Where it lives

Instatic paths: **none** (feature absent).

personal-brand-os paths:
- Backend: `convex/checkout.ts` (priceItems/recordOrder/placeOrder/trackOrder),
  `convex/orders.ts` (admin `list`), `convex/leads.ts` (create/list/update/remove),
  `convex/subscribers.ts` (subscribe/confirm/unsubscribe/list),
  `convex/storeExtra.ts` (admin upsert/remove for subscribers + comments + chat),
  `convex/features/payment/` (DOKU/Midtrans actions, webhook http, `paymentOrders`),
  `convex/schema.ts` (tables `pbOrders` L68, `leads` L97, `subscribers` L122).
- Frontend slices: `frontend/slices/checkout/{CheckoutPage,OrderTrackingPage}.tsx`,
  `frontend/slices/storefront-checkout/{lib/cart.tsx,components/{CartWidget,CheckoutSummary}.tsx}`,
  `frontend/slices/doku-payment/*`, `frontend/slices/admin/orders/OrdersView.tsx`,
  `frontend/slices/admin/leads/{LeadsView,LeadEditorView}.tsx`.
- Routes: `app/(public)/order/[id]/page.tsx`, `app/dashboard/admin/orders/page.tsx`,
  `app/dashboard/admin/leads/{page.tsx,[id]/page.tsx}`.

## Data model

- `pbOrders` (domain order): `orderId:string`, `buyer:{name,email,phone?}`,
  `items:[{slug,name,qty,price,priceLabel}]`, `totalLabel:string`, `status:string`,
  `ts:number`. Index `by_orderId`.
- `paymentOrders` (rr already has this in `convex/features/payment/_schema.ts`):
  `userId?`, `buyer?`, `orderId`, `amount`, `currency`, `provider("midtrans"|"doku"|"stripe")`,
  `status(pending|...|paid|expired|failed)`, channel/instructions/checkoutUrl/expiresAt/paidAt.
- `leads`: `name,email,topic,source,message?`, `ts`, `status("new"|"contacted"|"closed")`.
  Indexes `by_status_ts`, `by_email`.
- `subscribers`: `email`, `status("pending"|"confirmed"|"unsubscribed")`, `source`,
  `ts`. Index `by_email`. (rr variant uses `confirmed:boolean` + `unsubscribeToken`
  + `subscriberAttempts` — see gap note below.)

## Public API

- Action `checkout.placeOrder(items[{slug,qty}], customer{name,email,phone?}, channel)`
  → `{ok,orderId,amount,instructions,expiresAt}` | `{ok:false,notice}`.
- Query `checkout.trackOrder(orderId)` → joined order+payment (public, token-gated).
- Internal `checkout.priceItems`, `checkout.recordOrder`.
- Query `orders.list(limit?)` → admin joined list (`requireUser`).
- `leads.create` (public, rate-limited) / `leads.list(status?,limit?)` (auth) /
  `leads.update` / `leads.remove` (auth).
- `subscribers.subscribe(email,source)` (public, rate-limited) / `subscribers.list` (auth) /
  `confirm` / `unsubscribe`; `storeExtra.subscriberUpsert` / `subscriberRemove` (auth).

## UI surface

- Public: `CheckoutPage` (cart summary + DOKU form), `OrderTrackingPage`
  (status stepper + payment instructions + order detail), `CartWidget` (header
  sheet), `CheckoutSummary`. Public contact form (lead) + newsletter input (sub).
- Admin: `OrdersView` (read-only joined cards), `LeadsView` (generic CRUD list
  via `_shared/crud/CrudListView`), subscribers table.

## Dependencies

- npm: `convex`, `convex/react`, `lucide-react`, shadcn primitives (badge, button,
  card, separator, sheet). No payment SDK — DOKU is raw HMAC REST in the payment feature.
- rr-slice deps: `storefront-checkout` (cart) + `doku-payment`/`midtrans-payment`
  (payment step) + `convex/features/payment` (`paymentOrders` + actions + webhook).

## rr coverage

**partial.** Breakdown vs the rr catalog:

| Sub-feature | rr coverage | rr slug |
|---|---|---|
| Guest cart + checkout UI composition | **covered** | `storefront-checkout` (exact port: `CartProvider`/`useCart`/`CartWidget`/`CheckoutSummary`/`formatIDR`/`CartItem`) |
| Payment form + provider + `paymentOrders` + webhook | **covered** | `doku-payment` + `midtrans-payment` + `convex/features/payment` |
| Subscribers / newsletter | **covered** | `convex/features/subscribers` (+ `resend-newsletter` + `convex/features/newsletter`) — note: rr schema is richer (`confirmed`+`unsubscribeToken`+`subscriberAttempts`+honeypot) than PBO's `status` enum |
| **Domain orders layer** (`pbOrders` + `placeOrder` re-pricing + `trackOrder` join + `OrderTrackingPage` + admin `OrdersView`) | **net-new** | proposed `convex/features/orders` + `commerce-checkout` UI slice |
| **Leads** (contact capture + admin CRUD) | **net-new** | proposed `convex/features/leads` |

Reasoning: rr stops at the **payment** record (`paymentOrders`). PBO adds a thin
**domain order** layer on top — server-side catalog re-pricing, a stable order
record decoupled from payment provider, and a public reactive tracking page that
joins the two. That orchestration + tracking page + the entire leads vertical have
**no** rr equivalent today. Everything else is already shipped.

## Slice plan

**Action: enhance** (the commerce family exists; add two small backend features +
one thin composition slice to close the orders + leads gaps).

Laziest correct path (ponytail):
1. `commerce-checkout` is **glue**, not new UI — `CheckoutPage`/`OrderTrackingPage`
   are ~85/160 lines that compose `@/features/storefront-checkout` +
   `@/features/doku-payment`. Lift them as a `commerce-checkout` UI slice that
   `enhances` those two existing slices (barrel imports only).
2. New `convex/features/orders/` = `pbOrders` (rename → `orders`) schema +
   `priceItems`/`recordOrder` internals + `placeOrder` action + `trackOrder` +
   admin `list`. Depends on `convex/features/payment` + a catalog table (services).
3. New `convex/features/leads/` = trivial port of `leads.ts` (create/list/update/remove);
   admin UI reuses the `data-table` slice instead of porting `_shared/crud`.
4. Subscribers: **reuse rr's** richer `convex/features/subscribers` — do NOT port
   PBO's weaker `status`-enum version; just document the field-name mapping.

Portability blockers to strip:
- Hardcoded `PUBLIC_BASE`/`ADMIN_BASE` from `@/features/_app/nav-config` → props.
- Bahasa-Indonesia copy everywhere ("Keranjang kosong", "Lacak pesanan", fulfilment
  step labels, error notices) + `formatIDR`/`id-ID` locale + `"Rp "` + `IDR` currency
  → make copy/locale/currency props (i18n seam).
- `placeOrder` hard-wires `api.features.payment.actions.doku.createDirectPayment` and
  `PB-` orderId prefix → take a `provider` arg + configurable prefix so midtrans/stripe
  swap without editing the action.
- Re-pricing couples to the `services` table shape (`priceNumber`/`priceLabel`/`slug`)
  → document the catalog contract or accept an injectable catalog query.
- Auth: PBO uses `optionalUser`/`requireUser`; rr standard is `requireUser`/`requireAdmin`
  from `_shared/auth` — map role gating (admin lists must `requireAdmin`).

Effort: **M** — most weight is already-built reuse; net work is two thin convex
features + lifting two composition components + stripping the i18n/url/provider hardcodes.

Proposed `frontend/slices/commerce-checkout/slice.json` shape:
```jsonc
{
  "slug": "commerce-checkout",
  "version": "0.1.0",
  "category": "content",
  "kind": "ui",
  "title": "Commerce Checkout — guest order + payment + tracking composition",
  "namespace": "@/features/commerce-checkout",
  "frontend": { "slicePath": "frontend/slices/commerce-checkout" },
  "deps": {
    "npm": ["convex"],
    "shadcn": ["badge", "button", "card", "separator"],
    "peers": [
      { "slug": "storefront-checkout", "range": "^0.2", "reason": "cart context" },
      { "slug": "doku-payment", "range": "^0.2", "reason": "payment step (or midtrans)" }
    ]
  },
  "contract": {
    "provides": { "components": ["CheckoutPage", "OrderTrackingPage", "OrdersView"] }
  }
}
```
Plus `convex/features/commerce-checkout` (or split `orders` + `leads`) backend:
`orders` table (`by_orderId`), `placeOrder`/`trackOrder`/`list`/internal pricing;
`leads` table (`by_status_ts`,`by_email`), `create`/`list`/`update`/`remove`.
Trio metadata (`slice.json` + `slice.contract.ts` + `slice.manifest.json`) +
catalog entry in `lib/content/slices.ts` mandatory.
