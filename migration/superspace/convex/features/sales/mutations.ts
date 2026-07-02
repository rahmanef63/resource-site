import { v } from "convex/values"
import { mutation, internalMutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import { nextCounterValue, formatCounter } from "../../shared/counters"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for sales feature
 * Manages quotes, invoices, and sales-related operations
 */

// ============================================================================
// Quote Mutations
// ============================================================================

/**
 * Create a new quote/estimate
 */
export const createQuote = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        customerId: v.id("users"),
        currency: v.string(),
        validUntil: v.number(),
        terms: v.string(),
        notes: v.optional(v.string()),
        items: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            quantity: v.number(),
            unitPrice: v.number(),
            discount: v.number(),
            taxRate: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const now = Date.now()

        // Calculate totals
        let subtotal = 0
        let totalTax = 0
        let totalDiscount = 0

        const processedItems = args.items.map(item => {
            const lineTotal = item.quantity * item.unitPrice
            const discountAmount = (lineTotal * item.discount) / 100
            const afterDiscount = lineTotal - discountAmount
            const taxAmount = (afterDiscount * item.taxRate) / 100
            const total = afterDiscount + taxAmount

            subtotal += afterDiscount
            totalTax += taxAmount
            totalDiscount += discountAmount

            return {
                ...item,
                taxAmount,
                total,
            }
        })

        const total = subtotal + totalTax

        // Generate quote number
        const quoteValue = await nextCounterValue(
            ctx,
            args.workspaceId,
            "sales.quoteNumber",
        )
        const quoteNumber = formatCounter("QT", quoteValue, 6)

        const quoteId = await ctx.db.insert("quotes", {
            workspaceId: args.workspaceId,
            quoteNumber,
            customerId: args.customerId,
            status: "draft",
            currency: args.currency,
            validUntil: args.validUntil,
            terms: args.terms,
            notes: args.notes,
            subtotal,
            taxAmount: totalTax,
            total,
            discountAmount: totalDiscount,
            paidAmount: 0,
            balance: total,
            items: processedItems,
            createdAt: now,
            updatedAt: now,
            createdBy: membership.userId,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.quote.create",
            resourceType: "quote",
            resourceId: quoteId,
            metadata: { quoteNumber, total },
        })

        return { quoteId, quoteNumber }
    },
})

/**
 * Update quote status
 */
export const updateQuoteStatus = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        quoteId: v.id("quotes"),
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("accepted"),
            v.literal("rejected"),
            v.literal("expired"),
            v.literal("converted")
        ),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const quote = await ctx.db.get(args.quoteId)
        if (!quote || quote.workspaceId !== args.workspaceId) {
            throw new Error("Quote not found")
        }

        const now = Date.now()
        const updates: any = {
            status: args.status,
            updatedAt: now,
        }

        if (args.status === "sent") {
            updates.sentAt = now
        } else if (args.status === "accepted") {
            updates.acceptedAt = now
        }

        await ctx.db.patch(args.quoteId, updates)

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.quote.status_update",
            resourceType: "quote",
            resourceId: args.quoteId,
            metadata: { status: args.status },
        })

        return { success: true }
    },
})

// ============================================================================
// Invoice Mutations
// ============================================================================

/**
 * Create a new invoice
 */
