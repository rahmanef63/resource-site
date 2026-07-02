"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Mail,
    Phone,
    Building,
    Calendar,
    Edit,
    Trash2,
    Tag,
    MessageSquare,
    Clock,
    User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Customer } from "../hooks"

interface CustomerDetailViewProps {
    customer: Customer
    onEdit: () => void
    onDelete: () => void
    isDeleting: boolean
}

const STATUS_COLORS: Record<string, string> = {
    lead: "bg-blue-500/10 text-blue-600 border-blue-200",
    prospect: "bg-amber-500/10 text-amber-600 border-amber-200",
    customer: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    inactive: "bg-slate-500/10 text-slate-600 border-slate-200",
}

export function CustomerDetailView({
    customer,
    onEdit,
    onDelete,
    isDeleting,
}: CustomerDetailViewProps) {
    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
                {/* Header Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border">
                                <span className="text-3xl font-bold text-primary">
                                    {customer.name.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl font-bold">{customer.name}</h1>
                                        <p className="text-muted-foreground mt-1">
                                            {customer.company || "No company"}
                                        </p>
                                        <Badge className={cn("mt-2", STATUS_COLORS[customer.status])}>
                                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={onEdit}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={onDelete}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Contact Info Row */}
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                                    <a
                                        href={`mailto:${customer.email}`}
                                        className="flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <Mail className="h-4 w-4" />
                                        {customer.email}
                                    </a>
                                    {customer.phone && (
                                        <a
                                            href={`tel:${customer.phone}`}
                                            className="flex items-center gap-2 hover:underline"
                                        >
                                            <Phone className="h-4 w-4" />
                                            {customer.phone}
                                        </a>
                                    )}
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Added {new Date(customer._creationTime).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Two Column Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                            <CardDescription>Common actions for this customer</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="outline" className="justify-start">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <Phone className="h-4 w-4 mr-2" />
                                Log Call
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Meeting
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tags & Labels</CardTitle>
                            <CardDescription>Organize with tags</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {customer.tags && customer.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {customer.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                    No tags yet
                                </div>
                            )}
                            <Button variant="outline" size="sm" className="mt-3 w-full">
                                <Tag className="h-4 w-4 mr-2" />
                                Add Tag
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                        <CardDescription>Timeline of interactions with this customer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <div className="text-center">
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No activity recorded yet</p>
                                <p className="text-xs">Interactions will appear here</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    )
}
