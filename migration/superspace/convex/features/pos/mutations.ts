import { v } from "convex/values"
import { mutation, type QueryCtx, type MutationCtx } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Comprehensive POS Mutations
 */

// Helper to get current user ID
async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const candidateIds = await resolveCandidateUserIds(ctx)
  if (candidateIds.length === 0) throw new Error("Not authenticated")
  return candidateIds[0] as Id<"users">
}

// Generate unique transaction number
function generateTransactionNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `TXN-${dateStr}-${random}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// Product Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createProduct = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    price: v.number(),
    cost: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()),
    color: v.optional(v.string()),
    trackStock: v.optional(v.boolean()),
    stockQuantity: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("posProducts", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      sku: args.sku,
      barcode: args.barcode,
      price: args.price,
      cost: args.cost,
      taxRate: args.taxRate,
      category: args.category,
      image: args.image,
      color: args.color,
      trackStock: args.trackStock,
      stockQuantity: args.stockQuantity,
      lowStockThreshold: args.lowStockThreshold,
      isActive: true,
      createdAt: Date.now(),
      createdBy: userId,
      updatedAt: Date.now(),
      updatedBy: userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.product.created",
      resourceType: "posProduct",
      resourceId: String(id),
      metadata: { name: args.name, price: args.price },
    })

    return { id, success: true }
  },
})

export const updateProduct = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    productId: v.id("posProducts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    price: v.optional(v.number()),
    cost: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()),
    color: v.optional(v.string()),
    trackStock: v.optional(v.boolean()),
    stockQuantity: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const product = await ctx.db.get(args.productId)
    if (!product || product.workspaceId !== args.workspaceId) {
      throw new Error("Product not found")
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
      updatedBy: userId,
    }

    const fields = [
      "name", "description", "sku", "barcode", "price", "cost", 
      "taxRate", "category", "image", "color", "trackStock",
      "stockQuantity", "lowStockThreshold", "isActive", "isFavorite", "displayOrder"
    ]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.productId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.product.updated",
      resourceType: "posProduct",
      resourceId: String(args.productId),
      metadata: { name: product.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt" && k !== "updatedBy") },
    })

    return { success: true }
  },
})

export const deleteProduct = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    productId: v.id("posProducts"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const product = await ctx.db.get(args.productId)
    if (!product || product.workspaceId !== args.workspaceId) {
      throw new Error("Product not found")
    }

    // Soft delete - just mark as inactive
    await ctx.db.patch(args.productId, {
      isActive: false,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.product.deleted",
      resourceType: "posProduct",
      resourceId: String(args.productId),
      metadata: { name: product.name, softDelete: true },
    })

    return { success: true }
  },
})

export const updateStock = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    productId: v.id("posProducts"),
    adjustment: v.number(), // Can be positive or negative
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const product = await ctx.db.get(args.productId)
    if (!product || product.workspaceId !== args.workspaceId) {
      throw new Error("Product not found")
    }

    const currentStock = product.stockQuantity || 0
    const newStock = Math.max(0, currentStock + args.adjustment)

    await ctx.db.patch(args.productId, {
      stockQuantity: newStock,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.product.stock.adjusted",
      resourceType: "posProduct",
      resourceId: String(args.productId),
      metadata: { name: product.name, adjustment: args.adjustment, previousStock: currentStock, newStock, reason: args.reason },
    })

    return { success: true, previousStock: currentStock, newStock }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Category Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createCategory = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    parent: v.optional(v.id("posCategories")),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    // Get max display order
    const categories = await ctx.db
      .query("posCategories")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const maxOrder = categories.reduce((max, c) => Math.max(max, c.displayOrder), 0)

    const id = await ctx.db.insert("posCategories", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      icon: args.icon,
      color: args.color,
      parent: args.parent,
      displayOrder: args.displayOrder ?? maxOrder + 1,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.category.created",
      resourceType: "posCategory",
      resourceId: String(id),
      metadata: { name: args.name },
    })

    return { id, success: true }
  },
})

export const updateCategory = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    categoryId: v.id("posCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const category = await ctx.db.get(args.categoryId)
    if (!category || category.workspaceId !== args.workspaceId) {
      throw new Error("Category not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = ["name", "description", "icon", "color", "displayOrder", "isActive"]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.categoryId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.category.updated",
      resourceType: "posCategory",
      resourceId: String(args.categoryId),
      metadata: { name: category.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Transaction Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createTransaction = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    items: v.array(v.object({
      productId: v.optional(v.id("posProducts")),
      variantId: v.optional(v.string()),
      name: v.string(),
      sku: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      price: v.number(),
      discount: v.optional(v.number()),
      discountType: v.optional(v.string()),
      tax: v.optional(v.number()),
      taxRate: v.optional(v.number()),
      total: v.number(),
      modifiers: v.optional(v.array(v.object({
        name: v.string(),
        price: v.number(),
      }))),
      notes: v.optional(v.string()),
    })),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("digital"),
      v.literal("split"),
      v.literal("other")
    ),
    payments: v.optional(v.array(v.object({
      method: v.string(),
      amount: v.number(),
      reference: v.optional(v.string()),
      cardLast4: v.optional(v.string()),
      cardType: v.optional(v.string()),
    }))),
    subtotal: v.number(),
    discount: v.optional(v.number()),
    discountType: v.optional(v.string()),
    discountReason: v.optional(v.string()),
    tax: v.optional(v.number()),
    tip: v.optional(v.number()),
    total: v.number(),
    amountTendered: v.optional(v.number()),
    changeDue: v.optional(v.number()),
    customerId: v.optional(v.id("contacts")),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    sessionId: v.optional(v.id("posSessions")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    // Get user name for cashier
    const user = await ctx.db.get(userId)
    const cashierName = user?.name || user?.email || "Unknown"

    const transactionNumber = generateTransactionNumber()
    const receiptNumber = `RCP-${Date.now()}`

    const id = await ctx.db.insert("posTransactions", {
      workspaceId: args.workspaceId,
      transactionNumber,
      receiptNumber,
      type: "sale",
      status: "completed",
      items: args.items,
      paymentMethod: args.paymentMethod,
      payments: args.payments,
      subtotal: args.subtotal,
      discount: args.discount,
      discountType: args.discountType,
      discountReason: args.discountReason,
      tax: args.tax,
      tip: args.tip,
      total: args.total,
      amountTendered: args.amountTendered,
      changeDue: args.changeDue,
      customerId: args.customerId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      sessionId: args.sessionId,
      cashierId: userId,
      cashierName,
      notes: args.notes,
      createdAt: Date.now(),
    })

    // Update stock for tracked products
    for (const item of args.items) {
      if (item.productId) {
        const product = await ctx.db.get(item.productId)
        if (product && product.trackStock && product.stockQuantity !== undefined) {
          await ctx.db.patch(item.productId, {
            stockQuantity: Math.max(0, product.stockQuantity - item.quantity),
            updatedAt: Date.now(),
          })
        }
      }
    }

    // Update session totals if session exists
    if (args.sessionId) {
      const session = await ctx.db.get(args.sessionId)
      if (session && session.status === "open") {
        const paymentType = args.paymentMethod
        await ctx.db.patch(args.sessionId, {
          totalSales: (session.totalSales || 0) + args.total,
          transactionCount: (session.transactionCount || 0) + 1,
          totalTax: (session.totalTax || 0) + (args.tax || 0),
          totalDiscounts: (session.totalDiscounts || 0) + (args.discount || 0),
          ...(paymentType === "cash" && { cashPayments: (session.cashPayments || 0) + args.total }),
          ...(paymentType === "card" && { cardPayments: (session.cardPayments || 0) + args.total }),
          ...(paymentType === "digital" && { digitalPayments: (session.digitalPayments || 0) + args.total }),
        })
      }
    }

    // Award loyalty points if customer exists
    if (args.customerId) {
      const loyalty = await ctx.db
        .query("posLoyalty")
        .withIndex("by_customer", (q) => q.eq("customerId", args.customerId!))
        .first()

      if (loyalty && loyalty.workspaceId === args.workspaceId) {
        // 1 point per dollar spent
        const pointsEarned = Math.floor(args.total)
        const newTotal = loyalty.totalPoints + pointsEarned
        const newAvailable = loyalty.availablePoints + pointsEarned

        await ctx.db.patch(loyalty._id, {
          totalPoints: newTotal,
          availablePoints: newAvailable,
          totalPurchases: loyalty.totalPurchases + 1,
          totalSpent: loyalty.totalSpent + args.total,
          visitCount: loyalty.visitCount + 1,
          lastVisit: Date.now(),
          updatedAt: Date.now(),
        })

        // Record loyalty transaction
        await ctx.db.insert("posLoyaltyTransactions", {
          workspaceId: args.workspaceId,
          loyaltyId: loyalty._id,
          customerId: args.customerId,
          transactionId: id,
          type: "earned",
          points: pointsEarned,
          balance: newAvailable,
          description: `Earned from purchase ${transactionNumber}`,
          createdAt: Date.now(),
        })
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.transaction.created",
      resourceType: "posTransaction",
      resourceId: String(id),
      metadata: { transactionNumber, total: args.total, paymentMethod: args.paymentMethod },
    })

    return { id, transactionNumber, receiptNumber, success: true }
  },
})

export const refundTransaction = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    transactionId: v.id("posTransactions"),
    items: v.optional(v.array(v.object({
      productId: v.optional(v.id("posProducts")),
      name: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      price: v.number(),
      total: v.number(),
    }))),
    amount: v.number(),
    reason: v.string(),
    restoreStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const originalTransaction = await ctx.db.get(args.transactionId)
    if (!originalTransaction || originalTransaction.workspaceId !== args.workspaceId) {
      throw new Error("Transaction not found")
    }

    if (originalTransaction.status === "voided") {
      throw new Error("Cannot refund a voided transaction")
    }

    const alreadyRefunded = originalTransaction.refundedAmount || 0
    const maxRefundable = originalTransaction.total - alreadyRefunded

    if (args.amount > maxRefundable) {
      throw new Error(`Maximum refundable amount is $${maxRefundable.toFixed(2)}`)
    }

    // Create refund transaction
    const user = await ctx.db.get(userId)
    const cashierName = user?.name || user?.email || "Unknown"
    const transactionNumber = generateTransactionNumber()

    // Transform items for refund (negate amounts)
    const refundItems = args.items?.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: -item.quantity,
      unitPrice: item.unitPrice,
      price: -item.price,
      total: -item.total,
    })) || []

    const refundId = await ctx.db.insert("posTransactions", {
      workspaceId: args.workspaceId,
      transactionNumber,
      type: "refund",
      status: "completed",
      items: refundItems,
      paymentMethod: originalTransaction.paymentMethod,
      subtotal: -args.amount,
      total: -args.amount,
      originalTransactionId: args.transactionId,
      refundReason: args.reason,
      cashierId: userId,
      cashierName,
      customerId: originalTransaction.customerId,
      customerName: originalTransaction.customerName,
      createdAt: Date.now(),
    })

    // Update original transaction
    const newRefundedAmount = alreadyRefunded + args.amount
    const newStatus = newRefundedAmount >= originalTransaction.total 
      ? "refunded" 
      : "partially_refunded"

    await ctx.db.patch(args.transactionId, {
      status: newStatus,
      refundedAmount: newRefundedAmount,
    })

    // Restore stock if requested
    if (args.restoreStock && args.items) {
      for (const item of args.items) {
        if (item.productId) {
          const product = await ctx.db.get(item.productId)
          if (product && product.trackStock) {
            await ctx.db.patch(item.productId, {
              stockQuantity: (product.stockQuantity || 0) + item.quantity,
              updatedAt: Date.now(),
            })
          }
        }
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.transaction.refunded",
      resourceType: "posTransaction",
      resourceId: String(args.transactionId),
      metadata: { refundId: String(refundId), transactionNumber, amount: args.amount, reason: args.reason, newStatus },
    })

    return { id: refundId, transactionNumber, success: true }
  },
})

export const voidTransaction = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    transactionId: v.id("posTransactions"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const transaction = await ctx.db.get(args.transactionId)
    if (!transaction || transaction.workspaceId !== args.workspaceId) {
      throw new Error("Transaction not found")
    }

    if (transaction.status !== "completed") {
      throw new Error("Only completed transactions can be voided")
    }

    // Check if within same day
    const transactionDate = new Date(transaction.createdAt).toDateString()
    const today = new Date().toDateString()
    if (transactionDate !== today) {
      throw new Error("Transactions can only be voided on the same day. Use refund instead.")
    }

    await ctx.db.patch(args.transactionId, {
      status: "voided",
      internalNotes: `Voided: ${args.reason}`,
    })

    // Restore stock
    for (const item of transaction.items) {
      if (item.productId) {
        const product = await ctx.db.get(item.productId)
        if (product && product.trackStock) {
          await ctx.db.patch(item.productId, {
            stockQuantity: (product.stockQuantity || 0) + item.quantity,
            updatedAt: Date.now(),
          })
        }
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.transaction.voided",
      resourceType: "posTransaction",
      resourceId: String(args.transactionId),
      metadata: { transactionNumber: transaction.transactionNumber, reason: args.reason, total: transaction.total },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Session Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const openSession = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    terminalId: v.id("posTerminals"),
    openingCash: v.number(),
    openingNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    // Check for existing open session
    const existingSession = await ctx.db
      .query("posSessions")
      .withIndex("by_terminal", (q) => q.eq("terminalId", args.terminalId))
      .filter((q) => q.eq(q.field("status"), "open"))
      .first()

    if (existingSession) {
      throw new Error("A session is already open on this terminal")
    }

    const sessionNumber = `SES-${Date.now()}`

    const id = await ctx.db.insert("posSessions", {
      workspaceId: args.workspaceId,
      terminalId: args.terminalId,
      cashierId: userId,
      sessionNumber,
      status: "open",
      openedAt: Date.now(),
      openingCash: args.openingCash,
      openingNotes: args.openingNotes,
      totalSales: 0,
      totalRefunds: 0,
      totalDiscounts: 0,
      totalTax: 0,
      transactionCount: 0,
      cashPayments: 0,
      cardPayments: 0,
      digitalPayments: 0,
      otherPayments: 0,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.session.opened",
      resourceType: "posSession",
      resourceId: String(id),
      metadata: { sessionNumber, terminalId: String(args.terminalId), openingCash: args.openingCash },
    })

    return { id, sessionNumber, success: true }
  },
})

export const closeSession = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    sessionId: v.id("posSessions"),
    closingCash: v.number(),
    closingNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const session = await ctx.db.get(args.sessionId)
    if (!session || session.workspaceId !== args.workspaceId) {
      throw new Error("Session not found")
    }

    if (session.status !== "open") {
      throw new Error("Session is not open")
    }

    // Calculate expected cash
    const expectedCash = session.openingCash + (session.cashPayments || 0)
    const cashDifference = args.closingCash - expectedCash

    await ctx.db.patch(args.sessionId, {
      status: "closed",
      closedAt: Date.now(),
      closingCash: args.closingCash,
      closingNotes: args.closingNotes,
      expectedCash,
      cashDifference,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.session.closed",
      resourceType: "posSession",
      resourceId: String(args.sessionId),
      metadata: { sessionNumber: session.sessionNumber, closingCash: args.closingCash, expectedCash, cashDifference },
    })

    return {
      success: true,
      expectedCash,
      actualCash: args.closingCash,
      difference: cashDifference
    }
  },
})

export const recordCashMovement = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    sessionId: v.id("posSessions"),
    type: v.union(
      v.literal("cash_in"),
      v.literal("cash_out"),
      v.literal("float"),
      v.literal("drop")
    ),
    amount: v.number(),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const session = await ctx.db.get(args.sessionId)
    if (!session || session.workspaceId !== args.workspaceId) {
      throw new Error("Session not found")
    }

    if (session.status !== "open") {
      throw new Error("Session is not open")
    }

    const id = await ctx.db.insert("posCashMovements", {
      workspaceId: args.workspaceId,
      sessionId: args.sessionId,
      type: args.type,
      amount: args.amount,
      reason: args.reason,
      notes: args.notes,
      createdBy: userId,
      createdAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: `pos.cashMovement.${args.type}`,
      resourceType: "posCashMovement",
      resourceId: String(id),
      metadata: { sessionId: String(args.sessionId), type: args.type, amount: args.amount, reason: args.reason },
    })

    return { id, success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Terminal Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createTerminal = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    allowDiscounts: v.optional(v.boolean()),
    maxDiscountPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    // Check for duplicate code
    const existing = await ctx.db
      .query("posTerminals")
      .withIndex("by_code", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("code", args.code)
      )
      .first()

    if (existing) {
      throw new Error("Terminal code already exists")
    }

    const id = await ctx.db.insert("posTerminals", {
      workspaceId: args.workspaceId,
      name: args.name,
      code: args.code,
      description: args.description,
      location: args.location,
      allowDiscounts: args.allowDiscounts ?? true,
      maxDiscountPercent: args.maxDiscountPercent,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.terminal.created",
      resourceType: "posTerminal",
      resourceId: String(id),
      metadata: { name: args.name, code: args.code },
    })

    return { id, success: true }
  },
})

export const updateTerminal = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    terminalId: v.id("posTerminals"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    allowDiscounts: v.optional(v.boolean()),
    maxDiscountPercent: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const terminal = await ctx.db.get(args.terminalId)
    if (!terminal || terminal.workspaceId !== args.workspaceId) {
      throw new Error("Terminal not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = ["name", "description", "location", "allowDiscounts", "maxDiscountPercent", "isActive"]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.terminalId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.terminal.updated",
      resourceType: "posTerminal",
      resourceId: String(args.terminalId),
      metadata: { name: terminal.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Discount Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createDiscount = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.union(v.literal("percent"), v.literal("fixed"), v.literal("bogo")),
    value: v.number(),
    appliesTo: v.union(v.literal("order"), v.literal("item"), v.literal("category")),
    minOrderAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    requiresCode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    // Check for duplicate code
    if (args.code) {
      const existing = await ctx.db
        .query("posDiscounts")
        .withIndex("by_code", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("code", args.code!)
        )
        .first()

      if (existing) {
        throw new Error("Discount code already exists")
      }
    }

    const id = await ctx.db.insert("posDiscounts", {
      workspaceId: args.workspaceId,
      name: args.name,
      code: args.code,
      description: args.description,
      type: args.type,
      value: args.value,
      appliesTo: args.appliesTo,
      minOrderAmount: args.minOrderAmount,
      maxDiscountAmount: args.maxDiscountAmount,
      usageLimit: args.usageLimit,
      usageCount: 0,
      startDate: args.startDate,
      endDate: args.endDate,
      requiresCode: args.requiresCode,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.discount.created",
      resourceType: "posDiscount",
      resourceId: String(id),
      metadata: { name: args.name, code: args.code, type: args.type, value: args.value },
    })

    return { id, success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Loyalty Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const enrollCustomerLoyalty = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    customerId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    // Check if already enrolled
    const existing = await ctx.db
      .query("posLoyalty")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first()

    if (existing && existing.workspaceId === args.workspaceId) {
      throw new Error("Customer is already enrolled in loyalty program")
    }

    const id = await ctx.db.insert("posLoyalty", {
      workspaceId: args.workspaceId,
      customerId: args.customerId,
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      totalPurchases: 0,
      totalSpent: 0,
      visitCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.loyalty.enrolled",
      resourceType: "posLoyalty",
      resourceId: String(id),
      metadata: { customerId: String(args.customerId) },
    })

    return { id, success: true }
  },
})

export const redeemLoyaltyPoints = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    customerId: v.id("contacts"),
    points: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.POS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const loyalty = await ctx.db
      .query("posLoyalty")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first()

    if (!loyalty || loyalty.workspaceId !== args.workspaceId) {
      throw new Error("Customer not enrolled in loyalty program")
    }

    if (loyalty.availablePoints < args.points) {
      throw new Error(`Insufficient points. Available: ${loyalty.availablePoints}`)
    }

    const newAvailable = loyalty.availablePoints - args.points
    const newRedeemed = loyalty.redeemedPoints + args.points

    await ctx.db.patch(loyalty._id, {
      availablePoints: newAvailable,
      redeemedPoints: newRedeemed,
      updatedAt: Date.now(),
    })

    // Record redemption
    await ctx.db.insert("posLoyaltyTransactions", {
      workspaceId: args.workspaceId,
      loyaltyId: loyalty._id,
      customerId: args.customerId,
      type: "redeemed",
      points: -args.points,
      balance: newAvailable,
      description: args.description || "Points redeemed",
      createdAt: Date.now(),
    })

    // Calculate discount value (100 points = $1)
    const discountValue = args.points / 100

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pos.loyalty.redeemed",
      resourceType: "posLoyalty",
      resourceId: String(loyalty._id),
      metadata: { customerId: String(args.customerId), points: args.points, remainingPoints: newAvailable, discountValue },
    })

    return { success: true, discountValue, remainingPoints: newAvailable }
  },
})
