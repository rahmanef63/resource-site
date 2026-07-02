import { v } from "convex/values";
import { action } from "../../_generated";
import { logAuditEvent } from "../../activityEvents/lib/audit";
import { requirePermission } from "../../shared/auth";
import { PERMS } from "../constants";
import { internal } from "../../_generated";
import type { FunctionReference } from "convex/server";
import type { ActionCtxWithDb } from "../../../../auth/helpers";

type CurrencyMutationRefs = {
  updateSettings: FunctionReference<"mutation">;
  fetchAndUpdateRates: FunctionReference<"mutation">;
  setRate: FunctionReference<"mutation">;
  importRates: FunctionReference<"mutation">;
};
const currencyNamespace = (internal as Record<string, any>)["currency"];
const currencyMutations =
  (currencyNamespace?.mutations ??
    (internal as Record<string, any>)["features/cms_lite/currency/api/mutations"]) as CurrencyMutationRefs;

/**
 * Update currency settings for a workspace
 */
export const updateSettings = action({
  args: {
    workspaceId: v.string(),
    settings: v.object({
      baseCurrency: v.string(),
      enabledCurrencies: v.array(v.string()),
      apiKey: v.optional(v.string()),
      autoUpdate: v.boolean(),
      autoUpdateInterval: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CURRENCY.MANAGE
    );

    // Update settings
    await ctx.runMutation(currencyMutations.updateSettings, {
      workspaceId: args.workspaceId,
      settings: args.settings,
      actorId: membership.userId,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CURRENCY_SETTINGS_UPDATED",
      resourceType: "currency_settings",
      metadata: {
        baseCurrency: args.settings.baseCurrency,
        enabledCurrencies: args.settings.enabledCurrencies,
        autoUpdate: args.settings.autoUpdate,
      },
    });
  },
});

/**
 * Update exchange rates from external API
 */
export const updateRates = action({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CURRENCY.UPDATE_RATES
    );

    // Fetch and update rates
    const updatedCount = await ctx.runMutation(currencyMutations.fetchAndUpdateRates, {
      workspaceId: args.workspaceId,
      actorId: membership.userId,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CURRENCY_RATES_UPDATED",
      resourceType: "exchange_rates",
      metadata: {
        updatedCount,
        source: "api",
      },
    });

    return updatedCount;
  },
});

/**
 * Manually set exchange rate
 */
export const setExchangeRate = action({
  args: {
    workspaceId: v.string(),
    fromCurrency: v.string(),
    toCurrency: v.string(),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CURRENCY.UPDATE_RATES
    );

    // Set rate
    await ctx.runMutation(currencyMutations.setRate, {
      workspaceId: args.workspaceId,
      fromCurrency: args.fromCurrency,
      toCurrency: args.toCurrency,
      rate: args.rate,
      source: "manual",
      actorId: membership.userId,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CURRENCY_RATE_MANUALLY_SET",
      resourceType: "exchange_rate",
      metadata: {
        fromCurrency: args.fromCurrency,
        toCurrency: args.toCurrency,
        rate: args.rate,
      },
    });
  },
});

/**
 * Import exchange rates from CSV/JSON
 */
export const importRates = action({
  args: {
    workspaceId: v.string(),
    rates: v.array(v.object({
      fromCurrency: v.string(),
      toCurrency: v.string(),
      rate: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CURRENCY.UPDATE_RATES
    );

    // Import rates
    const importedCount = await ctx.runMutation(currencyMutations.importRates, {
      workspaceId: args.workspaceId,
      rates: args.rates,
      actorId: membership.userId,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CURRENCY_RATES_IMPORTED",
      resourceType: "exchange_rates",
      metadata: {
        importedCount,
        source: "import",
      },
    });

    return importedCount;
  },
});

