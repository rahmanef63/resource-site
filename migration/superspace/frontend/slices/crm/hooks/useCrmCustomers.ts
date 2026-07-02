import { useCallback, useMemo, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

export type CustomerStatus = "lead" | "prospect" | "customer" | "inactive"

export interface Customer {
    _id: Id<"crmCustomers">
    workspaceId: Id<"workspaces">
    name: string
    email: string
    phone?: string
    company?: string
    status: CustomerStatus
    assignedTo?: Id<"users">
    tags?: string[]
    createdBy: Id<"users">
    assignee?: { name?: string; avatarUrl?: string } | null
    _creationTime: number
}

export interface CreateCustomerInput {
    name: string
    email: string
    phone?: string
    company?: string
    status?: CustomerStatus
    assignedTo?: Id<"users">
    tags?: string[]
    createConversation?: boolean
}

export interface UpdateCustomerInput {
    name?: string
    email?: string
    phone?: string
    company?: string
    status?: CustomerStatus
    assignedTo?: Id<"users">
    tags?: string[]
}

/**
 * CRM Customers Hook
 *
 * Provides data and actions for CRM customer management.
 */
export function useCrmCustomers(workspaceId?: Id<"workspaces"> | null, statusFilter?: CustomerStatus) {
    const [error, setError] = useState<Error | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const customersQuery = useQuery(
        api.features.crm.queries.getWorkspaceCustomers,
        workspaceId ? { workspaceId, status: statusFilter } : "skip"
    )

    const createCustomerMutation = useMutation(api.features.crm.mutations.createCustomer)
    const updateCustomerMutation = useMutation(api.features.crm.mutations.updateCustomer)
    const deleteCustomerMutation = useMutation(api.features.crm.mutations.deleteCustomer)

    const isLoading = workspaceId ? customersQuery === undefined : false

    const customers = useMemo<Customer[]>(() => {
        if (!customersQuery) return []
        return customersQuery as Customer[]
    }, [customersQuery])

    const stats = useMemo(() => {
        const leads = customers.filter(c => c.status === "lead").length
        const prospects = customers.filter(c => c.status === "prospect").length
        const active = customers.filter(c => c.status === "customer").length
        const inactive = customers.filter(c => c.status === "inactive").length

        return {
            total: customers.length,
            leads,
            prospects,
            active,
            inactive,
        }
    }, [customers])

    const createCustomer = useCallback(
        async (input: CreateCustomerInput) => {
            if (!workspaceId) throw new Error("Workspace is required")

            setIsCreating(true)
            setError(null)

            try {
                const customerId = await createCustomerMutation({
                    workspaceId,
                    ...input,
                })
                return customerId
            } catch (err) {
                setError(err as Error)
                throw err
            } finally {
                setIsCreating(false)
            }
        },
        [workspaceId, createCustomerMutation]
    )

    const updateCustomer = useCallback(
        async (customerId: Id<"crmCustomers">, input: UpdateCustomerInput) => {
            setIsUpdating(true)
            setError(null)

            try {
                await updateCustomerMutation({
                    customerId,
                    ...input,
                })
            } catch (err) {
                setError(err as Error)
                throw err
            } finally {
                setIsUpdating(false)
            }
        },
        [updateCustomerMutation]
    )

    const deleteCustomer = useCallback(
        async (customerId: Id<"crmCustomers">) => {
            setIsDeleting(true)
            setError(null)

            try {
                await deleteCustomerMutation({ customerId })
            } catch (err) {
                setError(err as Error)
                throw err
            } finally {
                setIsDeleting(false)
            }
        },
        [deleteCustomerMutation]
    )

    return {
        customers,
        stats,
        isLoading,
        error,
        isCreating,
        isUpdating,
        isDeleting,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        hasWorkspace: Boolean(workspaceId),
    }
}
