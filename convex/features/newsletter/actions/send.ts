"use node";

// Resend broadcast — fan out a newsletter issue to every active subscriber.
// Lazy-imports `resend` so cold-start isn't penalized when the action isn't called.
//
// Wire from your admin UI:
//   await convex.action(api.features.newsletter.actions.send.broadcast, { issueId })

import { action } from "../../../_generated/server";
import { internal } from "../../../_generated/api";
import { v } from "convex/values";

export const broadcast = action({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddr = process.env.RESEND_FROM;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");
    if (!fromAddr) throw new Error("RESEND_FROM not configured");

    const issue = await ctx.runQuery(internal.features.newsletter.queries.getIssue, {
      issueId,
    });
    if (!issue) throw new Error(`Issue not found: ${issueId}`);
    if (issue.status === "sent") {
      return { skipped: true, reason: "already-sent" };
    }

    const recipients = await ctx.runQuery(internal.features.newsletter.queries.activeSubscribers, {});
    if (recipients.length === 0) {
      return { skipped: true, reason: "no-subscribers" };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await ctx.runMutation(internal.features.newsletter.mutations.markSending, { issueId });

    let sent = 0;
    for (const r of recipients) {
      try {
        await resend.emails.send({
          from: fromAddr,
          to: r.email,
          subject: issue.subject,
          html: issue.body,
        });
        sent++;
      } catch (err) {
        console.error(`[newsletter] send failed for ${r.email}:`, err);
        // Continue — one bad address shouldn't kill the whole broadcast.
      }
    }

    await ctx.runMutation(internal.features.newsletter.mutations.markSent, {
      issueId,
      sentCount: sent,
    });

    return { skipped: false, sentCount: sent, totalRecipients: recipients.length };
  },
});
