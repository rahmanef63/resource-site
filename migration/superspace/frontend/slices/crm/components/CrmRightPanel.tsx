"use client"

import React from "react"
import { X, Info, Sparkles, Settings, Mail, Phone, Building, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import { cn } from "@/lib/utils"
import type { Customer } from "../hooks"

interface CrmRightPanelProps {
    customer: Customer | null
    mode: "inspector" | "ai" | "settings"
    onModeChange: (mode: "inspector" | "ai" | "settings") => void
    onClose: () => void
}

export function CrmRightPanel({
    customer,
    mode,
    onModeChange,
    onClose,
}: CrmRightPanelProps) {
    return (
        <PanelSection label="Customer details">
            <PanelSection.Header className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Details</span>
                    <Button aria-label="Close" variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <Tabs value={mode} onValueChange={(v) => onModeChange(v as typeof mode)}>
                    <TabsList className="flex w-full h-8 justify-evenly">
                        <TabsTrigger value="inspector" className="flex-1 h-6 text-xs gap-1">
                            <Info className="h-3 w-3" />
                            Info
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="flex-1 h-6 text-xs gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex-1 h-6 text-xs gap-1">
                            <Settings className="h-3 w-3" />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </PanelSection.Header>

            <PanelSection.Items>
                {mode === "inspector" && <InspectorContent customer={customer} />}
                {mode === "ai" && <AIContent customer={customer} />}
                {mode === "settings" && <SettingsContent />}
            </PanelSection.Items>
        </PanelSection>
    )
}

// ============================================================================
// Inspector Content
// ============================================================================

function InspectorContent({ customer }: { customer: Customer | null }) {
    if (!customer) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a customer to view details</p>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        lead: "bg-blue-500/10 text-blue-600",
        prospect: "bg-amber-500/10 text-amber-600",
        customer: "bg-emerald-500/10 text-emerald-600",
        inactive: "bg-slate-500/10 text-slate-600",
    }

    return (
        <div className="p-4 space-y-6">
            {/* Customer Header */}
            <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="text-2xl font-semibold text-primary">
                        {customer.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <h3 className="font-semibold">{customer.name}</h3>
                <Badge className={cn("mt-2", statusColors[customer.status])}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </Badge>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                </h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                            {customer.email}
                        </a>
                    </div>
                    {customer.phone && (
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${customer.phone}`} className="hover:underline">
                                {customer.phone}
                            </a>
                        </div>
                    )}
                    {customer.company && (
                        <div className="flex items-center gap-3 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.company}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {customer.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Info
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4" />
                        <span>Created {new Date(customer._creationTime).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// AI Content
// ============================================================================

function AIContent({ customer }: { customer: Customer | null }) {
    return (
        <div className="p-4">
            <div className="text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium mb-1">CRM AI Assistant</p>
                <p className="text-xs">
                    {customer
                        ? `Ask questions about ${customer.name} or get suggestions.`
                        : "Select a customer to get AI insights."}
                </p>
            </div>

            {/* Placeholder for AI chat interface */}
            <div className="mt-6 p-4 rounded-lg border border-dashed text-center text-muted-foreground text-xs">
                AI chat interface initializing...
            </div>
        </div>
    )
}

// ============================================================================
// Settings Content
// ============================================================================

function SettingsContent() {
    return (
        <div className="p-4 space-y-6">
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    CRM Settings
                </h4>

                <div className="space-y-4">
                    <div className="rounded-lg border p-3">
                        <h5 className="text-sm font-medium mb-1">Default Status</h5>
                        <p className="text-xs text-muted-foreground">
                            Choose the default status for new customers
                        </p>
                    </div>

                    <div className="rounded-lg border p-3">
                        <h5 className="text-sm font-medium mb-1">Pipeline Stages</h5>
                        <p className="text-xs text-muted-foreground">
                            Configure your sales pipeline stages
                        </p>
                    </div>

                    <div className="rounded-lg border p-3">
                        <h5 className="text-sm font-medium mb-1">Notifications</h5>
                        <p className="text-xs text-muted-foreground">
                            Manage CRM notification preferences
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
