import { defineFeature } from "@/lib/shared/features/defineFeature";

/**
 * Payment feature config — one nav + one /checkout route across providers.
 * The provider variants (doku / midtrans) share convex/features/payment,
 * which discriminates on a `provider` column.
 */
export const paymentFeature = defineFeature({
  slug: "payment",
  title: "Payment — Indonesia PSP (DOKU · Midtrans)",
  category: "integrations",
  routes: [
    { path: "/checkout", view: () => import("./variants/doku/components/checkout-page"), requiresAuth: true },
  ],
  nav: { label: "Checkout", group: "integrations", order: 0 },
  peers: [{ slug: "convex-auth", range: "^0.1" }],
  providers: ["doku", "midtrans"],
});
