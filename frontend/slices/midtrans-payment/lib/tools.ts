// Agentic tool collection (Tier A* — ADMIN/PAYMENTS). All ops forward to a
// server-gated binding (payment.create / payment.refund enforced in YOUR
// backend — Midtrans server key never reaches the tool layer).

import { defineToolCollection, num, obj, str } from "@/shared/agentic";

export type MidtransPaymentCtx = {
  /** Server-gated ops — each resolves to a short readback. */
  createOrder: (i: { amount: number; customer: { name: string; email: string } }) => Promise<string>;
  orderStatus: (orderId: string) => Promise<string>;
  refund: (orderId: string) => Promise<string>;
};

export const midtransPaymentTools = defineToolCollection<MidtransPaymentCtx>({
  namespace: "midtrans-payment",
  tools: [
    {
      name: "create_invoice",
      description: "Create a Midtrans payment order (server-gated: payment.create). Amount in IDR.",
      parameters: obj({
        "amount!": num("amount in IDR"),
        "name!": str("customer name"),
        "email!": str("customer email"),
      }),
      run: (ctx, a) =>
        ctx.createOrder({ amount: a.amount as number, customer: { name: a.name as string, email: a.email as string } }),
    },
    {
      name: "status",
      description: "Read a payment order's status (server-gated).",
      parameters: obj({ "orderId!": str("order id") }),
      run: (ctx, a) => ctx.orderStatus(a.orderId as string),
    },
    {
      name: "refund",
      description: "Refund an order (server-gated: payment.refund). Irreversible — confirm with the user first.",
      parameters: obj({ "orderId!": str("order id") }),
      run: (ctx, a) => ctx.refund(a.orderId as string),
    },
  ],
});
