// Agentic tool collection (Tier A* — ADMIN). subscribe/unsubscribe are the
// standard public ops; listing + broadcast MUST be bound to server-gated
// implementations (newsletter.list-subscribers / newsletter.send-broadcast;
// RESEND_API_KEY stays server-side).

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";

export type ResendNewsletterCtx = {
  subscribe: (email: string) => Promise<string>;
  unsubscribe: (email: string) => Promise<string>;
  /** Server-gated (newsletter.list-subscribers). */
  listSubscribers: () => Promise<string>;
  /** Server-gated (newsletter.send-broadcast). */
  sendBroadcast: (subject: string, body: string) => Promise<string>;
};

export const resendNewsletterTools = defineToolCollection<ResendNewsletterCtx>({
  namespace: "resend-newsletter",
  instructions: "Newsletter. subscribe/unsubscribe are standard; list is server-gated; send_campaign broadcasts to all subscribers (outward-facing, irreversible), confirm first.",
  tools: [
    {
      name: "subscribe",
      description: "Subscribe an email address to the newsletter.",
      parameters: obj({ "email!": str("subscriber email") }),
      run: (ctx, a) => ctx.subscribe(a.email as string),
    },
    {
      name: "unsubscribe",
      description: "Unsubscribe an email address.",
      parameters: obj({ "email!": str("subscriber email") }),
      run: (ctx, a) => ctx.unsubscribe(a.email as string),
    },
    {
      name: "list",
      description: "List subscribers (server-gated: newsletter.list-subscribers).",
      parameters: noArgs,
      run: (ctx) => ctx.listSubscribers(),
    },
    {
      name: "send_campaign",
      dangerous: true,
      description: "Send a broadcast to all subscribers (server-gated: newsletter.send-broadcast). Outward-facing — confirm with the user first.",
      parameters: obj({ "subject!": str("email subject"), "body!": str("email body (markdown or html)") }),
      run: (ctx, a) => ctx.sendBroadcast(a.subject as string, a.body as string),
    },
  ],
});