export const createInvoice = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        customerId: v.id("users"),
        quoteId: v.optional(v.id("quotes")),
        currency: v.string(),
        dueDate: v.number(),
        terms: v.string(),
        notes: v.optional(v.string()),
        items: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            quantity: v.number(),
            unitPrice: v.number(),
            discount: v.number(),
            taxRate: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const now = Date.now()

        // Calculate totals
        let subtotal = 0
        let totalTax = 0
        let totalDiscount = 0

        const processedItems = args.items.map(item => {
            const lineTotal = item.quantity * item.unitPrice
            const discountAmount = (lineTotal * item.discount) / 100
            const afterDiscount = lineTotal - discountAmount
            const taxAmount = (afterDiscount * item.taxRate) / 100
            const total = afterDiscount + taxAmount

            subtotal += afterDiscount
            totalTax += taxAmount
            totalDiscount += discountAmount

            return {
                ...item,
                taxAmount,
                total,
            }
        })

        const total = subtotal + totalTax

        // Generate invoice number
        const invoiceValue = await nextCounterValue(
            ctx,
            args.workspaceId,
            "sales.invoiceNumber",
        )
        const invoiceNumber = formatCounter("INV", invoiceValue, 6)

        const invoiceId = await ctx.db.insert("invoices", {
            workspaceId: args.workspaceId,
            invoiceNumber,
            customerId: args.customerId,
            quoteId: args.quoteId as any,
            status: "draft",
            currency: args.currency,
            dueDate: args.dueDate,
            terms: args.terms,
            notes: args.notes,
            subtotal,
            taxAmount: totalTax,
            total,
            discountAmount: totalDiscount,
            paidAmount: 0,
            balance: total,
            items: processedItems,
            createdAt: now,
            updatedAt: now,
            createdBy: membership.userId,
        })

        // If created from quote, update quote status
        if (args.quoteId) {
            await ctx.db.patch(args.quoteId, {
                status: "converted",
                invoiceId: invoiceId as any,
                updatedAt: now,
            })
        }

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.invoice.create",
            resourceType: "invoice",
            resourceId: invoiceId,
            metadata: { invoiceNumber, total },
        })

        return { invoiceId, invoiceNumber }
    },
})

/**
 * Record payment for invoice
 */
export const recordPayment = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        invoiceId: v.id("invoices"),
        amount: v.number(),
        paymentMethod: v.string(),
        reference: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const invoice = await ctx.db.get(args.invoiceId)
        if (!invoice || invoice.workspaceId !== args.workspaceId) {
            throw new Error("Invoice not found")
        }

        const now = Date.now()
        const newPaidAmount = invoice.paidAmount + args.amount
        const newBalance = invoice.total - newPaidAmount

        let newStatus = invoice.status
        if (newBalance <= 0) {
            newStatus = "paid"
        } else if (newPaidAmount > 0) {
            newStatus = "partial"
        }

        // Generate payment number
        const paymentValue = await nextCounterValue(
            ctx,
            args.workspaceId,
            "sales.paymentNumber",
        )
        const paymentNumber = formatCounter("PMT", paymentValue, 6)

        // Record payment
        await ctx.db.insert("payments", {
            workspaceId: args.workspaceId,
            paymentNumber,
            invoiceId: args.invoiceId as any,
            customerId: invoice.customerId,
            amount: args.amount,
            currency: invoice.currency,
            paymentMethod: args.paymentMethod as any,
            status: "completed",
            refundAmount: 0,
            transactionDate: now,
            notes: args.notes,
            attachments: [],
            createdBy: membership.userId,
            createdAt: now,
            updatedAt: now,
        })

        // Update invoice
        await ctx.db.patch(args.invoiceId, {
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: newStatus,
            updatedAt: now,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.payment.record",
            resourceType: "invoice",
            resourceId: args.invoiceId,
            metadata: { amount: args.amount, paymentMethod: args.paymentMethod },
        })

        return { success: true, newBalance, newStatus }
    },
})

/**
 * Send invoice to customer
 */
export const sendInvoice = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        invoiceId: v.id("invoices"),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const invoice = await ctx.db.get(args.invoiceId)
        if (!invoice || invoice.workspaceId !== args.workspaceId) {
            throw new Error("Invoice not found")
        }

        const now = Date.now()

        await ctx.db.patch(args.invoiceId, {
            status: "sent",
            sentAt: now,
            updatedAt: now,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.invoice.send",
            resourceType: "invoice",
            resourceId: args.invoiceId,
            metadata: { invoiceNumber: invoice.invoiceNumber },
        })

        return { success: true }
    },
})

/**
 * Void an invoice
 */
