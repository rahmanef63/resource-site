import { defineFeature } from "@/lib/shared/features/defineFeature";

export const midtransPaymentConfig = defineFeature({
  slug: "midtrans-payment",
  title: "Midtrans Payment",
  category: "payment",
  routes: [
    { path: "/checkout", view: () => import("./components/checkout-page"), requiresAuth: true },
    { path: "/orders", view: () => import("./components/orders-page"), requiresAuth: true },
  ],
  nav: { label: "Checkout", group: "payment", order: 0 },
  peers: [{ slug: "convex-auth", range: "^0.1" }],
  providers: ["midtrans"],
});
