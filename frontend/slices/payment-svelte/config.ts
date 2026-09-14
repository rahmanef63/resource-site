export type PaymentSvelteFeature = {
  slug: "payment";
  title: string;
  category: "integrations";
  providers: readonly ["doku", "midtrans"];
};

export const paymentSvelteFeature: PaymentSvelteFeature = {
  slug: "payment",
  title: "Payment — Indonesia PSP (DOKU · Midtrans)",
  category: "integrations",
  providers: ["doku", "midtrans"],
};
