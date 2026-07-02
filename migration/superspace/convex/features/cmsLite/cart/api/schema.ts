import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  carts: defineTable({
    // The user who owns this cart
    userId: v.string(),
    // Workspace context
    workspaceId: v.string(),
    // Cart status (active, checkout, completed, abandoned)
    status: v.string(),
    // Total items in cart
    itemCount: v.number(),
    // Cart subtotal (before tax/shipping)
    subtotal: v.number(),
    // Currency for the cart (USD, EUR, etc)
    currency: v.string(),
    // Optional coupon code
    couponCode: v.optional(v.string()),
    // Optional discount amount
    discountAmount: v.optional(v.number()),
    // Last activity timestamp
    lastActivityAt: v.number(),
    // Metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_user", ["userId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"])
    .index("by_activity", ["lastActivityAt"]),

  cartItems: defineTable({
    // Reference to parent cart
    cartId: v.id("carts"),
    // The product/item being added
    productId: v.string(),
    productType: v.string(), // product, service, subscription, etc.
    // Item details
    name: v.string(),
    description: v.optional(v.string()),
    // Quantity and pricing
    quantity: v.number(),
    unitPrice: v.number(),
    currency: v.string(),
    // Optional customization/variants
    options: v.optional(v.array(v.object({
      name: v.string(),
      value: v.string(),
      priceModifier: v.optional(v.number()),
    }))),
    // Metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_cart", ["cartId"])
    .index("by_product", ["productId"]),
} as const;