export const voidInvoice = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        invoiceId: v.id("invoices"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const invoice = await ctx.db.get(args.invoiceId)
        if (!invoice || invoice.workspaceId !== args.workspaceId) {
            throw new Error("Invoice not found")
        }

        if (invoice.paidAmount > 0) {
            throw new Error("Cannot void invoice with payments")
        }

        const now = Date.now()

        await ctx.db.patch(args.invoiceId, {
            status: "void",
            notes: `${invoice.notes || ""}\n\nVoided: ${args.reason}`,
            updatedAt: now,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.invoice.void",
            resourceType: "invoice",
            resourceId: args.invoiceId,
            metadata: { reason: args.reason },
        })

        return { success: true }
    },
})

/**
 * Convert an accepted quote into a draft invoice (Step 49 closure).
 *
 * Atomic transition:
 *   1. Validate quote exists, belongs to caller's workspace, is `accepted`.
 *   2. Materialize quote.items into invoice line items, preserving discount
 *      + tax computation.
 *   3. Insert new invoice with status="draft", quoteId reference, customer
 *      + currency + tax + discount totals copied from quote.
 *   4. Patch quote.status = "converted" + lastUpdated.
 *   5. Audit log: sales.quote.converted (links quote → invoice).
 *
 * Caller can then send the invoice (status: draft → sent) and record
 * payments via existing recordPayment mutation.
 */
export const convertQuoteToInvoice = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        quoteId: v.id("quotes"),
        dueDate: v.number(),
        terms: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE,
        )

        const quote = await ctx.db.get(args.quoteId)
        if (!quote) {
            throw new Error("Quote not found")
        }
        if (quote.workspaceId !== args.workspaceId) {
            throw new Error("Quote belongs to a different workspace")
        }
        if (quote.status !== "accepted") {
            throw new Error(
                `Quote must be in 'accepted' status to convert (got '${quote.status}')`,
            )
        }

        const now = Date.now()

        // Generate invoice number — same counter as createInvoice
        const invoiceValue = await nextCounterValue(
            ctx,
            args.workspaceId,
            "sales.invoiceNumber",
        )
        const invoiceNumber = formatCounter("INV", invoiceValue, 6)

        // Materialize line items (already computed taxAmount + total per line)
        const items = quote.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount ?? 0,
            total: item.total ?? 0,
        }))

        const invoiceId = await ctx.db.insert("invoices", {
            workspaceId: args.workspaceId,
            invoiceNumber,
            customerId: quote.customerId,
            contactId: quote.contactId,
            quoteId: args.quoteId as unknown as Id<"users">, // schema typed as Id<"users"> historically — preserved
            status: "draft",
            currency: quote.currency,
            exchangeRate: quote.exchangeRate,
            dueDate: args.dueDate,
            terms: args.terms ?? quote.terms,
            notes: args.notes ?? quote.notes,
            subtotal: quote.subtotal,
            taxAmount: quote.taxAmount,
            total: quote.total,
            discountAmount: quote.discountAmount,
            paidAmount: 0,
            balance: quote.total,
            items,
            createdBy: membership?.userId ?? quote.createdBy,
            createdAt: now,
            updatedAt: now,
        })

        // Mark quote as converted
        await ctx.db.patch(args.quoteId, {
            status: "converted",
            updatedAt: now,
        })

        // Audit log — links quote to invoice for traceability
        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.quote.converted",
            resourceType: "quote",
            resourceId: args.quoteId,
            metadata: {
                invoiceId: String(invoiceId),
                invoiceNumber,
                quoteNumber: quote.quoteNumber,
                total: quote.total,
                currency: quote.currency,
            },
        })

        return { invoiceId, invoiceNumber }
    },
})

/**
 * Sweep overdue invoices across all workspaces (Step 49b — cron-triggered).
 *
 * Internal mutation, scheduled daily. For each workspace:
 *  - Finds invoices with status="sent" and dueDate < now and balance > 0
 *  - Patches status="overdue"
 *  - Fires sendToWorkspaceMembers system notification to owners + admins
 *
 * @dod:skip-permissions reason="internal cron sweeps across all workspaces"
 * @dod:skip-audit reason="bulk sweep — per-invoice status flip self-evidences via the patch"
 */
