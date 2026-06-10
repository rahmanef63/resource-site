// Agentic tool collection (Tier A* — ADMIN/PAYMENTS). Channel listing is
// pure; order ops forward to a server-gated binding (payment.create-order /
// payment.view-order / payment.refund enforced in YOUR backend — DOKU
// secrets never reach the tool layer).

import { defineToolCollection, noArgs, num, obj, str } from "@/shared/agentic";
import { DOKU_CHANNELS } from "./channels";
import { formatIDR } from "./format";

export type DokuPaymentCtx = {
  /** Server-gated ops — each resolves to a short readback. */
  createOrder: (i: { amount: number; channel: string; customer: { name: string; email: string } }) => Promise<string>;
  orderStatus: (orderId: string) => Promise<string>;
  refund: (orderId: string) => Promise<string>;
};

export const dokuPaymentTools = defineToolCollection<DokuPaymentCtx>({
  namespace: "doku-payment",
  tools: [
    {
      name: "channels",
      description: "List available DOKU payment channels (id, label, group).",
      parameters: noArgs,
      run: () => DOKU_CHANNELS.map((c) => `${c.id} "${c.label}" [${c.group}]`).join("\n"),
    },
    {
      name: "create_invoice",
      dangerous: true,
      description: "Create a payment order (server-gated: payment.create-order). Amount in IDR.",
      parameters: obj({
        "amount!": num("amount in IDR"),
        "channel!": str("channel id (see channels tool)"),
        "name!": str("customer name"),
        "email!": str("customer email"),
      }),
      run: (ctx, a) =>
        ctx.createOrder({
          amount: a.amount as number,
          channel: a.channel as string,
          customer: { name: a.name as string, email: a.email as string },
        }).then((r) => `${r} (${formatIDR(a.amount as number)})`),
      },
    {
      name: "status",
      description: "Read a payment order's status (server-gated: payment.view-order).",
      parameters: obj({ "orderId!": str("order id") }),
      run: (ctx, a) => ctx.orderStatus(a.orderId as string),
    },
    {
      name: "refund",
      dangerous: true,
      description: "Refund an order (server-gated: payment.refund). Irreversible — confirm with the user first.",
      parameters: obj({ "orderId!": str("order id") }),
      run: (ctx, a) => ctx.refund(a.orderId as string),
    },
  ],
});
