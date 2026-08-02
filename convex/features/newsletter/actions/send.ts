"use node";

// Resend broadcast — fan out a newsletter issue to every active subscriber.
// Lazy-imports `resend` so cold-start isn't penalized when the action isn't called.
//
// Wiring (TWO entry points):
//
//   1. Public, authenticated:    api.features.newsletter.actions.send.broadcastPublic
//      Caller MUST be logged in AND in the admins table. Use from your admin UI.
//
//   2. Internal:                  internal.features.newsletter.actions.send.broadcast
//      Bypasses authn — only callable from server-side scheduler/cron/other actions
//      that have already gated authz themselves.

import { action, internalAction } from "../../../_generated/server";
import { internal } from "../../../_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Internal worker — does the actual fanout. Fan-out batched to respect
// Resend free-tier rate limit (10 req/s). Sequential within a batch so a
// single Convex action stays under the 10-min ceiling at scale.
export const broadcast = internalAction({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddr = process.env.RESEND_FROM;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");
    if (!fromAddr) throw new Error("RESEND_FROM not configured");

    const issue = await ctx.runQuery(internal.features.newsletter.query.getIssue, {
      issueId,
    });
    if (!issue) throw new Error(`Issue not found: ${issueId}`);
    if (issue.status === "sent") {
      return { skipped: true, reason: "already-sent" };
    }

    const recipients = await ctx.runQuery(internal.features.newsletter.query.activeSubscribers, {});
    if (recipients.length === 0) {
      return { skipped: true, reason: "no-subscribers" };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await ctx.runMutation(internal.features.newsletter.mutation.markSending, { issueId });

    // Resend free tier = 10 req/s. Batch 8/sec to leave headroom.
    const BATCH_SIZE = 8;
    const BATCH_DELAY_MS = 1100;

    let sent = 0;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((r) =>
          resend.emails.send({
            from: fromAddr,
            to: r.email,
            subject: issue.subject,
            html: issue.body,
          }),
        ),
      );
      for (let j = 0; j < results.length; j++) {
        const res = results[j];
        if (res.status === "fulfilled") sent++;
        else console.error(`[newsletter] send failed for ${batch[j].email}:`, res.reason);
      }
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    await ctx.runMutation(internal.features.newsletter.mutation.markSent, {
      issueId,
      sentCount: sent,
    });

    return { skipped: false, sentCount: sent, totalRecipients: recipients.length };
  },
});

// Public wrapper — gates authz then schedules the internal worker.
// Schedule (vs awaiting) so the HTTP caller doesn't hang for the full fanout.
//
// Admin gate: callers must be present in userProfiles with role="admin"
// (or be the SUPER_ADMIN_EMAIL account). Plain logged-in users cannot
// fire broadcasts — they'd otherwise be able to spam every subscriber.
export const broadcastPublic = action({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized — sign in required");
    const isAdmin = await ctx.runQuery(internal.features.newsletter.query.isAdminUser, { userId });
    if (!isAdmin) throw new Error("Forbidden — admin role required");
    await ctx.scheduler.runAfter(0, internal.features.newsletter.actions.send.broadcast, {
      issueId,
    });
    return { scheduled: true, issueId };
  },
});
