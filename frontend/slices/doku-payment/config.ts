/**
 * DOKU Payment feature config. Mirrors midtrans-payment shape so the
 * builder can swap providers without UI changes.
 */
export const dokuPaymentConfig = {
  slug: "doku-payment",
  title: "DOKU — Indonesia Payment",
  description:
    "DOKU Checkout (hosted) + Direct (VA / QRIS / e-Wallet / PayLater) for Indonesian merchants.",
  category: "payment" as const,
  providers: ["doku"] as const,
  /** Channels surfaced in the Direct picker. Editable in lib/channels.ts. */
  defaultChannels: [
    "VIRTUAL_ACCOUNT_BCA",
    "VIRTUAL_ACCOUNT_BANK_MANDIRI",
    "QRIS",
    "EMONEY_GOPAY",
    "EMONEY_OVO",
    "EMONEY_DANA",
    "EMONEY_SHOPEEPAY",
  ],
  /** UI route the consumer typically mounts. */
  routes: {
    checkout: "/checkout",
    orders: "/orders",
  },
};
