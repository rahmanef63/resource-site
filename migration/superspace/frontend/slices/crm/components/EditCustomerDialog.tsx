"use client"

import React, { useState, useEffect } from "react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Customer, CustomerStatus, UpdateCustomerInput } from "../hooks"

interface EditCustomerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
    onSubmit: (input: UpdateCustomerInput) => Promise<void>
    isUpdating: boolean
}

const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
    { value: "lead", label: "Lead" },
    { value: "prospect", label: "Prospect" },
    { value: "customer", label: "Customer" },
    { value: "inactive", label: "Inactive" },
]

export function EditCustomerDialog({
    open,
    onOpenChange,
    customer,
    onSubmit,
    isUpdating,
}: EditCustomerDialogProps) {
    const [form, setForm] = useState<UpdateCustomerInput>({})

    // Reset form when customer changes
    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name,
                email: customer.email,
                phone: customer.phone ?? "",
                company: customer.company ?? "",
                status: customer.status,
            })
        }
    }, [customer])

    const handleSubmit = async () => {
        if (!form.name?.trim() || !form.email?.trim()) {
            return
        }
        await onSubmit(form)
    }

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen)
    }

    if (!customer) return null

    return (
        <ResponsiveDialog open={open} onOpenChange={handleOpenChange} variant="modal" size="sm">
            <ResponsiveDialog.Header>
                <ResponsiveDialog.Title>Edit Customer</ResponsiveDialog.Title>
                <ResponsiveDialog.Description>
                    Update customer information for {customer.name}
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Name *</Label>
                        <Input
                            id="edit-name"
                            value={form.name ?? ""}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email *</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={form.email ?? ""}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                            id="edit-phone"
                            value={form.phone ?? ""}
                            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-company">Company</Label>
                        <Input
                            id="edit-company"
                            value={form.company ?? ""}
                            onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="Acme Inc."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select
                            value={form.status}
                            onValueChange={(value: CustomerStatus) => setForm(prev => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </ResponsiveDialog.Body>

            <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isUpdating || !form.name?.trim() || !form.email?.trim()}
                >
                    {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
            </ResponsiveDialog.Footer>
        </ResponsiveDialog>
    )
}
