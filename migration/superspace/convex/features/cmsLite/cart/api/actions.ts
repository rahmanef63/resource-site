import { v } from "convex/values";
import { action } from "../../_generated";
import { logAuditEvent } from "../../activityEvents/lib/audit";
import { requirePermission } from "../../shared/auth";
import { mutations } from "../../_generated";
import { PERMS } from "../constants";
import type { ActionCtxWithDb } from "../../../../auth/helpers";

const cartMutations =
  mutations["features/cms_lite/cart/api/mutations"];

/**
 * Add item(s) to a user's cart
 */
export const addToCart = action({
  args: {
    workspaceId: v.string(),
    productId: v.string(),
    quantity: v.optional(v.number()),
    options: v.optional(v.array(v.object({
      name: v.string(),
      value: v.string(),
      priceModifier: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CART.USE
    );

    // Add item to cart
    const cartId = await actionCtx.runMutation(cartMutations.addItem, {
      workspaceId: args.workspaceId,
      productId: args.productId,
      quantity: args.quantity || 1,
      options: args.options,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CART_ITEM_ADDED",
      resourceType: "cart",
      resourceId: cartId as string,
      metadata: {
        productId: args.productId,
        quantity: args.quantity || 1,
      },
    });

    return cartId;
  },
});

/**
 * Update cart item quantity or options
 */
export const updateCartItem = action({
  args: {
    workspaceId: v.string(),
    cartId: v.id("carts"),
    itemId: v.id("cartItems"),
    quantity: v.optional(v.number()),
    options: v.optional(v.array(v.object({
      name: v.string(),
      value: v.string(),
      priceModifier: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CART.USE
    );

    // Update cart item
    await actionCtx.runMutation(cartMutations.updateItem, {
      workspaceId: args.workspaceId,
      cartId: args.cartId,
      itemId: args.itemId,
      quantity: args.quantity,
      options: args.options,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CART_ITEM_UPDATED",
      resourceType: "cart_item",
      resourceId: args.itemId as string,
      metadata: {
        cartId: args.cartId,
        quantity: args.quantity,
      },
    });
  },
});

/**
 * Remove item from cart
 */
export const removeFromCart = action({
  args: {
    workspaceId: v.string(),
    cartId: v.id("carts"),
    itemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CART.USE
    );

    // Remove item
    await actionCtx.runMutation(cartMutations.removeItem, {
      workspaceId: args.workspaceId,
      cartId: args.cartId,
      itemId: args.itemId,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CART_ITEM_REMOVED",
      resourceType: "cart_item",
      resourceId: args.itemId as string,
      metadata: {
        cartId: args.cartId,
      },
    });
  },
});

/**
 * Clear all items from cart
 */
export const clearCart = action({
  args: {
    workspaceId: v.string(),
    cartId: v.id("carts"),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CART.USE
    );

    // Clear cart
    await actionCtx.runMutation(cartMutations.clear, {
      workspaceId: args.workspaceId,
      cartId: args.cartId,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CART_CLEARED",
      resourceType: "cart",
      resourceId: args.cartId as string,
    });
  },
});

/**
 * Begin checkout process for cart
 */
export const startCheckout = action({
  args: {
    workspaceId: v.string(),
    cartId: v.id("carts"),
    checkoutData: v.object({
      email: v.string(),
      shippingAddress: v.object({
        name: v.string(),
        address1: v.string(),
        address2: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        country: v.string(),
        postalCode: v.string(),
      }),
      paymentMethod: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CART.CHECKOUT
    );

    // Start checkout
    const checkoutId = await actionCtx.runMutation(
      cartMutations.startCheckout,
      {
        workspaceId: args.workspaceId,
        cartId: args.cartId,
        checkoutData: args.checkoutData,
      },
    );

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CART_CHECKOUT_STARTED",
      resourceType: "cart",
      resourceId: args.cartId as string,
      metadata: {
        checkoutId,
        email: args.checkoutData.email,
      },
    });

    return checkoutId;
  },
});

/**
 * Apply coupon code to cart
 */
export const applyCoupon = action({
  args: {
    workspaceId: v.string(),
    cartId: v.id("carts"),
    couponCode: v.string(),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    // Check permissions
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.CART.USE
    );

    // Apply coupon
    const discountAmount = await actionCtx.runMutation(cartMutations.applyCoupon, {
      workspaceId: args.workspaceId,
      cartId: args.cartId,
      couponCode: args.couponCode,
    });

    // Log audit event
    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      actorUserId: membership.userDocId,
      action: "CART_COUPON_APPLIED",
      resourceType: "cart",
      resourceId: args.cartId as string,
      metadata: {
        couponCode: args.couponCode,
        discountAmount,
      },
    });

    return discountAmount;
  },
});
