/**
 * ERP Accounting Module Schema
 * Complete financial management with GL, AP, AR, budgets, and reports
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // CHART OF ACCOUNTS
  // ============================================
  accounts: defineTable({
    workspaceId: v.id("workspaces"),
    accountCode: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    
    // Type
    accountType: v.union(
      v.literal("asset"),
      v.literal("liability"),
      v.literal("equity"),
      v.literal("revenue"),
      v.literal("expense")
    ),
    
    // Classification
    accountSubType: v.optional(v.string()), // "cash", "receivable", "payable", etc.
    parentAccount: v.optional(v.id("accounts")),
    
    // Currency
    currency: v.string(),
    
    // Balances
    currentBalance: v.number(),
    openingBalance: v.number(),
    
    // Flags
    isActive: v.boolean(),
    isSystemAccount: v.boolean(), // Cannot be deleted
    allowDirectPosting: v.boolean(),
    
    // Tax
    taxCodeId: v.optional(v.id("taxCodes")),
    
    // Bank details (for bank accounts)
    bankDetails: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      routingNumber: v.optional(v.string()),
      swiftCode: v.optional(v.string()),
    })),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["accountType"])
    .index("by_code", ["accountCode"])
    .index("by_parent", ["parentAccount"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["workspaceId", "accountType"],
    }),

  // ============================================
  // JOURNAL ENTRIES
  // ============================================
  journalEntries: defineTable({
    workspaceId: v.id("workspaces"),
    entryNumber: v.string(),
    
    // Date and period
    transactionDate: v.number(),
    postingDate: v.number(),
    fiscalYearId: v.id("fiscalYears"),
    fiscalPeriodId: v.id("fiscalPeriods"),
    
    // Entry type
    entryType: v.union(
      v.literal("manual"),
      v.literal("system"),
      v.literal("recurring"),
      v.literal("reversing"),
      v.literal("adjusting"),
      v.literal("closing")
    ),
    
    // Description
    description: v.string(),
    reference: v.optional(v.string()),
    
    // Lines
    lines: v.array(v.object({
      id: v.string(),
      accountId: v.id("accounts"),
      description: v.optional(v.string()),
      debit: v.number(),
      credit: v.number(),
      currency: v.string(),
      exchangeRate: v.number(),
      baseCurrencyAmount: v.number(),
      costCenterId: v.optional(v.id("costCenters")),
      projectId: v.optional(v.id("projects")),
      taxCodeId: v.optional(v.id("taxCodes")),
      taxAmount: v.optional(v.number()),
    })),
    
    // Totals
    totalDebit: v.number(),
    totalCredit: v.number(),
    
    // Source document
    sourceType: v.optional(v.string()), // "invoice", "bill", "payment", etc.
    sourceId: v.optional(v.string()),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("posted"),
      v.literal("reversed"),
      v.literal("void")
    ),
    
    // Reversal
    reversalEntryId: v.optional(v.id("journalEntries")),
    reversedFrom: v.optional(v.id("journalEntries")),
    
    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    // Attachments
    attachments: v.array(v.id("_storage")),
    
    // Audit
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "transactionDate"])
    .index("by_status", ["status", "transactionDate"])
    .index("by_fiscal_period", ["fiscalPeriodId"])
    .index("by_entry_number", ["entryNumber"])
    .searchIndex("search_text", {
      searchField: "description",
      filterFields: ["workspaceId", "status"],
    }),

  // ============================================
  // FISCAL YEARS
  // ============================================
  fiscalYears: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    
    // Status
    status: v.union(
      v.literal("open"),
      v.literal("closing"),
      v.literal("closed")
    ),
    
    // Lock
    isLocked: v.boolean(),
    lockedAt: v.optional(v.number()),
    lockedBy: v.optional(v.id("users")),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "startDate"])
    .index("by_status", ["status"]),

  // ============================================
  // FISCAL PERIODS
  // ============================================
  fiscalPeriods: defineTable({
    workspaceId: v.id("workspaces"),
    fiscalYearId: v.id("fiscalYears"),
    name: v.string(),
    periodNumber: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    
    // Status
    status: v.union(
      v.literal("open"),
      v.literal("closing"),
      v.literal("closed")
    ),
    
    // Lock
    isLocked: v.boolean(),
    lockedAt: v.optional(v.number()),
    lockedBy: v.optional(v.id("users")),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_fiscal_year", ["fiscalYearId"])
    .index("by_dates", ["startDate", "endDate"]),

  // ============================================
  // CURRENCIES
  // ============================================
  currencies: defineTable({
    workspaceId: v.id("workspaces"),
    code: v.string(), // USD, EUR, IDR
    name: v.string(),
    symbol: v.string(),
    decimalPlaces: v.number(),
    
    // Exchange rates
    isBaseCurrency: v.boolean(),
    latestRate: v.number(),
    latestRateDate: v.number(),
    
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"]),

  // ============================================
  // EXCHANGE RATES
  // ============================================
  exchangeRates: defineTable({
    workspaceId: v.id("workspaces"),
    fromCurrency: v.string(),
    toCurrency: v.string(),
    rate: v.number(),
    effectiveDate: v.number(),
    source: v.string(), // "manual", "api", etc.
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "effectiveDate"])
    .index("by_currencies", ["fromCurrency", "toCurrency", "effectiveDate"]),

  // ============================================
  // TAX CODES
  // ============================================
  taxCodes: defineTable({
    workspaceId: v.id("workspaces"),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    
    // Tax details
    taxType: v.union(
      v.literal("sales"),
      v.literal("purchase"),
      v.literal("both")
    ),
    rate: v.number(),
    
    // Components (for compound taxes)
    components: v.optional(v.array(v.object({
      name: v.string(),
      rate: v.number(),
      accountId: v.id("accounts"),
    }))),
    
    // Accounts
    salesAccountId: v.optional(v.id("accounts")),
    purchaseAccountId: v.optional(v.id("accounts")),
    
    // Flags
    isActive: v.boolean(),
    isDefault: v.boolean(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"])
    .index("by_type", ["taxType"]),

  // ============================================
  // COST CENTERS
  // ============================================
  costCenters: defineTable({
    workspaceId: v.id("workspaces"),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    parentCostCenter: v.optional(v.id("costCenters")),
    manager: v.optional(v.id("users")),
    
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"])
    .index("by_parent", ["parentCostCenter"]),

  // ============================================
  // BUDGETS
  // ============================================
  budgets: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    
    // Period
    fiscalYearId: v.id("fiscalYears"),
    
    // Type
    budgetType: v.union(
      v.literal("operational"),
      v.literal("capital"),
      v.literal("project")
    ),
    
    // Scope
    costCenterId: v.optional(v.id("costCenters")),
    projectId: v.optional(v.id("projects")),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("closed")
    ),
    
    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_fiscal_year", ["fiscalYearId"])
    .index("by_status", ["status"]),

  // ============================================
  // BUDGET LINES
  // ============================================
  budgetLines: defineTable({
    workspaceId: v.id("workspaces"),
    budgetId: v.id("budgets"),
    accountId: v.id("accounts"),
    
    // Periods (monthly breakdown)
    periods: v.array(v.object({
      periodId: v.id("fiscalPeriods"),
      budgetAmount: v.number(),
      actualAmount: v.number(),
      variance: v.number(),
    })),
    
    // Totals
    totalBudget: v.number(),
    totalActual: v.number(),
    totalVariance: v.number(),
    
    // Notes
    notes: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_budget", ["budgetId"])
    .index("by_account", ["accountId"]),

  // ============================================
  // FIXED ASSETS
  // ============================================
  fixedAssets: defineTable({
    workspaceId: v.id("workspaces"),
    assetCode: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    
    // Classification
    category: v.string(),
    subCategory: v.optional(v.string()),
    
    // Acquisition
    acquisitionDate: v.number(),
    acquisitionCost: v.number(),
    vendor: v.optional(v.string()),
    purchaseOrderNumber: v.optional(v.string()),
    
    // Location
    location: v.optional(v.string()),
    department: v.optional(v.id("departments")),
    assignedTo: v.optional(v.id("users")),
    
    // Depreciation
    depreciationMethod: v.union(
      v.literal("straight_line"),
      v.literal("declining_balance"),
      v.literal("sum_of_years"),
      v.literal("units_of_production"),
      v.literal("no_depreciation")
    ),
    usefulLifeMonths: v.number(),
    salvageValue: v.number(),
    depreciationRate: v.optional(v.number()),
    
    // Accounts
    assetAccountId: v.id("accounts"),
    depreciationAccountId: v.id("accounts"),
    accumulatedDepreciationAccountId: v.id("accounts"),
    
    // Values
    currentValue: v.number(),
    accumulatedDepreciation: v.number(),
    
    // Status
    status: v.union(
      v.literal("active"),
      v.literal("disposed"),
      v.literal("fully_depreciated"),
      v.literal("impaired")
    ),
    
    // Disposal
    disposalDate: v.optional(v.number()),
    disposalValue: v.optional(v.number()),
    disposalMethod: v.optional(v.string()),
    gainLoss: v.optional(v.number()),
    
    // Documents
    documents: v.array(v.object({
      name: v.string(),
      fileId: v.id("_storage"),
      type: v.string(),
    })),
    
    // Warranty
    warrantyExpiry: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["assetCode"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["workspaceId", "status", "category"],
    }),

  // ============================================
  // DEPRECIATION ENTRIES
  // ============================================
  depreciationEntries: defineTable({
    workspaceId: v.id("workspaces"),
    assetId: v.id("fixedAssets"),
    
    // Period
    fiscalPeriodId: v.id("fiscalPeriods"),
    entryDate: v.number(),
    
    // Amount
    depreciationAmount: v.number(),
    accumulatedAmount: v.number(),
    bookValue: v.number(),
    
    // Journal
    journalEntryId: v.optional(v.id("journalEntries")),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("posted"),
      v.literal("reversed")
    ),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_asset", ["assetId"])
    .index("by_period", ["fiscalPeriodId"]),

  // ============================================
  // VENDORS (Accounts Payable)
  // ============================================
  vendors: defineTable({
    workspaceId: v.id("workspaces"),
    vendorCode: v.string(),
    name: v.string(),
    
    // Contact
    contactName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    
    // Address
    address: v.optional(v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
      postalCode: v.string(),
    })),
    
    // Tax
    taxId: v.optional(v.string()),
    taxCodeId: v.optional(v.id("taxCodes")),
    
    // Payment
    paymentTerms: v.optional(v.string()),
    paymentMethodId: v.optional(v.id("paymentMethods")),
    bankAccount: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      routingNumber: v.optional(v.string()),
    })),
    
    // Accounts
    payableAccountId: v.optional(v.id("accounts")),
    expenseAccountId: v.optional(v.id("accounts")),
    
    // Currency
    currency: v.string(),
    
    // Credit
    creditLimit: v.optional(v.number()),
    currentBalance: v.number(),
    
    // Status
    isActive: v.boolean(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["vendorCode"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["workspaceId"],
    }),

  // ============================================
  // BILLS (Vendor Invoices)
  // ============================================
  bills: defineTable({
    workspaceId: v.id("workspaces"),
    billNumber: v.string(),
    vendorId: v.id("vendors"),
    
    // Reference
    vendorInvoiceNumber: v.optional(v.string()),
    purchaseOrderId: v.optional(v.string()),
    
    // Dates
    billDate: v.number(),
    dueDate: v.number(),
    
    // Currency
    currency: v.string(),
    exchangeRate: v.number(),
    
    // Lines
    lines: v.array(v.object({
      id: v.string(),
      description: v.string(),
      accountId: v.id("accounts"),
      quantity: v.number(),
      unitPrice: v.number(),
      amount: v.number(),
      taxCodeId: v.optional(v.id("taxCodes")),
      taxAmount: v.optional(v.number()),
      costCenterId: v.optional(v.id("costCenters")),
      projectId: v.optional(v.id("projects")),
    })),
    
    // Totals
    subtotal: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    paidAmount: v.number(),
    balance: v.number(),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("paid"),
      v.literal("partial"),
      v.literal("overdue"),
      v.literal("void")
    ),
    
    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    // Journal
    journalEntryId: v.optional(v.id("journalEntries")),
    
    // Attachments
    attachments: v.array(v.id("_storage")),
    
    // Notes
    notes: v.optional(v.string()),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "billDate"])
    .index("by_vendor", ["vendorId", "billDate"])
    .index("by_status", ["status", "dueDate"])
    .index("by_number", ["billNumber"]),

  // ============================================
  // PAYMENTS (Outgoing)
  // ============================================
  vendorPayments: defineTable({
    workspaceId: v.id("workspaces"),
    paymentNumber: v.string(),
    vendorId: v.id("vendors"),
    
    // Payment details
    paymentDate: v.number(),
    amount: v.number(),
    currency: v.string(),
    exchangeRate: v.number(),
    
    // Method
    paymentMethodId: v.id("paymentMethods"),
    bankAccountId: v.optional(v.id("accounts")),
    reference: v.optional(v.string()),
    
    // Applied to bills
    allocations: v.array(v.object({
      billId: v.id("bills"),
      amount: v.number(),
    })),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("void")
    ),
    
    // Journal
    journalEntryId: v.optional(v.id("journalEntries")),
    
    // Notes
    notes: v.optional(v.string()),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "paymentDate"])
    .index("by_vendor", ["vendorId"])
    .index("by_status", ["status"]),

  // ============================================
  // CUSTOMERS (Accounts Receivable)
  // ============================================
  arCustomers: defineTable({
    workspaceId: v.id("workspaces"),
    customerCode: v.string(),
    name: v.string(),
    
    // Contact
    contactName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    
    // Address
    billingAddress: v.optional(v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
      postalCode: v.string(),
    })),
    shippingAddress: v.optional(v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
      postalCode: v.string(),
    })),
    
    // Tax
    taxId: v.optional(v.string()),
    taxCodeId: v.optional(v.id("taxCodes")),
    
    // Payment
    paymentTerms: v.optional(v.string()),
    
    // Accounts
    receivableAccountId: v.optional(v.id("accounts")),
    revenueAccountId: v.optional(v.id("accounts")),
    
    // Currency
    currency: v.string(),
    
    // Credit
    creditLimit: v.optional(v.number()),
    currentBalance: v.number(),
    
    // Status
    isActive: v.boolean(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["customerCode"])
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["workspaceId"],
    }),

  // ============================================
  // CUSTOMER INVOICES
  // ============================================
  arInvoices: defineTable({
    workspaceId: v.id("workspaces"),
    invoiceNumber: v.string(),
    customerId: v.id("arCustomers"),
    
    // Reference
    salesOrderId: v.optional(v.string()),
    
    // Dates
    invoiceDate: v.number(),
    dueDate: v.number(),
    
    // Currency
    currency: v.string(),
    exchangeRate: v.number(),
    
    // Lines
    lines: v.array(v.object({
      id: v.string(),
      description: v.string(),
      accountId: v.id("accounts"),
      quantity: v.number(),
      unitPrice: v.number(),
      discount: v.optional(v.number()),
      amount: v.number(),
      taxCodeId: v.optional(v.id("taxCodes")),
      taxAmount: v.optional(v.number()),
      costCenterId: v.optional(v.id("costCenters")),
      projectId: v.optional(v.id("projects")),
    })),
    
    // Totals
    subtotal: v.number(),
    discountAmount: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    paidAmount: v.number(),
    balance: v.number(),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("partial"),
      v.literal("overdue"),
      v.literal("void")
    ),
    
    // Journal
    journalEntryId: v.optional(v.id("journalEntries")),
    
    // Sent
    sentAt: v.optional(v.number()),
    
    // Attachments
    attachments: v.array(v.id("_storage")),
    
    // Notes
    notes: v.optional(v.string()),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "invoiceDate"])
    .index("by_customer", ["customerId", "invoiceDate"])
    .index("by_status", ["status", "dueDate"])
    .index("by_number", ["invoiceNumber"]),

  // ============================================
  // CUSTOMER PAYMENTS (Incoming)
  // ============================================
  customerPayments: defineTable({
    workspaceId: v.id("workspaces"),
    paymentNumber: v.string(),
    customerId: v.id("arCustomers"),
    
    // Payment details
    paymentDate: v.number(),
    amount: v.number(),
    currency: v.string(),
    exchangeRate: v.number(),
    
    // Method
    paymentMethodId: v.id("paymentMethods"),
    bankAccountId: v.optional(v.id("accounts")),
    reference: v.optional(v.string()),
    
    // Applied to invoices
    allocations: v.array(v.object({
      invoiceId: v.id("arInvoices"),
      amount: v.number(),
    })),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("void")
    ),
    
    // Journal
    journalEntryId: v.optional(v.id("journalEntries")),
    
    // Notes
    notes: v.optional(v.string()),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "paymentDate"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"]),

  // ============================================
  // PAYMENT METHODS
  // ============================================
  paymentMethods: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    type: v.union(
      v.literal("cash"),
      v.literal("check"),
      v.literal("bank_transfer"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("online"),
      v.literal("other")
    ),
    accountId: v.optional(v.id("accounts")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"]),

  // ============================================
  // BANK RECONCILIATIONS
  // ============================================
  bankReconciliations: defineTable({
    workspaceId: v.id("workspaces"),
    bankAccountId: v.id("accounts"),
    
    // Period
    statementDate: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    
    // Balances
    statementBalance: v.number(),
    bookBalance: v.number(),
    difference: v.number(),
    
    // Reconciliation
    reconciledTransactions: v.array(v.object({
      transactionId: v.string(),
      type: v.string(),
      date: v.number(),
      description: v.string(),
      amount: v.number(),
      isReconciled: v.boolean(),
    })),
    
    // Outstanding items
    outstandingDeposits: v.number(),
    outstandingChecks: v.number(),
    
    // Status
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("approved")
    ),
    
    // Approval
    completedBy: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    // Notes
    notes: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_account", ["bankAccountId"])
    .index("by_date", ["statementDate"]),

  // ============================================
  // BANK TRANSACTIONS (Imported)
  // ============================================
  bankTransactions: defineTable({
    workspaceId: v.id("workspaces"),
    bankAccountId: v.id("accounts"),
    
    // Transaction details
    transactionDate: v.number(),
    description: v.string(),
    reference: v.optional(v.string()),
    
    // Amount
    amount: v.number(),
    type: v.union(v.literal("deposit"), v.literal("withdrawal")),
    
    // Matching
    isMatched: v.boolean(),
    matchedJournalEntryId: v.optional(v.id("journalEntries")),
    
    // Categorization
    suggestedAccountId: v.optional(v.id("accounts")),
    categorizedAccountId: v.optional(v.id("accounts")),
    
    // Source
    importBatchId: v.optional(v.string()),
    externalId: v.optional(v.string()),
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("matched"),
      v.literal("categorized"),
      v.literal("excluded")
    ),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "transactionDate"])
    .index("by_account", ["bankAccountId", "transactionDate"])
    .index("by_status", ["status"]),

  // ============================================
  // RECURRING TRANSACTIONS
  // ============================================
  recurringTransactions: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    
    // Type
    transactionType: v.union(
      v.literal("journal_entry"),
      v.literal("bill"),
      v.literal("invoice")
    ),
    
    // Template
    template: v.any(), // JSON structure based on transaction type
    
    // Schedule
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly")
    ),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    nextRunDate: v.number(),
    
    // Tracking
    lastRunDate: v.optional(v.number()),
    runCount: v.number(),
    
    // Status
    isActive: v.boolean(),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_next_run", ["nextRunDate"])
    .index("by_type", ["transactionType"]),

  // ============================================
  // AUDIT TRAIL (Financial)
  // ============================================
  financialAuditLog: defineTable({
    workspaceId: v.id("workspaces"),
    
    // Entity
    entityType: v.string(), // "journal_entry", "bill", "invoice", etc.
    entityId: v.string(),
    
    // Action
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("posted"),
      v.literal("reversed"),
      v.literal("approved"),
      v.literal("void")
    ),
    
    // Changes
    changes: v.optional(v.any()), // Before/after snapshot
    
    // User
    userId: v.id("users"),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    
    timestamp: v.number(),
  })
    .index("by_workspace", ["workspaceId", "timestamp"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId", "timestamp"]),
});
