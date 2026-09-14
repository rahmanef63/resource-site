"use node";

import { internalAction } from "../../../_generated/server";
import { internal } from "../../../_generated/api";
import { v } from "convex/values";

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 1100;
const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 200_000;

export const broadcast = internalAction({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");
    if (!from) throw new Error("RESEND_FROM not configured");

    const issue = await ctx.runQuery(internal.features.newsletter.query.getIssue, { issueId });
    if (!issue) throw new Error(`Issue not found: ${issueId}`);
    if (issue.status === "sent") return { skipped: true, reason: "already-sent" } as const;

    const recipients = await ctx.runQuery(internal.features.newsletter.query.activeSubscribers, {});
    if (recipients.length === 0) return { skipped: true, reason: "no-subscribers" } as const;

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await ctx.runMutation(internal.features.newsletter.mutation.markSending, { issueId });

    let sent = 0;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map((recipient) => resend.emails.send({
        from,
        to: recipient.email,
        subject: issue.subject,
        html: issue.body,
      })));
      for (let j = 0; j < results.length; j++) {
        if (results[j].status === "fulfilled") sent += 1;
        else console.error(`[newsletter] send failed for ${batch[j].email}`);
      }
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    await ctx.runMutation(internal.features.newsletter.mutation.markSent, { issueId, sentCount: sent });
    return { skipped: false, sentCount: sent, totalRecipients: recipients.length } as const;
  },
});

export const sendCampaign = internalAction({
  args: { subject: v.string(), body: v.string() },
  returns: v.object({ scheduled: v.boolean(), issueId: v.id("newsletterIssues") }),
  handler: async (ctx, { subject, body }) => {
    const cleanSubject = subject.trim();
    const cleanBody = body.trim();
    if (!cleanSubject || cleanSubject.length > MAX_SUBJECT_LEN) throw new Error("Invalid subject");
    if (!cleanBody || cleanBody.length > MAX_BODY_LEN) throw new Error("Invalid body");
    const issueId = await ctx.runMutation(internal.features.newsletter.mutation.createIssue, {
      subject: cleanSubject,
      body: cleanBody,
    });
    await ctx.scheduler.runAfter(0, internal.features.newsletter.actions.send.broadcast, { issueId });
    return { scheduled: true, issueId };
  },
});