export const sweepOverdueInvoices = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now()
        const { sendToWorkspaceMembers } = await import(
            "../../shared/notifications/sender"
        )

        // @dod:skip-perf reason="cron sweep across workspaces; bounded scan with hard cap of 5000"
        const overdueCandidates = await ctx.db
            .query("invoices")
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "sent"),
                    q.lt(q.field("dueDate"), now),
                    q.gt(q.field("balance"), 0),
                ),
            )
            .take(5000)

        let flipped = 0
        let notified = 0

        for (const inv of overdueCandidates) {
            // @dod:skip-perf reason="cron sweep — sequential patch + per-invoice notification (which itself fans out to recipients via Promise.all internally); parallel patches would compete for transaction budget"
            await ctx.db.patch(inv._id, { status: "overdue", updatedAt: now })
            flipped++

            const daysLate = Math.max(1, Math.floor((now - inv.dueDate) / (24 * 60 * 60 * 1000)))
            try {
                const recipients = await sendToWorkspaceMembers(ctx, {
                    workspaceId: inv.workspaceId,
                    createdBy: inv.createdBy,
                    type: "system",
                    title: "Tagihan jatuh tempo",
                    message: `Invoice ${inv.invoiceNumber} telat ${daysLate} hari (${inv.balance.toLocaleString("id-ID")} ${inv.currency})`,
                    actionUrl: `/dashboard/sales?invoiceId=${String(inv._id)}`,
                    metadata: {
                        feature: "sales",
                        entity: "invoice",
                        entityId: String(inv._id),
                        event: "overdue",
                        invoiceNumber: inv.invoiceNumber,
                        balance: inv.balance,
                        currency: inv.currency,
                        daysLate,
                    },
                    roleLevels: [0, 10],
                    maxRecipients: 10,
                })
                if (recipients > 0) notified++
            } catch (error) {
                console.error("Overdue alert failed for", inv.invoiceNumber, error)
            }
        }

        return { scanned: overdueCandidates.length, flipped, notified }
    },
})

/**
 * Bulk-import sales records — typically from CSV or ETL passthrough.
 * Each row creates a minimal draft invoice using the requesting user as the
 * placeholder customer; reconciliation flow links the real customer later.
 */
export const bulkImportSales = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        rows: v.array(v.object({
            customerName: v.string(),
            invoiceDate: v.number(),
            currency: v.optional(v.string()),
            amount: v.number(),
            description: v.optional(v.string()),
            externalRef: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE,
        )
        const userId = membership?.userId as Id<"users"> | undefined
        if (!userId) throw new Error("No user")

        const now = Date.now()
        let inserted = 0
        for (const row of args.rows) {
            // @dod:skip-perf reason="counter must increment sequentially per invoice — Promise.all on counter would yield duplicate numbers"
            const invoiceValue = await nextCounterValue(
                ctx,
                args.workspaceId,
                "sales.invoiceNumber",
                { seed: async () => 1000 },
            )
            const invoiceNumber = formatCounter("INV", invoiceValue, 5)

            // @dod:skip-perf reason="invoice insert is paired with sequential counter — already serialized by counter dependency"
            await ctx.db.insert("invoices", {
                workspaceId: args.workspaceId,
                invoiceNumber,
                customerId: userId,
                status: "draft",
                currency: row.currency ?? "IDR",
                dueDate: row.invoiceDate + 30 * 86400_000,
                terms: "net30",
                notes: `${row.customerName}${row.description ? ` — ${row.description}` : ""}`,
                subtotal: row.amount,
                taxAmount: 0,
                total: row.amount,
                discountAmount: 0,
                paidAmount: 0,
                balance: row.amount,
                items: [
                    {
                        id: row.externalRef ?? `bulk-${inserted}`,
                        name: row.description ?? "Bulk import",
                        quantity: 1,
                        unitPrice: row.amount,
                        discount: 0,
                        taxRate: 0,
                        taxAmount: 0,
                        total: row.amount,
                    },
                ],
                createdAt: now,
                updatedAt: now,
                createdBy: userId,
            })
            inserted++
        }

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: userId,
            action: "sales.bulkImported",
            resourceType: "invoices",
            resourceId: args.workspaceId,
            metadata: { count: inserted },
        })

        return { inserted }
    },
})
