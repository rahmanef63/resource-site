import { defineFeature } from "@/lib/shared/features/defineFeature";

export const midtransPaymentConfig = defineFeature({
  slug: "midtrans-payment",
  title: "Midtrans — Indonesia Payment",
  category: "integrations",
  routes: [
    { path: "/checkout", view: () => import("./components/checkout-page"), requiresAuth: true },
    { path: "/orders", view: () => import("./components/orders-page"), requiresAuth: true },
  ],
  nav: { label: "Checkout", group: "integrations", order: 0 },
  peers: [{ slug: "convex-auth", range: "^0.1" }],
  providers: ["midtrans"],
});
