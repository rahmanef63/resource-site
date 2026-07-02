/**
 * Inventory Module Schema
 * Defines database tables for inventory management
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// Shared address shape reused across inventory documents
const address = {
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.optional(v.string()),
  country: v.string(),
  postalCode: v.string(),
};

export default defineSchema({
  // Inventory Items
  inventoryItems: defineTable({
    // Basic information
    sku: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.id("inventoryCategories")),

    // Item details
    itemType: v.union(
      v.literal("product"),
      v.literal("service"),
      v.literal("bundle"),
      v.literal("kit")
    ),
    unit: v.string(), // e.g., "pcs", "kg", "ltr", "box"
    weight: v.optional(v.number()), // in kg
    dimensions: v.optional(v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
      unit: v.string(), // "cm" or "inch"
    })),

    // Pricing
    costPrice: v.number(),
    sellingPrice: v.number(),
    currency: v.string(),
    priceList: v.optional(v.array(v.object({
      name: v.string(),
      price: v.number(),
      currency: v.string(),
      minQuantity: v.number(),
    }))),

    // Inventory settings
    trackStock: v.boolean(),
    trackSerial: v.boolean(),
    trackBatch: v.boolean(),
    trackExpiry: v.boolean(),

    // Stock levels
    minStock: v.number(),
    maxStock: v.number(),
    reorderPoint: v.number(),
    reorderQuantity: v.number(),
    leadTime: v.number(), // days

    // Location
    defaultWarehouse: v.optional(v.id("warehouses")),
    defaultLocation: v.optional(v.string()), // Bin location

    // Suppliers
    preferredSupplier: v.optional(v.id("suppliers")),
    suppliers: v.array(v.id("suppliers")),

    // Images and documents
    images: v.array(v.id("_storage")),
    documents: v.array(v.object({
      name: v.string(),
      fileId: v.id("_storage"),
      type: v.string(),
    })),

    // Attributes and variants
    attributes: v.array(v.object({
      name: v.string(),
      value: v.string(),
      type: v.string(), // text, number, date, boolean
    })),
    variants: v.array(v.id("inventoryItems")), // For product variants

    // Status and flags
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    isTaxable: v.boolean(),
    tags: v.array(v.string()),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_sku", ["sku"])
    .index("by_workspace", ["workspaceId"])
    .index("by_category", ["workspaceId", "category"])
    .index("by_supplier", ["workspaceId", "preferredSupplier"]),

  // Inventory Categories
  inventoryCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    parent: v.optional(v.id("inventoryCategories")),
    path: v.string(), // Full path: /Category/Subcategory
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_slug", ["workspaceId", "slug"])
    .index("by_parent", ["workspaceId", "parent"]),

  // Warehouses
  warehouses: defineTable({
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("warehouse"),
      v.literal("store"),
      v.literal("virtual"),
      v.literal("main"),
      v.literal("branch"),
      v.literal("distribution"),
      v.literal("transit")
    ),

    // Address
    address: v.optional(v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
      postalCode: v.string(),
    })),

    // Contact
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),

    // Settings
    isActive: v.boolean(),
    isDefault: v.boolean(),
    timezone: v.string(),
    currency: v.string(),

    // Capacity
    capacity: v.optional(v.object({
      volume: v.number(),
      weight: v.number(),
      unit: v.string(),
    })),

    // Operating hours
    operatingHours: v.optional(v.array(v.object({
      day: v.string(),
      open: v.string(),
      close: v.string(),
      closed: v.boolean(),
    }))),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"]),

  // Stock Levels (Current stock per item per warehouse)
  stockLevels: defineTable({
    item: v.id("inventoryItems"),
    warehouse: v.id("warehouses"),
    location: v.optional(v.string()), // Bin location

    // Quantities
    quantityOnHand: v.number(),
    quantityCommitted: v.number(), // Committed to orders
    quantityAvailable: v.number(), // Available to sell
    quantityOnOrder: v.number(), // On purchase order
    quantityInTransit: v.number(), // Between warehouses

    // Values
    totalCost: v.number(),
    averageCost: v.number(),

    // Timestamps
    lastStockIn: v.optional(v.number()),
    lastStockOut: v.optional(v.number()),
    lastCounted: v.optional(v.number()),

    // Workspace
    workspaceId: v.id("workspaces"),
    updatedAt: v.number(),
  })
    .index("by_item", ["item"])
    .index("by_warehouse", ["warehouse"])
    .index("by_item_warehouse", ["item", "warehouse"])
    .index("by_low_stock", ["warehouse", "quantityAvailable"]),

  // Stock Movements
  stockMovements: defineTable({
    // References
    item: v.id("inventoryItems"),
    warehouse: v.id("warehouses"),
    referenceType: v.union(
      v.literal("purchase"),
      v.literal("sale"),
      v.literal("adjustment"),
      v.literal("transfer"),
      v.literal("return"),
      v.literal("assembly"),
      v.literal("disassembly")
    ),
    referenceId: v.optional(v.id("_table")), // ID of related document

    // Movement details
    movementType: v.union(
      v.literal("in"), // Stock in
      v.literal("out"), // Stock out
      v.literal("transfer"), // Between locations
      v.literal("adjustment") // Manual adjustment
    ),

    // Quantities
    quantity: v.number(), // Positive for in, negative for out
    unitCost: v.optional(v.number()),
    totalCost: v.optional(v.number()),

    // Tracking
    batchNumber: v.optional(v.string()),
    serialNumbers: v.array(v.string()),
    expiryDate: v.optional(v.number()),
    manufacturingDate: v.optional(v.number()),

    // Location
    fromLocation: v.optional(v.string()),
    toLocation: v.optional(v.string()),
    fromWarehouse: v.optional(v.id("warehouses")),
    toWarehouse: v.optional(v.id("warehouses")),

    // Reason and notes
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),

    // User and timestamps
    userId: v.id("users"),
    timestamp: v.number(),
    workspaceId: v.id("workspaces"),
  })
    .index("by_item", ["item"])
    .index("by_warehouse", ["warehouse"])
    .index("by_reference", ["referenceType", "referenceId"])
    .index("by_date", ["timestamp"]),

  // Stock Adjustments
  stockAdjustments: defineTable({
    // Reference
    warehouse: v.id("warehouses"),
    adjustmentNumber: v.string(),

    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("completed"),
      v.literal("cancelled")
    ),

    // Adjustment details
    adjustmentType: v.union(
      v.literal("physical_count"),
      v.literal("damage"),
      v.literal("loss"),
      v.literal("theft"),
      v.literal("expiry"),
      v.literal("return"),
      v.literal("other")
    ),

    // Reason and notes
    reason: v.string(),
    notes: v.optional(v.string()),

    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    approvalNotes: v.optional(v.string()),

    // Items being adjusted
    items: v.array(v.object({
      item: v.id("inventoryItems"),
      currentQuantity: v.number(),
      adjustedQuantity: v.number(),
      difference: v.number(),
      unitCost: v.number(),
      totalCost: v.number(),
      location: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),

    // Totals
    totalItems: v.number(),
    totalValue: v.number(),

    // Attachments
    attachments: v.array(v.id("_storage")),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_number", ["adjustmentNumber"])
    .index("by_status", ["workspaceId", "status"]),

  // Suppliers
  suppliers: defineTable({
    // Basic information
    code: v.string(),
    name: v.string(),
    displayName: v.optional(v.string()),
    type: v.union(
      v.literal("individual"),
      v.literal("company")
    ),

    // Contact details
    email: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),

    // Address
    billingAddress: v.object(address),
    shippingAddress: v.object(address),

    // Tax and business
    taxId: v.optional(v.string()),
    businessLicense: v.optional(v.string()),
    paymentTerms: v.optional(v.string()), // e.g., "NET 30"

    // Banking
    bankAccount: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      routingNumber: v.string(),
      accountType: v.string(),
      currency: v.string(),
    })),

    // Performance
    rating: v.number(), // 1-5
    onTimeDeliveryRate: v.number(), // Percentage
    qualityRating: v.number(), // 1-5
    leadTime: v.number(), // Average in days

    // Status and preferences
    isActive: v.boolean(),
    isPreferred: v.boolean(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("check"),
      v.literal("transfer"),
      v.literal("card"),
      v.literal("crypto")
    ),
    currency: v.string(),
    tags: v.array(v.string()),

    // Statistics
    totalPurchases: v.number(),
    totalSpent: v.number(),
    orderCount: v.number(),
    lastOrderDate: v.optional(v.number()),

    // Contacts
    contacts: v.array(v.object({
      name: v.string(),
      title: v.optional(v.string()),
      email: v.string(),
      phone: v.optional(v.string()),
      isPrimary: v.boolean(),
    })),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"])
    .index("by_email", ["email"])
    .index("by_active", ["workspaceId", "isActive"]),

  // Purchase Orders
  purchaseOrders: defineTable({
    // Purchase order information
    orderNumber: v.string(),
    reference: v.optional(v.string()),

    // Supplier
    supplier: v.id("suppliers"),
    supplierAddress: v.object(address),

    // Dates
    orderDate: v.number(),
    expectedDate: v.optional(v.number()),
    receivedDate: v.optional(v.number()),

    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("sent"),
      v.literal("partial"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("closed")
    ),

    // Financial
    currency: v.string(),
    exchangeRate: v.number(),
    subTotal: v.number(),
    taxAmount: v.number(),
    discountAmount: v.number(),
    totalAmount: v.number(),
    paidAmount: v.number(),

    // Terms and conditions
    paymentTerms: v.string(),
    deliveryTerms: v.string(),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),

    // Delivery
    deliveryAddress: v.object(address),
    deliveryMethod: v.union(
      v.literal("pickup"),
      v.literal("delivery"),
      v.literal("shipping")
    ),

    // Warehouse
    warehouse: v.id("warehouses"),

    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),

    // Attachments
    attachments: v.array(v.id("_storage")),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_number", ["orderNumber"])
    .index("by_supplier", ["supplier"])
    .index("by_status", ["workspaceId", "status"])
    .index("by_date", ["orderDate"]),

  // Purchase Order Items
  purchaseOrderItems: defineTable({
    // References
    purchaseOrder: v.id("purchaseOrders"),
    item: v.optional(v.id("inventoryItems")),
    customItem: v.optional(v.string()), // For items not in inventory

    // Item details
    description: v.string(),
    specifications: v.optional(v.string()),

    // Quantities
    quantity: v.number(),
    quantityReceived: v.number(),
    quantityPending: v.number(),

    // Pricing
    unitPrice: v.number(),
    discount: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    totalAmount: v.number(),

    // Delivery
    expectedDate: v.optional(v.number()),
    receivedDate: v.optional(v.number()),

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("ordered"),
      v.literal("partial"),
      v.literal("received"),
      v.literal("cancelled")
    ),

    // Notes
    notes: v.optional(v.string()),

    // Workspace
    workspaceId: v.id("workspaces"),
  })
    .index("by_po", ["purchaseOrder"])
    .index("by_item", ["item"]),

  // Inventory Transfers
  inventoryTransfers: defineTable({
    // Transfer information
    transferNumber: v.string(),
    reference: v.optional(v.string()),

    // Locations
    fromWarehouse: v.id("warehouses"),
    toWarehouse: v.id("warehouses"),
    fromLocation: v.optional(v.string()),
    toLocation: v.optional(v.string()),

    // Dates
    transferDate: v.number(),
    expectedDate: v.optional(v.number()),
    completedDate: v.optional(v.number()),

    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("in_transit"),
      v.literal("received"),
      v.literal("completed"),
      v.literal("cancelled")
    ),

    // Transport details
    carrier: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    shippingMethod: v.optional(v.string()),
    shippingCost: v.optional(v.number()),

    // Notes and instructions
    notes: v.optional(v.string()),
    instructions: v.optional(v.string()),

    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),

    // Items
    items: v.array(v.object({
      item: v.id("inventoryItems"),
      quantity: v.number(),
      quantityShipped: v.number(),
      quantityReceived: v.number(),
      unitCost: v.number(),
      totalCost: v.number(),
      batchNumber: v.optional(v.string()),
      serialNumbers: v.array(v.string()),
      expiryDate: v.optional(v.number()),
    })),

    // Totals
    totalItems: v.number(),
    totalCost: v.number(),

    // Attachments
    attachments: v.array(v.id("_storage")),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_number", ["transferNumber"])
    .index("by_status", ["workspaceId", "status"])
    .index("by_warehouses", ["fromWarehouse", "toWarehouse"]),

  // Item Variants
  itemVariants: defineTable({
    // Parent item
    parentItem: v.id("inventoryItems"),

    // Variant details
    variantName: v.string(),
    sku: v.string(),
    variantAttributes: v.array(v.object({
      name: v.string(),
      value: v.string(),
    })),

    // Override parent properties
    costPrice: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),
    weight: v.optional(v.number()),
    dimensions: v.optional(v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
    })),

    // Images
    images: v.array(v.id("_storage")),

    // Status
    isActive: v.boolean(),

    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_parent", ["parentItem"])
    .index("by_sku", ["sku"]),

  // Batch Numbers
  batchNumbers: defineTable({
    // Batch details
    batchNumber: v.string(),
    item: v.id("inventoryItems"),
    warehouse: v.id("warehouses"),

    // Dates
    manufacturingDate: v.optional(v.number()),
    expiryDate: v.optional(v.number()),
    receivedDate: v.number(),

    // Quantities
    initialQuantity: v.number(),
    currentQuantity: v.number(),

    // Status
    status: v.union(
      v.literal("active"),
      v.literal("expiring"),
      v.literal("expired"),
      v.literal("depleted")
    ),

    // Notes
    notes: v.optional(v.string()),
    supplier: v.optional(v.id("suppliers")),
    purchaseOrder: v.optional(v.id("purchaseOrders")),

    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_batch", ["batchNumber"])
    .index("by_item", ["item"])
    .index("by_expiry", ["expiryDate"]),

  // Serial Numbers
  serialNumbers: defineTable({
    // Serial details
    serialNumber: v.string(),
    item: v.id("inventoryItems"),
    warehouse: v.id("warehouses"),
    batchNumber: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal("in_stock"),
      v.literal("reserved"),
      v.literal("sold"),
      v.literal("returned"),
      v.literal("damaged"),
      v.literal("lost")
    ),

    // Dates
    receivedDate: v.number(),
    soldDate: v.optional(v.number()),
    warrantyExpiry: v.optional(v.number()),

    // Location
    location: v.optional(v.string()),
    customer: v.optional(v.id("users")),

    // Notes
    notes: v.optional(v.string()),
    purchaseOrder: v.optional(v.id("purchaseOrders")),

    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_serial", ["serialNumber"])
    .index("by_item", ["item"])
    .index("by_status", ["status"]),

  // Inventory Audits
  inventoryAudits: defineTable({
    // Audit information
    auditNumber: v.string(),
    warehouse: v.id("warehouses"),
    auditType: v.union(
      v.literal("full"),
      v.literal("cycle"),
      v.literal("spot"),
      v.literal("category")
    ),

    // Dates
    scheduledDate: v.number(),
    startedDate: v.optional(v.number()),
    completedDate: v.optional(v.number()),

    // Status
    status: v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),

    // Scope
    categories: v.array(v.id("inventoryCategories")),
    items: v.array(v.id("inventoryItems")),
    locations: v.array(v.string()),

    // Results
    totalItems: v.number(),
    countedItems: v.number(),
    discrepancies: v.number(),
    totalValue: v.number(),
    discrepancyValue: v.number(),

    // Team
    auditors: v.array(v.object({
      userId: v.id("users"),
      role: v.string(),
    })),

    // Notes
    notes: v.optional(v.string()),
    summary: v.optional(v.string()),

    // Attachments
    attachments: v.array(v.id("_storage")),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_number", ["auditNumber"])
    .index("by_status", ["workspaceId", "status"])
    .index("by_warehouse", ["warehouse", "status"]),
});
