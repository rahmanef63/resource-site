"use client"

import React, { useState, useMemo, useCallback } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import {
    Users,
    Plus,
    Search,
    Info,
    Sparkles,
    Settings,
    Mail,
    Phone,
    Building,
    Trash2,
    Edit,
} from "lucide-react"

// Layout & Shared UI
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Hooks
import { useCrmCustomers } from "../hooks"
import type { Customer, CustomerStatus, CreateCustomerInput, UpdateCustomerInput } from "../hooks"

// Components
import { CrmRightPanel } from "../components/CrmRightPanel"
import { CreateCustomerDialog } from "../components/"
import { EditCustomerDialog } from "../components/EditCustomerDialog"
import { CustomerDetailView } from "../components/CustomerDetailView"

interface CrmViewProps {
    workspaceId: Id<"workspaces">
}

const STATUS_COLORS: Record<CustomerStatus, string> = {
    lead: "bg-blue-500/10 text-blue-600",
    prospect: "bg-amber-500/10 text-amber-600",
    customer: "bg-emerald-500/10 text-emerald-600",
    inactive: "bg-slate-500/10 text-slate-600",
}

export function CrmView({ workspaceId }: CrmViewProps) {
    // State
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"crmCustomers"> | null>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [rightPanelMode, setRightPanelMode] = useState<"inspector" | "ai" | "settings">("inspector")
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
    const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all")

    // Hooks
    const {
        customers,
        stats,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        createCustomer,
        updateCustomer,
        deleteCustomer,
    } = useCrmCustomers(workspaceId, statusFilter === "all" ? undefined : statusFilter)

    // Selected customer
    const selectedCustomer = useMemo(() => {
        if (!selectedCustomerId) return null
        return customers.find(c => c._id === selectedCustomerId) || null
    }, [customers, selectedCustomerId])

    // Filtered customers
    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers
        const query = searchQuery.toLowerCase()
        return customers.filter(
            c =>
                c.name.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                (c.company && c.company.toLowerCase().includes(query))
        )
    }, [customers, searchQuery])

    // Handlers
    const handleCreateCustomer = useCallback(async (input: CreateCustomerInput) => {
        try {
            await createCustomer(input)
            toast.success("Customer created successfully")
            setCreateDialogOpen(false)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            toast.error(msg || "Failed to create customer")
        }
    }, [createCustomer])

    const handleUpdateCustomer = useCallback(async (input: UpdateCustomerInput) => {
        if (!selectedCustomerId) return
        try {
            await updateCustomer(selectedCustomerId, input)
            toast.success("Customer updated successfully")
            setEditDialogOpen(false)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            toast.error(msg || "Failed to update customer")
        }
    }, [updateCustomer, selectedCustomerId])

    const handleDeleteCustomer = useCallback(async (customerId: Id<"crmCustomers">, name: string) => {
        if (!window.confirm(`Delete "${name}"?`)) return
        try {
            await deleteCustomer(customerId)
            if (selectedCustomerId === customerId) {
                setSelectedCustomerId(null)
            }
            toast.success("Customer deleted")
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            toast.error(msg || "Failed to delete customer")
        }
    }, [deleteCustomer, selectedCustomerId])

    // ============================================================================
    // Header Components
    // ============================================================================

    const headerToggles = (
        <div className="flex bg-muted/50 p-1 rounded-lg border h-8 items-center shrink-0">
            {(["all", "lead", "prospect", "customer"] as const).map((option) => (
                <button
                    key={option}
                    onClick={() => setStatusFilter(option)}
                    className={cn(
                        "px-3 py-0.5 text-xs font-medium rounded-md transition-all h-6 flex items-center justify-center",
                        statusFilter === option
                            ? "bg-background text-foreground shadow-sm border border-border/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
            ))}
        </div>
    )

    const headerActions = (
        <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-2 h-8">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Customer</span>
            </Button>
        </div>
    )

    const searchConfig = {
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: "Search customers..."
    }

    // ============================================================================
    // Sidebar Content
    // ============================================================================

    const sidebarContent = useMemo(() => {
        if (isLoading) {
            return (
                <div className="space-y-3 p-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (filteredCustomers.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">No customers found</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Customer
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                    <button
                        key={customer._id}
                        onClick={() => setSelectedCustomerId(customer._id)}
                        className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all",
                            selectedCustomerId === customer._id
                                ? "bg-primary/5 border-primary/20 shadow-sm"
                                : "hover:bg-muted/50 border-transparent"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-sm font-medium text-primary">
                                    {customer.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{customer.name}</span>
                                    <Badge className={cn("shrink-0 text-xs", STATUS_COLORS[customer.status])}>
                                        {customer.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                                {customer.company && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Building className="h-3 w-3" />
                                        <span className="truncate">{customer.company}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        )
    }, [isLoading, filteredCustomers, selectedCustomerId])

    // ============================================================================
    // Main Content
    // ============================================================================

    const mainContent = useMemo(() => {
        if (!selectedCustomer) {
            return (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-4">
                        <Users className="h-16 w-16 mx-auto opacity-30" />
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">No customer selected</h3>
                            <p className="text-sm">Select a customer from the sidebar to view details</p>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <CustomerDetailView
                customer={selectedCustomer}
                onEdit={() => setEditDialogOpen(true)}
                onDelete={() => handleDeleteCustomer(selectedCustomer._id, selectedCustomer.name)}
                isDeleting={isDeleting}
            />
        )
    }, [selectedCustomer, handleDeleteCustomer, isDeleting])

    // ============================================================================
    // Right Panel
    // ============================================================================

    const inspector = (
        <CrmRightPanel
            customer={selectedCustomer}
            mode={rightPanelMode}
            onModeChange={setRightPanelMode}
            onClose={() => setRightPanelCollapsed(true)}
        />
    )

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <FeatureHeader
                icon={Users}
                title="CRM"
                subtitle={`${stats.total} customers`}
                primaryAction={{
                    label: "Add Customer",
                    icon: Plus,
                    onClick: () => setCreateDialogOpen(true),
                }}
                toolbar={headerToggles}
            />

            {/* Three Column Layout */}
            <div className="flex-1 min-h-0">
                <FeatureThreeColumnLayout
        rightHidden={false}
                    sidebarTitle="Customers"
                    sidebarStats={`${stats.total} total`}
                    sidebarContent={sidebarContent}
                    mainContent={mainContent}
                    mainHeader={
                        selectedCustomer && (
                            <div className="flex items-center justify-between px-4 py-2 border-b h-10 bg-muted/10">
                                <span className="text-sm font-medium">{selectedCustomer.name}</span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant={rightPanelMode === "inspector" && !rightPanelCollapsed ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setRightPanelMode("inspector")
                                            setRightPanelCollapsed(false)
                                        }}
                                    >
                                        <Info className="h-3.5 w-3.5 mr-1" />
                                        Inspector
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                    inspector={inspector}

                    // ✨ NEW: Loading states
                    loading={{
                        sidebar: isLoading,
                        center: false,
                        right: false,
                    }}

                    // ✨ NEW: Empty states
                    sidebarEmptyState={
                        filteredCustomers.length === 0 && !isLoading ? {
                            icon: Users,
                            title: "No customers found",
                            description: searchQuery ? "Try a different search term" : "Add your first customer to get started",
                            action: !searchQuery ? {
                                label: "Add Customer",
                                onClick: () => setCreateDialogOpen(true),
                            } : undefined,
                        } : undefined
                    }

                    centerEmptyState={
                        !selectedCustomer && customers.length > 0 ? {
                            icon: Users,
                            title: "No customer selected",
                            description: "Select a customer from the sidebar to view details",
                        } : undefined
                    }

                    // ✨ NEW: Right panel with tabs
                    rightPanelConfig={{
                        modes: ["inspector", "ai", "settings"],
                        defaultMode: "inspector",
                        tabs: true,
                        collapsible: true,
                    }}
                    rightPanelMode={rightPanelMode as any}
                    onRightPanelModeChange={setRightPanelMode as any}

                    // Layout props
                    storageKey="crm-layout"
                    rightCollapsed={rightPanelCollapsed}
                    onRightCollapsedChange={setRightPanelCollapsed}
                />
            </div>

            {/* Create Dialog */}
            <CreateCustomerDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateCustomer}
                isCreating={isCreating}
            />

            {/* Edit Dialog */}
            <EditCustomerDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                customer={selectedCustomer}
                onSubmit={handleUpdateCustomer}
                isUpdating={isUpdating}
            />
        </div>
    )
}

export default CrmView
