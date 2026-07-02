import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Comprehensive POS Queries
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard Data Query
// ═══════════════════════════════════════════════════════════════════════════════

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get products
    const products = await ctx.db
      .query("posProducts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Get transactions
    const transactions = await ctx.db
      .query("posTransactions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50)

    // Calculate stats
    const completedTx = transactions.filter(t => t.status === "completed")
    const totalSales = completedTx.reduce((sum, t) => sum + (t.total || 0), 0)
    const avgOrderValue = completedTx.length > 0 ? totalSales / completedTx.length : 0
    const returns = transactions.filter(t => t.status === "refunded").length

    // Popular products (by sales count)
    const productSales: Record<string, number> = {}
    for (const tx of completedTx) {
      if (tx.items) {
        for (const item of tx.items) {
          if (item.productId) {
            const pId = item.productId as string;
            productSales[pId] = (productSales[pId] || 0) + item.quantity
          }
        }
      }
    }
    
    const topProductId = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    const topProduct = topProductId 
      ? products.find(p => p._id === topProductId)?.name || "N/A"
      : "N/A"

    // Format popular products
    const popularProducts = products
      .filter(p => p.isActive)
      .slice(0, 10)
      .map(p => ({
        id: p._id,
        name: p.name,
        category: p.category || "Uncategorized",
        price: p.price,
        stock: p.stockQuantity || 0,
        image: p.image,
      }))

    // Format recent transactions
    const recentTransactions = completedTx.slice(0, 10).map(t => ({
      id: t._id,
      date: new Date(t.createdAt || t._creationTime).toISOString().split("T")[0],
      time: new Date(t.createdAt || t._creationTime).toISOString().split("T")[1].slice(0, 5),
      items: t.items?.length || 0,
      total: t.total || 0,
      method: (t.paymentMethod || "cash") as "card" | "cash" | "digital",
      status: (t.status || "completed") as "completed" | "voided" | "refunded",
    }))

    return {
      stats: {
        totalSales,
        transactionCount: completedTx.length,
        topProduct,
        averageOrderValue: Math.round(avgOrderValue * 100) / 100,
        returns,
      },
      popularProducts,
      recentTransactions,
    }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Product Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getProducts = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    onlyActive: v.optional(v.boolean()),
    onlyFavorites: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let productsQuery = ctx.db
      .query("posProducts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))

    let products = await productsQuery.take(1000)

    // Filter by active status
    if (args.onlyActive !== false) {
      products = products.filter(p => p.isActive)
    }

    // Filter by category
    if (args.category) {
      products = products.filter(p => p.category === args.category)
    }

    // Filter by favorites
    if (args.onlyFavorites) {
      products = products.filter(p => p.isFavorite)
    }

    // Search filter
    if (args.search) {
      const search = args.search.toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search) ||
        p.barcode?.toLowerCase().includes(search)
      )
    }

    // Sort by display order, then name
    products.sort((a, b) => {
      const orderA = a.displayOrder ?? 999
      const orderB = b.displayOrder ?? 999
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name)
    })

    return products
  },
})

export const getProductByBarcode = query({
  args: {
    workspaceId: v.id("workspaces"),
    barcode: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const product = await ctx.db
      .query("posProducts")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .first()

    if (product && product.workspaceId === args.workspaceId) {
      return product
    }

    // Also check variants
    const products = await ctx.db
      .query("posProducts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    for (const p of products) {
      if (p.variants) {
        const variant = p.variants.find(v => v.barcode === args.barcode)
        if (variant) {
          return { ...p, selectedVariant: variant }
        }
      }
    }

    return null
  },
})

