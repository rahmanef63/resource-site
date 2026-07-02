import { mutation, type Id } from "../../_generated";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "../../_generated";
import { logAuditEvent } from "../../../lib/audit";
import { assertDocWorkspace, ensureWorkspaceMembership } from "../../../lib/rbac";


/**
 * Add an item to the cart.
 *
 * SECURITY (C2 price-tampering fix): The client MUST NOT provide unitPrice,
 * currency, name, or description. These are looked up server-side from the
 * canonical product/service record so a malicious client cannot send a $0
 * price. The client only provides product identity + quantity + non-price
 * option selections.
 */
export const addItem = mutation({
  args: {
    workspaceId: v.string(),
    productId: v.string(),
    productType: v.string(),
    quantity: v.number(),
    // Variant selections only — priceModifier is IGNORED if sent by client
    // (server recomputes any per-option price modifier from the canonical
    // product record so tampering at this layer is also blocked).
    options: v.optional(
      v.array(
        v.object({
          name: v.string(),
          value: v.string(),
        })
      )
    ),
  },
  returns: v.object({
    cartId: v.id("carts"),
    itemId: v.id("cartItems"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Cart must be scoped to a workspace the caller belongs to.
    await ensureWorkspaceMembership(ctx, args.workspaceId);

    if (args.quantity <= 0) {
      throw new ConvexError("Quantity must be positive");
    }

    // ------------------------------------------------------------------
    // Server-side product/price lookup (anti-tampering)
    // ------------------------------------------------------------------
    // Resolve the canonical record and pull price, currency, name from
    // there. Reject unknown productType so we can't be tricked into
    // skipping the lookup with a bogus type string.
    let canonicalName: string;
    let canonicalDescription: string | undefined;
    let canonicalPrice: number;
    let canonicalCurrency: string;

    if (args.productType === "product") {
      const product = await ctx.db.get(args.productId as Id<"products">);
      if (!product) {
        throw new ConvexError("Product not found in this workspace");
      }
      // L1 fix — ensure the referenced product actually belongs to the cart's
      // workspace; otherwise a client could add cross-tenant products to a
      // local cart and leak price/availability info.
      assertDocWorkspace(
        product as unknown as { workspaceId?: string },
        args.workspaceId,
        "product",
      );
      if (product.available === false || product.status !== "active") {
        throw new ConvexError("Product is not available for purchase");
      }
      canonicalName = product.titleEn ?? product.titleId ?? product.slug;
      canonicalDescription = product.descEn ?? product.descId ?? undefined;
      canonicalPrice = product.price;
      canonicalCurrency = product.currency;
    } else if (args.productType === "service") {
      const service = await ctx.db.get(args.productId as Id<"services">);
      if (!service) {
        throw new ConvexError("Product not found in this workspace");
      }
      // L1 fix — see product branch above.
      assertDocWorkspace(
        service as unknown as { workspaceId?: string },
        args.workspaceId,
        "service",
      );
      if (service.active === false) {
        throw new ConvexError("Service is not available for purchase");
      }
      canonicalName = service.labelEn ?? service.labelId ?? service.slug;
      canonicalDescription = undefined;
      // Services schema has no `price`/`currency`; treat as zero-priced
      // contact-for-quote items. Hard-reject if a price-bearing flow
      // expects one — caller can switch to "product" type instead.
      canonicalPrice = 0;
      canonicalCurrency = "USD";
    } else {
      throw new ConvexError(`Unsupported productType: ${args.productType}`);
    }

    // Find or create active cart
    let cart = await (ctx.db
      .query("carts")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first());

    if (!cart) {
      // Create new cart
      const cartId = await ctx.db.insert("carts", {
        userId: identity.subject,
        workspaceId: args.workspaceId,
        status: "active",
        itemCount: 0,
        subtotal: 0,
        currency: canonicalCurrency,
        lastActivityAt: Date.now(),
        createdBy: identity.subject,
        updatedBy: identity.subject,
      });
      cart = await ctx.db.get(cartId);
      if (!cart) throw new ConvexError("Failed to create cart");
    }

    if (!cart) {
      throw new ConvexError("Cart not available");
    }
    const cartDoc = cart;

    // Options: drop any client-supplied priceModifier — server is the
    // source of truth for price. We store option selection (name/value)
    // only. If a future variant pricing model is added it must come from
    // the canonical product record, not the client.
    const sanitizedOptions = args.options?.map((o) => ({
      name: o.name,
      value: o.value,
    }));

    // Add item to cart with server-fetched price/currency/name
    const itemId = await ctx.db.insert("cartItems", {
      cartId: cartDoc._id,
      productId: args.productId,
      productType: args.productType,
      name: canonicalName,
      description: canonicalDescription,
      quantity: args.quantity,
      unitPrice: canonicalPrice,
      currency: canonicalCurrency,
      options: sanitizedOptions,
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    // Update cart totals
    const items = await (ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q: any) => q.eq("cartId", cartDoc._id))
      .take(1000));

    const subtotal = items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

    await ctx.db.patch(cartDoc._id, {
      itemCount: items.length,
      subtotal,
      lastActivityAt: Date.now(),
      updatedBy: identity.subject,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: identity.subject,
      action: "cart.add_item",
      resourceType: "cart",
      resourceId: cartDoc._id,
      metadata: {
        itemId,
        productId: args.productId,
        quantity: args.quantity,
      },
    });

    return { cartId: cartDoc._id as Id<"carts">, itemId };
  },
});

/**
 * Update item quantity in cart
 */
export const updateItemQuantity = mutation({
  args: {
    itemId: v.id("cartItems"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Get item and verify cart ownership
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new ConvexError("Item not found");
    }

    const cart = await ctx.db.get(item.cartId);
    if (!cart || cart.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    // Re-check workspace membership on every write so users expelled from
    // a workspace can no longer mutate carts they previously created there.
    await ensureWorkspaceMembership(ctx, cart.workspaceId);

    if (args.quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await ctx.db.delete(args.itemId);
    } else {
      // Update quantity
      await ctx.db.patch(args.itemId, {
        quantity: args.quantity,
        updatedBy: identity.subject,
      });
    }

    // Update cart totals
    const items = await (ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q: any) => q.eq("cartId", cart._id))
      .take(1000));

    const subtotal = items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

    await ctx.db.patch(cart._id, {
      itemCount: items.length,
      subtotal,
      lastActivityAt: Date.now(),
      updatedBy: identity.subject,
    });

    await logAuditEvent(ctx, {
      workspaceId: cart.workspaceId,
      actor: identity.subject,
      action: "cart.update_quantity",
      resourceType: "cart",
      resourceId: cart._id,
      metadata: {
        itemId: args.itemId,
        quantity: args.quantity,
      },
    });

    return null;
  },
});

/**
 * Clear all items from cart
 */
export const clearCart = mutation({
  args: {
    cartId: v.id("carts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Verify cart ownership
    const cart = await ctx.db.get(args.cartId);
    if (!cart || cart.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    // Re-check workspace membership on every write so users expelled from
    // a workspace can no longer mutate carts they previously created there.
    await ensureWorkspaceMembership(ctx, cart.workspaceId);

    // Delete all items
    const items = await (ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q: any) => q.eq("cartId", args.cartId))
      .take(1000));

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    // Reset cart totals
    await ctx.db.patch(args.cartId, {
      itemCount: 0,
      subtotal: 0,
      lastActivityAt: Date.now(),
      updatedBy: identity.subject,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    });

    await logAuditEvent(ctx, {
      workspaceId: cart.workspaceId,
      actor: identity.subject,
      action: "cart.clear",
      resourceType: "cart",
      resourceId: cart._id,
      metadata: {
        itemsRemoved: items.length,
      },
    });

    return null;
  },
});
