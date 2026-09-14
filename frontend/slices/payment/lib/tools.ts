import { DOKU_CHANNELS, formatIDR } from "./doku-core";

type ObjectSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};
const objectSchema = (properties: Record<string, unknown>, required: string[]): ObjectSchema => ({
  type: "object", properties, required, additionalProperties: false,
});
const text = (description: string) => ({ type: "string", description });
const number = (description: string) => ({ type: "number", description });
const noArgs = objectSchema({}, []);

export type DokuPaymentCtx = {
  createOrder: (input: { amount: number; channel: string; customer: { name: string; email: string } }) => Promise<string>;
  orderStatus: (orderId: string) => Promise<string>;
  refund: (orderId: string) => Promise<string>;
};

export const dokuPaymentTools = {
  namespace: "doku-payment",
  instructions: "DOKU payments. channels lists options; create_invoice charges the customer and refund reverses it. Both move money, confirm with the user first.",
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
      parameters: objectSchema(
        { amount: number("amount in IDR"), channel: text("channel id (see channels tool)"), name: text("customer name"), email: text("customer email") },
        ["amount", "channel", "name", "email"],
      ),
      run: (ctx: DokuPaymentCtx, args: Record<string, unknown>) =>
        ctx.createOrder({
          amount: Number(args.amount),
          channel: String(args.channel),
          customer: { name: String(args.name), email: String(args.email) },
        }).then((result) => `${result} (${formatIDR(Number(args.amount))})`),
    },
    {
      name: "status",
      description: "Read a payment order's status (server-gated: payment.view-order).",
      parameters: objectSchema({ orderId: text("order id") }, ["orderId"]),
      run: (ctx: DokuPaymentCtx, args: Record<string, unknown>) => ctx.orderStatus(String(args.orderId)),
    },
    {
      name: "refund",
      dangerous: true,
      description: "Refund an order (server-gated: payment.refund). Irreversible — confirm with the user first.",
      parameters: objectSchema({ orderId: text("order id") }, ["orderId"]),
      run: (ctx: DokuPaymentCtx, args: Record<string, unknown>) => ctx.refund(String(args.orderId)),
    },
  ],
};

export type MidtransPaymentCtx = {
  createOrder: (input: { amount: number; customer: { name: string; email: string } }) => Promise<string>;
  orderStatus: (orderId: string) => Promise<string>;
  refund: (orderId: string) => Promise<string>;
};

export const midtransPaymentTools = {
  namespace: "midtrans-payment",
  instructions: "Midtrans payments. create_invoice charges and refund reverses. Both move money, confirm with the user first.",
  tools: [
    {
      name: "create_invoice",
      dangerous: true,
      description: "Create a Midtrans payment order (server-gated: payment.create). Amount in IDR.",
      parameters: objectSchema({ amount: number("amount in IDR"), name: text("customer name"), email: text("customer email") }, ["amount", "name", "email"]),
      run: (ctx: MidtransPaymentCtx, args: Record<string, unknown>) =>
        ctx.createOrder({ amount: Number(args.amount), customer: { name: String(args.name), email: String(args.email) } }),
    },
    {
      name: "status",
      description: "Read a payment order's status (server-gated).",
      parameters: objectSchema({ orderId: text("order id") }, ["orderId"]),
      run: (ctx: MidtransPaymentCtx, args: Record<string, unknown>) => ctx.orderStatus(String(args.orderId)),
    },
    {
      name: "refund",
      dangerous: true,
      description: "Refund an order (server-gated: payment.refund). Irreversible — confirm with the user first.",
      parameters: objectSchema({ orderId: text("order id") }, ["orderId"]),
      run: (ctx: MidtransPaymentCtx, args: Record<string, unknown>) => ctx.refund(String(args.orderId)),
    },
  ],
};
