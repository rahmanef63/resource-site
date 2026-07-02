import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requireAdminForWorkspace } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

const currencySettingsArgs = {
  workspaceId: v.string(),
  settings: v.object({
    baseCurrency: v.string(),
    enabledCurrencies: v.array(v.string()),
    apiKey: v.optional(v.string()),
    autoUpdate: v.boolean(),
    autoUpdateInterval: v.number(),
  }),
  actorId: v.optional(v.string()),
} as const;

export const updateSettings = mutation({
  args: currencySettingsArgs,
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("cms_lite_currencySettings")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .unique();

    const now = Date.now();
    const payload = {
      baseCurrency: args.settings.baseCurrency,
      enabledCurrencies: args.settings.enabledCurrencies,
      apiKey: args.settings.apiKey,
      autoUpdate: args.settings.autoUpdate,
      autoUpdateInterval: args.settings.autoUpdateInterval,
      lastUpdateAt: now,
      updatedBy: args.actorId ?? actor.clerkUserId,
    };

    let id;
    let action;

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      id = existing._id;
      action = "currency.update_settings";
    } else {
      id = await ctx.db.insert("cms_lite_currencySettings", {
        workspaceId: args.workspaceId,
        ...payload,
        createdBy: args.actorId ?? actor.clerkUserId,
      });
      action = "currency.create_settings";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "currencySettings",
      resourceId: id,
      action,
      changes: args.settings,
    });

    return id;
  },
});

export const fetchAndUpdateRates = mutation({
  args: {
    workspaceId: v.string(),
    actorId: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const settings = await ctx.db
      .query("cms_lite_currencySettings")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .unique();

    if (!settings) {
      throw new Error("Currency settings not configured for workspace");
    }

    const now = Date.now();

    await ctx.db.patch(settings._id, {
      lastUpdateAt: now,
      updatedBy: args.actorId ?? actor.clerkUserId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "currencySettings",
      resourceId: settings._id,
      action: "currency.fetch_rates",
      changes: { source: args.source },
    });

    // TODO: Integrate with external provider. For now, no external rates updated.
    return 0;
  },
});

export const setRate = mutation({
  args: {
    workspaceId: v.string(),
    fromCurrency: v.string(),
    toCurrency: v.string(),
    rate: v.number(),
    source: v.optional(v.string()),
    actorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("cms_lite_exchangeRates")
      .withIndex("by_pair", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
          .eq("fromCurrency", args.fromCurrency)
          .eq("toCurrency", args.toCurrency)
      )
      .unique();

    const now = Date.now();
    const payload = {
      rate: args.rate,
      timestamp: now,
      source: args.source ?? "manual",
      updatedBy: args.actorId ?? actor.clerkUserId,
    };

    let id;
    let action;

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      id = existing._id;
      action = "currency.update_rate";
    } else {
      id = await ctx.db.insert("cms_lite_exchangeRates", {
        workspaceId: args.workspaceId,
        fromCurrency: args.fromCurrency,
        toCurrency: args.toCurrency,
        ...payload,
        createdBy: args.actorId ?? actor.clerkUserId,
      });
      action = "currency.set_rate";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "exchangeRate",
      resourceId: id,
      action,
      changes: { from: args.fromCurrency, to: args.toCurrency, rate: args.rate },
    });

    return id;
  },
});

export const importRates = mutation({
  args: {
    workspaceId: v.string(),
    rates: v.array(v.object({
      fromCurrency: v.string(),
      toCurrency: v.string(),
      rate: v.number(),
      source: v.optional(v.string()),
    })),
    actorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);
    let updated = 0;

    for (const rate of args.rates) {
      const existing = await ctx.db
        .query("cms_lite_exchangeRates")
        .withIndex("by_pair", (q: any) =>
          q.eq("workspaceId", args.workspaceId)
            .eq("fromCurrency", rate.fromCurrency)
            .eq("toCurrency", rate.toCurrency)
        )
        .unique();

      const now = Date.now();
      const payload = {
        rate: rate.rate,
        timestamp: now,
        source: rate.source ?? "import",
        updatedBy: args.actorId ?? actor.clerkUserId,
      };

      if (existing) {
        await ctx.db.patch(existing._id, payload);
      } else {
        await ctx.db.insert("cms_lite_exchangeRates", {
          workspaceId: args.workspaceId,
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          ...payload,
          createdBy: args.actorId ?? actor.clerkUserId,
        });
      }

      updated += 1;
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "exchangeRate",
      action: "currency.import_rates",
      changes: { count: updated },
    });

    return updated;
  },
});
