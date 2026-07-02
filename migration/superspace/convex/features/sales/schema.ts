/**
 * ERP Sales Module Schema
 * Complete sales management with quotes, invoices, payments, and analytics
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Quotes/Estimates
  quotes: defineTable({
    workspaceId: v.id("workspaces"),
    quoteNumber: v.string(),
    customerId: v.id("users"), // Will be linked to customers table
    contactId: v.optional(v.id("users")), // Specific contact
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("expired"),
      v.literal("converted")
    ),
    currency: v.string(),
    exchangeRate: v.optional(v.number()),
    validUntil: v.number(),
    terms: v.string(),
    notes: v.optional(v.string()),
    subtotal: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    discountAmount: v.number(),
    paidAmount: v.number(),
    balance: v.number(),
    items: v.array(v.object({
      id: v.string(),
      productId: v.optional(v.id("users")),
      name: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      discount: v.number(),
      taxRate: v.number(),
      taxAmount: v.number(),
      total: v.number(),
    })),
    templateId: v.optional(v.id("users")), // Quote template
    invoiceId: v.optional(v.id("users")), // Converted to invoice
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_customer", ["customerId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_number", ["quoteNumber"])
    .searchIndex("search_text", {
      searchField: "quoteNumber",
      filterFields: ["status", "customerId"],
    }),

  // Invoices
  invoices: defineTable({
    workspaceId: v.id("workspaces"),
    invoiceNumber: v.string(),
    customerId: v.id("users"),
    contactId: v.optional(v.id("users")),
    quoteId: v.optional(v.id("users")),
    salesOrderId: v.optional(v.id("users")),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("void"),
      v.literal("partial")
    ),
    currency: v.string(),
    exchangeRate: v.optional(v.number()),
    dueDate: v.number(),
    terms: v.string(),
    notes: v.optional(v.string()),
    subtotal: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    discountAmount: v.number(),
    paidAmount: v.number(),
    balance: v.number(),
    lateFee: v.optional(v.number()),
    items: v.array(v.object({
      id: v.string(),
      productId: v.optional(v.id("users")),
      name: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      discount: v.number(),
      taxRate: v.number(),
      taxAmount: v.number(),
      total: v.number(),
    })),
    templateId: v.optional(v.id("users")),
    recurringInvoiceId: v.optional(v.id("users")),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    overdueAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_customer", ["customerId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_number", ["invoiceNumber"])
    .index("by_due_date", ["dueDate", "status"])
    .searchIndex("search_text", {
      searchField: "invoiceNumber",
      filterFields: ["status", "customerId"],
    }),

  // Recurring Invoices
  recurringInvoices: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    customerId: v.id("users"),
    templateId: v.optional(v.id("users")),
    schedule: v.object({
      frequency: v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("biweekly"),
        v.literal("monthly"),
        v.literal("quarterly"),
        v.literal("yearly")
      ),
      interval: v.number(), // Every X days/weeks/months
      dayOfMonth: v.optional(v.number()),
      dayOfWeek: v.optional(v.number()),
      startDate: v.number(),
      endDate: v.optional(v.number()),
      maxGenerations: v.optional(v.number()),
    }),
    nextGenerationDate: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    currency: v.string(),
    items: v.array(v.object({
      id: v.string(),
      productId: v.optional(v.id("users")),
      name: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      discount: v.number(),
      taxRate: v.number(),
    })),
    subtotal: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    terms: v.string(),
    autoSend: v.boolean(),
    dunningEnabled: v.boolean(),
    paymentMethodId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_customer", ["customerId", "status"])
    .index("by_status", ["status", "nextGenerationDate"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["status", "customerId"],
    }),

  // Payments
  payments: defineTable({
    workspaceId: v.id("workspaces"),
    paymentNumber: v.string(),
    invoiceId: v.id("users"),
    customerId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("check"),
      v.literal("bank_transfer"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("paypal"),
      v.literal("stripe"),
      v.literal("other")
    ),
    gateway: v.optional(v.string()),
    gatewayTransactionId: v.optional(v.string()),
    gatewayResponse: v.optional(v.any()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("partially_refunded"),
      v.literal("cancelled")
    ),
    fees: v.optional(v.number()),
    refundAmount: v.number(),
    transactionDate: v.number(),
    notes: v.optional(v.string()),
    attachments: v.array(v.id("_storage")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_invoice", ["invoiceId", "createdAt"])
    .index("by_customer", ["customerId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_transaction_date", ["transactionDate", "status"])
    .searchIndex("search_text", {
      searchField: "paymentNumber",
      filterFields: ["status", "customerId"],
    }),

  // Credit Notes
  creditNotes: defineTable({
    workspaceId: v.id("workspaces"),
    creditNoteNumber: v.string(),
    customerId: v.id("users"),
    invoiceId: v.optional(v.id("users")),
    reason: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("issued"),
      v.literal("applied"),
      v.literal("expired"),
      v.literal("void")
    ),
    currency: v.string(),
    total: v.number(),
    taxAmount: v.number(),
    appliedAmount: v.number(),
    remainingAmount: v.number(),
    validUntil: v.optional(v.number()),
    notes: v.optional(v.string()),
    items: v.array(v.object({
      id: v.string(),
      productId: v.optional(v.id("users")),
      name: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      taxRate: v.number(),
      total: v.number(),
    })),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    appliedToInvoices: v.array(v.object({
      invoiceId: v.id("users"),
      amount: v.number(),
      appliedAt: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_customer", ["customerId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_number", ["creditNoteNumber"])
    .searchIndex("search_text", {
      searchField: "creditNoteNumber",
      filterFields: ["status", "customerId"],
    }),

  // Sales Orders
  salesOrders: defineTable({
    workspaceId: v.id("workspaces"),
    orderNumber: v.string(),
    customerId: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("confirmed"),
      v.literal("partial"),
      v.literal("fulfilled"),
      v.literal("cancelled")
    ),
    currency: v.string(),
    orderDate: v.number(),
    expectedDeliveryDate: v.optional(v.number()),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
    billingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
    notes: v.optional(v.string()),
    subtotal: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    items: v.array(v.object({
      id: v.string(),
      productId: v.optional(v.id("users")),
      name: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      discount: v.number(),
      taxRate: v.number(),
      taxAmount: v.number(),
      total: v.number(),
      fulfilledQuantity: v.number(),
    })),
    invoiceIds: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_customer", ["customerId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_number", ["orderNumber"])
    .searchIndex("search_text", {
      searchField: "orderNumber",
      filterFields: ["status", "customerId"],
    }),

  // Payment Plans
  paymentPlans: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    invoiceId: v.id("users"),
    customerId: v.id("users"),
    totalAmount: v.number(),
    paidAmount: v.number(),
    currency: v.string(),
    schedule: v.array(v.object({
      installmentNumber: v.number(),
      dueDate: v.number(),
      amount: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      ),
      paidAmount: v.number(),
      paidAt: v.optional(v.number()),
    })),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("defaulted"),
      v.literal("cancelled")
    ),
    lateFeePercentage: v.number(),
    autoDebit: v.boolean(),
    paymentMethodId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_invoice", ["invoiceId"])
    .index("by_customer", ["customerId", "status"])
    .index("by_status", ["status", "createdAt"]),

  // Discounts
  discounts: defineTable({
    workspaceId: v.id("workspaces"),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("percentage"),
      v.literal("fixed"),
      v.literal("volume")
    ),
    value: v.number(),
    conditions: v.array(v.object({
      type: v.union(
        v.literal("min_quantity"),
        v.literal("min_amount"),
        v.literal("customer_type"),
        v.literal("product_category"),
        v.literal("first_order")
      ),
      value: v.any(),
    })),
    usageCount: v.number(),
    maxUsage: v.optional(v.number()),
    validFrom: v.number(),
    validTo: v.optional(v.number()),
    isActive: v.boolean(),
    appliesTo: v.union(
      v.literal("all"),
      v.literal("specific_products"),
      v.literal("product_categories"),
      v.literal("customers")
    ),
    appliesToIds: v.array(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_code", ["code"])
    .index("by_active", ["isActive", "validFrom", "validTo"])
    .searchIndex("search_text", {
      searchField: "code",
      filterFields: ["isActive"],
    }),

  // Tax Rates
  taxRates: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    rate: v.number(),
    type: v.union(
      v.literal("sales_tax"),
      v.literal("vat"),
      v.literal("gst"),
      v.literal("service_tax")
    ),
    jurisdiction: v.string(),
    isDefault: v.boolean(),
    isCompound: v.boolean(),
    appliesTo: v.union(
      v.literal("all"),
      v.literal("specific_products"),
      v.literal("product_categories"),
      v.literal("customers")
    ),
    appliesToIds: v.array(v.id("users")),
    isActive: v.boolean(),
    effectiveFrom: v.number(),
    effectiveTo: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_jurisdiction", ["jurisdiction", "isActive"])
    .index("by_active", ["isActive", "effectiveFrom", "effectiveTo"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["isActive", "jurisdiction"],
    }),

  // Invoice Templates
  invoiceTemplates: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("invoice"),
      v.literal("quote"),
      v.literal("credit_note")
    ),
    html: v.string(),
    css: v.optional(v.string()),
    fields: v.array(v.object({
      id: v.string(),
      label: v.string(),
      type: v.string(),
      required: v.boolean(),
      default: v.optional(v.string()),
    })),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    version: v.number(),
    thumbnail: v.optional(v.id("_storage")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_type", ["type", "isActive"])
    .index("by_default", ["type", "isDefault"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["type", "isActive"],
    }),

  // Email Templates
  emailTemplates: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("quote"),
      v.literal("invoice"),
      v.literal("reminder"),
      v.literal("receipt"),
      v.literal("overdue"),
      v.literal("thank_you")
    ),
    subject: v.string(),
    htmlBody: v.string(),
    textBody: v.optional(v.string()),
    variables: v.array(v.object({
      name: v.string(),
      description: v.string(),
      required: v.boolean(),
    })),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_type", ["type", "isActive"])
    .index("by_default", ["type", "isDefault"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["type", "isActive"],
    }),
});