// Agentic tool collection. subscribe/unsubscribe may bind to public host flows;
// listing + broadcast MUST bind to host-authorized server implementations.
// The slice does not prescribe an auth/RBAC schema and RESEND_API_KEY stays server-side.

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";

export type ResendNewsletterCtx = {
  subscribe: (email: string) => Promise<string>;
  unsubscribe: (email: string) => Promise<string>;
  /** Host-authorized server operation. */
  listSubscribers: () => Promise<string>;
  /** Host-authorized server operation. */
  sendBroadcast: (subject: string, body: string) => Promise<string>;
};

export const resendNewsletterTools = defineToolCollection<ResendNewsletterCtx>({
  namespace: "resend-newsletter",
  instructions: "Newsletter. subscribe/unsubscribe use host adapters; list and send_campaign require host authorization. send_campaign is outward-facing and irreversible, so confirm first.",
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
      description: "List subscribers through the host-authorized server adapter.",
      parameters: noArgs,
      run: (ctx) => ctx.listSubscribers(),
    },
    {
      name: "send_campaign",
      dangerous: true,
      description: "Send a broadcast through the host-authorized server adapter. Outward-facing — confirm with the user first.",
      parameters: obj({ "subject!": str("email subject"), "body!": str("email body (markdown or html)") }),
      run: (ctx, a) => ctx.sendBroadcast(a.subject as string, a.body as string),
    },
  ],
});