export const getProduct = query({
  args: {
    workspaceId: v.id("workspaces"),
    productId: v.id("posProducts"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const product = await ctx.db.get(args.productId)
    if (!product || product.workspaceId !== args.workspaceId) {
      return null
    }

    return product
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Category Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getCategories = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const categories = await ctx.db
      .query("posCategories")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Sort by display order
    categories.sort((a, b) => a.displayOrder - b.displayOrder)

    return categories
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Transaction Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getTransactions = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    cashierId: v.optional(v.id("users")),
    customerId: v.optional(v.id("contacts")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let transactions = await ctx.db
      .query("posTransactions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000)

    // Apply filters
    if (args.status) {
      transactions = transactions.filter(t => t.status === args.status)
    }

    if (args.startDate) {
      transactions = transactions.filter(t => t.createdAt >= args.startDate!)
    }

    if (args.endDate) {
      transactions = transactions.filter(t => t.createdAt <= args.endDate!)
    }

    if (args.cashierId) {
      transactions = transactions.filter(t => t.cashierId === args.cashierId)
    }

    if (args.customerId) {
      transactions = transactions.filter(t => t.customerId === args.customerId)
    }

    // Apply limit
    if (args.limit) {
      transactions = transactions.slice(0, args.limit)
    }

    return transactions
  },
})

export const getTransaction = query({
  args: {
    workspaceId: v.id("workspaces"),
    transactionId: v.id("posTransactions"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const transaction = await ctx.db.get(args.transactionId)
    if (!transaction || transaction.workspaceId !== args.workspaceId) {
      return null
    }

    return transaction
  },
})

export const getTransactionByNumber = query({
  args: {
    workspaceId: v.id("workspaces"),
    transactionNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const transaction = await ctx.db
      .query("posTransactions")
      .withIndex("by_transaction_number", (q) => q.eq("transactionNumber", args.transactionNumber))
      .first()

    if (!transaction || transaction.workspaceId !== args.workspaceId) {
      return null
    }

    return transaction
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Session Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getSessions = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    terminalId: v.optional(v.id("posTerminals")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let sessions = await ctx.db
      .query("posSessions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000)

    if (args.status) {
      sessions = sessions.filter(s => s.status === args.status)
    }

    if (args.terminalId) {
      sessions = sessions.filter(s => s.terminalId === args.terminalId)
    }

    if (args.limit) {
      sessions = sessions.slice(0, args.limit)
    }

    return sessions
  },
})

export const getActiveSession = query({
  args: {
    workspaceId: v.id("workspaces"),
    terminalId: v.optional(v.id("posTerminals")),
    cashierId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let sessions = await ctx.db
      .query("posSessions")
      .withIndex("by_status", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("status", "open")
      )
      .take(1000)

    if (args.terminalId) {
      sessions = sessions.filter(s => s.terminalId === args.terminalId)
    }

    if (args.cashierId) {
      sessions = sessions.filter(s => s.cashierId === args.cashierId)
    }

    return sessions[0] || null
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Terminal Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getTerminals = query({
  args: {
    workspaceId: v.id("workspaces"),
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let terminals = await ctx.db
      .query("posTerminals")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.onlyActive !== false) {
      terminals = terminals.filter(t => t.isActive)
    }

    return terminals
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Sales Analytics Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getTodaySales = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const todayStart = new Date().setHours(0, 0, 0, 0)

    const transactions = await ctx.db
      .query("posTransactions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gte(q.field("createdAt"), todayStart))
      .take(1000)

    const completedTransactions = transactions.filter(t => t.status === "completed")
    const refundedTransactions = transactions.filter(t => t.status === "refunded" || t.status === "partially_refunded")

    const totalSales = completedTransactions.reduce((sum, t) => sum + (t.total || 0), 0)
    const totalRefunds = refundedTransactions.reduce((sum, t) => sum + (t.refundedAmount || t.total || 0), 0)
    const netSales = totalSales - totalRefunds

    // Payment breakdown
    const cashTotal = completedTransactions
      .filter(t => t.paymentMethod === "cash")
      .reduce((sum, t) => sum + (t.total || 0), 0)
    const cardTotal = completedTransactions
      .filter(t => t.paymentMethod === "card")
      .reduce((sum, t) => sum + (t.total || 0), 0)
    const digitalTotal = completedTransactions
      .filter(t => t.paymentMethod === "digital")
      .reduce((sum, t) => sum + (t.total || 0), 0)

    // Top selling items
    const itemSales: Record<string, { name: string; quantity: number; total: number }> = {}
    for (const t of completedTransactions) {
      for (const item of t.items) {
        const key = item.productId?.toString() || item.name
        if (!itemSales[key]) {
          itemSales[key] = { name: item.name, quantity: 0, total: 0 }
        }
        itemSales[key].quantity += item.quantity
        itemSales[key].total += item.total
      }
    }
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return {
      total: totalSales,
      netSales,
      refunds: totalRefunds,
      count: completedTransactions.length,
      averageTransaction: completedTransactions.length > 0 
        ? totalSales / completedTransactions.length 
        : 0,
      payments: {
        cash: cashTotal,
        card: cardTotal,
        digital: digitalTotal,
      },
      topItems,
    }
  },
})

export const getSalesReport = query({
  args: {
    workspaceId: v.id("workspaces"),
    startDate: v.number(),
    endDate: v.number(),
    groupBy: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const transactions = await ctx.db
      .query("posTransactions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate)
        )
      )
      .take(1000)

    const completedTransactions = transactions.filter(t => t.status === "completed")

    const totalSales = completedTransactions.reduce((sum, t) => sum + (t.total || 0), 0)
    const totalTax = completedTransactions.reduce((sum, t) => sum + (t.tax || 0), 0)
    const totalDiscount = completedTransactions.reduce((sum, t) => sum + (t.discount || 0), 0)

    // Group by date
    const groupBy = args.groupBy || "day"
    const salesByDate: Record<string, number> = {}

    for (const t of completedTransactions) {
      const date = new Date(t.createdAt)
      let key: string

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0]
      } else if (groupBy === "week") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split("T")[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      salesByDate[key] = (salesByDate[key] || 0) + (t.total || 0)
    }

    return {
      totalSales,
      totalTax,
      totalDiscount,
      transactionCount: completedTransactions.length,
      averageTransaction: completedTransactions.length > 0 
        ? totalSales / completedTransactions.length 
        : 0,
      salesByDate: Object.entries(salesByDate)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Discount Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getDiscounts = query({
  args: {
    workspaceId: v.id("workspaces"),
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let discounts = await ctx.db
      .query("posDiscounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.onlyActive !== false) {
      const now = Date.now()
      discounts = discounts.filter(d => {
        if (!d.isActive) return false
        if (d.startDate && d.startDate > now) return false
        if (d.endDate && d.endDate < now) return false
        if (d.usageLimit && d.usageCount && d.usageCount >= d.usageLimit) return false
        return true
      })
    }

    return discounts
  },
})

export const validateDiscountCode = query({
  args: {
    workspaceId: v.id("workspaces"),
    code: v.string(),
    orderTotal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const discount = await ctx.db
      .query("posDiscounts")
      .withIndex("by_code", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("code", args.code)
      )
      .first()

    if (!discount) {
      return { valid: false, error: "Invalid discount code" }
    }

    if (!discount.isActive) {
      return { valid: false, error: "Discount is no longer active" }
    }

    const now = Date.now()
    if (discount.startDate && discount.startDate > now) {
      return { valid: false, error: "Discount is not yet active" }
    }

    if (discount.endDate && discount.endDate < now) {
      return { valid: false, error: "Discount has expired" }
    }

    if (discount.usageLimit && discount.usageCount && discount.usageCount >= discount.usageLimit) {
      return { valid: false, error: "Discount usage limit reached" }
    }

    if (discount.minOrderAmount && args.orderTotal && args.orderTotal < discount.minOrderAmount) {
      return { 
        valid: false, 
        error: `Minimum order amount is $${discount.minOrderAmount.toFixed(2)}` 
      }
    }

    return { valid: true, discount }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Loyalty Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getCustomerLoyalty = query({
  args: {
    workspaceId: v.id("workspaces"),
    customerId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const loyalty = await ctx.db
      .query("posLoyalty")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first()

    if (!loyalty || loyalty.workspaceId !== args.workspaceId) {
      return null
    }

    return loyalty
  },
})

export const getLoyaltyHistory = query({
  args: {
    workspaceId: v.id("workspaces"),
    customerId: v.id("contacts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let history = await ctx.db
      .query("posLoyaltyTransactions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .take(1000)

    history = history.filter(h => h.workspaceId === args.workspaceId)

    if (args.limit) {
      history = history.slice(0, args.limit)
    }

    return history
  },
})
