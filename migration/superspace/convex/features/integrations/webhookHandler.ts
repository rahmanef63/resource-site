/**
 * Webhook Handler
 * Processes incoming webhooks from integrated services
 */

import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * Handle incoming webhook from external service
 */
export const handleIncoming = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.string(),
    secret: v.string(),
    eventType: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find the integration
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("integrationId"), args.integrationId))
      .first();

    if (!integration) {
      console.log(`Integration not found: ${args.integrationId}`);
      throw new Error("Integration not found");
    }

    // Verify webhook secret (constant-time full match)
    const isSecretValid = (a: string, b: string) => {
      if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      return result === 0;
    };

    const secretOk = integration.webhookSecret
      ? isSecretValid(integration.webhookSecret, args.secret)
      : false;
    if (!secretOk) {
      console.log(`Invalid webhook secret for ${args.integrationId}`);
      await ctx.db.insert("integrationEvents", {
        integrationId: integration._id,
        eventType: args.eventType,
        direction: "inbound",
        status: "failed",
        errorMessage: "Invalid webhook secret",
        payload: { eventType: args.eventType },
        workspaceId: args.workspaceId,
        timestamp: now,
      });
      throw new Error("Invalid webhook secret");
    }

    // Log the incoming webhook
    await ctx.db.insert("integrationEvents", {
      integrationId: integration._id,
      eventType: args.eventType,
      direction: "inbound",
      status: "success",
      payload: args.payload,
      workspaceId: args.workspaceId,
      timestamp: now,
    });

    // Process webhook based on integration and event type
    const result = await processWebhook(ctx, {
      integration,
      eventType: args.eventType,
      payload: args.payload,
      workspaceId: args.workspaceId,
    });

    // Update integration last sync time
    await ctx.db.patch(integration._id, {
      lastSyncAt: now,
      updatedAt: now,
    });

    return { success: true, processed: result };
  },
});

/**
 * Process webhook based on type
 */
async function processWebhook(
  ctx: any,
  args: {
    integration: any;
    eventType: string;
    payload: any;
    workspaceId: any;
  }
): Promise<any> {
  const { integration, eventType, payload, workspaceId } = args;

  switch (integration.integrationId) {
    case "zapier":
      return processZapierWebhook(ctx, { eventType, payload, workspaceId });

    case "slack":
      return processSlackWebhook(ctx, { eventType, payload, workspaceId });

    case "github":
      return processGitHubWebhook(ctx, { eventType, payload, workspaceId });

    case "stripe":
      return processStripeWebhook(ctx, { eventType, payload, workspaceId });

    default:
      // Generic webhook processing - just log it
      return { logged: true, eventType };
  }
}

/**
 * Process Zapier webhooks
 */
async function processZapierWebhook(
  ctx: any,
  args: { eventType: string; payload: any; workspaceId: any }
): Promise<any> {
  const { eventType, payload, workspaceId } = args;

  // Zapier can trigger various actions based on the payload
  if (payload.action) {
    switch (payload.action) {
      case "create_task":
        if (payload.data?.title) {
          const taskId = await ctx.db.insert("tasks", {
            workspaceId,
            title: payload.data.title,
            description: payload.data.description || "",
            status: "todo",
            createdAt: Date.now(),
          });
          return { created: "task", id: taskId };
        }
        break;

      case "create_notification":
        if (payload.data?.message && payload.data?.userId) {
          await ctx.db.insert("notifications", {
            workspaceId,
            userId: payload.data.userId,
            type: "integration",
            title: payload.data.title || "Zapier Notification",
            message: payload.data.message,
            isRead: false,
            createdAt: Date.now(),
          });
          return { created: "notification" };
        }
        break;
    }
  }

  return { processed: true, action: payload.action };
}

/**
 * Process Slack webhooks (events API)
 */
async function processSlackWebhook(
  ctx: any,
  args: { eventType: string; payload: any; workspaceId: any }
): Promise<any> {
  const { eventType, payload, workspaceId } = args;

  // Handle Slack URL verification challenge
  if (payload.type === "url_verification") {
    return { challenge: payload.challenge };
  }

  // Handle Slack events
  if (payload.event) {
    const event = payload.event;

    switch (event.type) {
      case "message":
        // Could create a task or note from Slack message
        return { received: "message", channel: event.channel };

      case "app_mention":
        // Bot was mentioned
        return { received: "mention", user: event.user };

      default:
        return { received: event.type };
    }
  }

  return { processed: true };
}

/**
 * Process GitHub webhooks
 */
async function processGitHubWebhook(
  ctx: any,
  args: { eventType: string; payload: any; workspaceId: any }
): Promise<any> {
  const { eventType, payload, workspaceId } = args;

  switch (eventType) {
    case "push":
      // Could create activity log for push events
      return {
        received: "push",
        repo: payload.repository?.full_name,
        commits: payload.commits?.length || 0,
      };

    case "pull_request":
      // Could create a task for PR review
      return {
        received: "pull_request",
        action: payload.action,
        number: payload.pull_request?.number,
      };

    case "issues":
      // Could sync issues to tasks
      return {
        received: "issue",
        action: payload.action,
        number: payload.issue?.number,
      };

    default:
      return { received: eventType };
  }
}

/**
 * Process Stripe webhooks
 */
async function processStripeWebhook(
  ctx: any,
  args: { eventType: string; payload: any; workspaceId: any }
): Promise<any> {
  const { eventType, payload, workspaceId } = args;

  // Stripe events are typically handled by the payment system
  // This is for workspace-level integrations
  switch (eventType) {
    case "invoice.paid":
      return { received: "invoice_paid", invoiceId: payload.data?.object?.id };

    case "customer.subscription.updated":
      return { received: "subscription_updated" };

    case "payment_intent.succeeded":
      return { received: "payment_succeeded" };

    default:
      return { received: eventType };
  }
}
