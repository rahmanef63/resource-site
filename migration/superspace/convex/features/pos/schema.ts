/**
 * POS (Point of Sale) Feature Schema
 * Comprehensive POS functionality with terminals, sessions, receipts
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const posTables = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Products (Quick access items optimized for POS terminal)
  // ═══════════════════════════════════════════════════════════════════════════════
  posProducts: defineTable({
    // Basic info
    name: v.string(),
    description: v.optional(v.string()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    
    // Pricing
    price: v.number(),
    cost: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    taxInclusive: v.optional(v.boolean()),
    
    // Categorization
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    
    // Display
    image: v.optional(v.string()),
    color: v.optional(v.string()), // Quick identify in POS grid
    displayOrder: v.optional(v.number()),
    
    // Stock tracking
    trackStock: v.optional(v.boolean()),
    stockQuantity: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    
    // Variants (sizes, colors, etc.)
    variants: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      price: v.number(),
      sku: v.optional(v.string()),
      barcode: v.optional(v.string()),
      stockQuantity: v.optional(v.number()),
    }))),
    
    // Modifiers (add-ons, customizations)
    modifierGroups: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      required: v.boolean(),
      minSelect: v.number(),
      maxSelect: v.number(),
      modifiers: v.array(v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })),
    }))),
    
    // Status
    isActive: v.boolean(),
    isFavorite: v.optional(v.boolean()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_active", ["workspaceId", "isActive"])
    .index("by_sku", ["sku"])
    .index("by_barcode", ["barcode"])
    .index("by_category", ["workspaceId", "category"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Categories (Organize products in POS terminal)
  // ═══════════════════════════════════════════════════════════════════════════════
  posCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    image: v.optional(v.string()),
    parent: v.optional(v.id("posCategories")),
    displayOrder: v.number(),
    isActive: v.boolean(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["workspaceId", "parent"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Terminals (Physical/Virtual terminals)
  // ═══════════════════════════════════════════════════════════════════════════════
  posTerminals: defineTable({
    name: v.string(),
    code: v.string(), // e.g., "TERM-001"
    description: v.optional(v.string()),
    
    // Location
    location: v.optional(v.string()),
    
    // Hardware config
    receiptPrinter: v.optional(v.object({
      type: v.string(), // "thermal", "dot_matrix", "none"
      ipAddress: v.optional(v.string()),
      port: v.optional(v.number()),
    })),
    cashDrawer: v.optional(v.object({
      enabled: v.boolean(),
      openOnSale: v.boolean(),
    })),
    barcodeScanner: v.optional(v.object({
      enabled: v.boolean(),
      type: v.string(), // "usb", "bluetooth", "none"
    })),
    
    // Settings
    defaultPaymentMethod: v.optional(v.string()),
    allowDiscounts: v.boolean(),
    maxDiscountPercent: v.optional(v.number()),
    requireCustomer: v.optional(v.boolean()),
    
    // Status
    isActive: v.boolean(),
    isOnline: v.optional(v.boolean()),
    lastPing: v.optional(v.number()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["workspaceId", "code"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Sessions (Cash register sessions)
  // ═══════════════════════════════════════════════════════════════════════════════
  posSessions: defineTable({
    terminalId: v.id("posTerminals"),
    cashierId: v.id("users"),
    
    // Session info
    sessionNumber: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("suspended")
    ),
    
    // Opening
    openedAt: v.number(),
    openingCash: v.number(),
    openingNotes: v.optional(v.string()),
    
    // Closing
    closedAt: v.optional(v.number()),
    closingCash: v.optional(v.number()),
    closingNotes: v.optional(v.string()),
    
    // Expected vs Actual
    expectedCash: v.optional(v.number()),
    cashDifference: v.optional(v.number()),
    
    // Summary
    totalSales: v.optional(v.number()),
    totalRefunds: v.optional(v.number()),
    totalDiscounts: v.optional(v.number()),
    totalTax: v.optional(v.number()),
    transactionCount: v.optional(v.number()),
    
    // Payment breakdown
    cashPayments: v.optional(v.number()),
    cardPayments: v.optional(v.number()),
    digitalPayments: v.optional(v.number()),
    otherPayments: v.optional(v.number()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_terminal", ["terminalId"])
    .index("by_cashier", ["cashierId"])
    .index("by_status", ["workspaceId", "status"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Transactions (Sales, refunds, exchanges)
  // ═══════════════════════════════════════════════════════════════════════════════
  posTransactions: defineTable({
    // Transaction identification
    transactionNumber: v.string(),
    receiptNumber: v.optional(v.string()),
    
    // Type and status
    type: v.optional(v.union(
      v.literal("sale"),
      v.literal("refund"),
      v.literal("exchange"),
      v.literal("void")
    )),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded"),
      v.literal("partially_refunded"),
      v.literal("voided")
    ),
    
    // Line items
    items: v.array(v.object({
      productId: v.optional(v.id("posProducts")),
      variantId: v.optional(v.string()),
      name: v.string(),
      sku: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      price: v.number(), // quantity * unitPrice
      discount: v.optional(v.number()),
      discountType: v.optional(v.string()), // "percent" or "fixed"
      tax: v.optional(v.number()),
      taxRate: v.optional(v.number()),
      total: v.number(),
      modifiers: v.optional(v.array(v.object({
        name: v.string(),
        price: v.number(),
      }))),
      notes: v.optional(v.string()),
    })),
    
    // Totals
    subtotal: v.number(),
    discount: v.optional(v.number()),
    discountType: v.optional(v.string()),
    discountReason: v.optional(v.string()),
    tax: v.optional(v.number()),
    tip: v.optional(v.number()),
    total: v.number(),
    
    // Payment
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
    amountTendered: v.optional(v.number()),
    changeDue: v.optional(v.number()),
    
    // Customer
    customerId: v.optional(v.id("contacts")),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    
    // Session info
    sessionId: v.optional(v.id("posSessions")),
    terminalId: v.optional(v.string()),
    cashierId: v.id("users"),
    cashierName: v.optional(v.string()),
    
    // Refund info
    originalTransactionId: v.optional(v.id("posTransactions")),
    refundedAmount: v.optional(v.number()),
    refundReason: v.optional(v.string()),
    
    // Notes
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_date", ["workspaceId", "createdAt"])
    .index("by_transaction_number", ["transactionNumber"])
    .index("by_receipt_number", ["receiptNumber"])
    .index("by_status", ["workspaceId", "status"])
    .index("by_cashier", ["cashierId"])
    .index("by_session", ["sessionId"])
    .index("by_customer", ["customerId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Discounts (Predefined discounts)
  // ═══════════════════════════════════════════════════════════════════════════════
  posDiscounts: defineTable({
    name: v.string(),
    code: v.optional(v.string()), // Promo code
    description: v.optional(v.string()),
    
    // Discount type
    type: v.union(
      v.literal("percent"),
      v.literal("fixed"),
      v.literal("bogo") // Buy one get one
    ),
    value: v.number(), // Percent or fixed amount
    
    // Applicability
    appliesTo: v.union(
      v.literal("order"),
      v.literal("item"),
      v.literal("category")
    ),
    categoryIds: v.optional(v.array(v.string())),
    productIds: v.optional(v.array(v.id("posProducts"))),
    
    // Limits
    minOrderAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    usageCount: v.optional(v.number()),
    
    // Validity
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    
    // Status
    isActive: v.boolean(),
    requiresCode: v.optional(v.boolean()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["workspaceId", "code"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Payment Methods (Custom payment methods)
  // ═══════════════════════════════════════════════════════════════════════════════
  posPaymentMethods: defineTable({
    name: v.string(),
    code: v.string(),
    type: v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("digital"),
      v.literal("voucher"),
      v.literal("other")
    ),
    icon: v.optional(v.string()),
    
    // Settings
    requiresReference: v.optional(v.boolean()),
    opensCashDrawer: v.optional(v.boolean()),
    
    // Status
    isActive: v.boolean(),
    isDefault: v.optional(v.boolean()),
    displayOrder: v.number(),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Receipts (Receipt templates and history)
  // ═══════════════════════════════════════════════════════════════════════════════
  posReceipts: defineTable({
    transactionId: v.id("posTransactions"),
    
    // Receipt content (pre-rendered for performance)
    content: v.string(), // HTML or plain text
    format: v.union(
      v.literal("thermal"),
      v.literal("a4"),
      v.literal("email")
    ),
    
    // Delivery
    printed: v.optional(v.boolean()),
    printedAt: v.optional(v.number()),
    emailed: v.optional(v.boolean()),
    emailedAt: v.optional(v.number()),
    emailedTo: v.optional(v.string()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_transaction", ["transactionId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Cash Movements (Track cash in/out)
  // ═══════════════════════════════════════════════════════════════════════════════
  posCashMovements: defineTable({
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
    
    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_session", ["sessionId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Loyalty (Customer loyalty points)
  // ═══════════════════════════════════════════════════════════════════════════════
  posLoyalty: defineTable({
    customerId: v.id("contacts"),
    
    // Points
    totalPoints: v.number(),
    availablePoints: v.number(),
    redeemedPoints: v.number(),
    expiredPoints: v.optional(v.number()),
    
    // Tier
    tier: v.optional(v.string()),
    tierProgress: v.optional(v.number()),
    
    // Stats
    totalPurchases: v.number(),
    totalSpent: v.number(),
    visitCount: v.number(),
    lastVisit: v.optional(v.number()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_customer", ["customerId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // POS Loyalty Transactions (Points history)
  // ═══════════════════════════════════════════════════════════════════════════════
  posLoyaltyTransactions: defineTable({
    loyaltyId: v.id("posLoyalty"),
    customerId: v.id("contacts"),
    transactionId: v.optional(v.id("posTransactions")),
    
    type: v.union(
      v.literal("earned"),
      v.literal("redeemed"),
      v.literal("expired"),
      v.literal("adjustment"),
      v.literal("bonus")
    ),
    points: v.number(),
    balance: v.number(), // Balance after transaction
    
    description: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_loyalty", ["loyaltyId"])
    .index("by_customer", ["customerId"]),
};

export default posTables;
