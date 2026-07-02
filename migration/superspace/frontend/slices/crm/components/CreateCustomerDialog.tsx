"use client"

import React, { useState } from "react"
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
import type { CustomerStatus, CreateCustomerInput } from "../hooks"

interface CreateCustomerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (input: CreateCustomerInput) => Promise<void>
    isCreating: boolean
}

const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
    { value: "lead", label: "Lead" },
    { value: "prospect", label: "Prospect" },
    { value: "customer", label: "Customer" },
    { value: "inactive", label: "Inactive" },
]

const DEFAULT_FORM: CreateCustomerInput = {
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead",
}

export function CreateCustomerDialog({
    open,
    onOpenChange,
    onSubmit,
    isCreating,
}: CreateCustomerDialogProps) {
    const [form, setForm] = useState<CreateCustomerInput>(DEFAULT_FORM)

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            return
        }
        await onSubmit(form)
        setForm(DEFAULT_FORM)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setForm(DEFAULT_FORM)
        }
        onOpenChange(newOpen)
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={handleOpenChange} variant="modal" size="sm">
            <ResponsiveDialog.Header>
                <ResponsiveDialog.Title>Add New Customer</ResponsiveDialog.Title>
                <ResponsiveDialog.Description>
                    Create a new customer or lead in your CRM.
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={form.phone ?? ""}
                            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                            id="company"
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
                    disabled={isCreating || !form.name.trim() || !form.email.trim()}
                >
                    {isCreating ? "Creating..." : "Create Customer"}
                </Button>
            </ResponsiveDialog.Footer>
        </ResponsiveDialog>
    )
}
