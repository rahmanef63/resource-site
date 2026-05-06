/**
 * Form Block
 * 
 * Embeds a dynamic form using the FormPreview component.
 */

"use client"

import * as React from "react"
import FormPreview from "@/frontend/shared/forms/components/FormPreview"
import { BlockCard } from "../shared"
import { ClipboardList } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export interface FormField {
    id: string
    type: string
    label: string
    placeholder?: string
    helpText?: string
    required: boolean
    options?: { label: string; value: string }[]
    order: number
}

export interface FormBlockProps {
    title?: string
    description?: string
    fields: FormField[]
    submitButtonText?: string
    onSubmit?: (data: Record<string, any>) => void
    className?: string
    loading?: boolean
}

// ============================================================================
// Form Block
// ============================================================================

export function FormBlock({
    title = "Form",
    description,
    fields,
    submitButtonText,
    onSubmit,
    className,
    loading = false,
}: FormBlockProps) {
    if (loading) {
        return (
            <BlockCard loading={loading} header={{ title, icon: ClipboardList }} className={className} />
        )
    }

    return (
        <div className={className}>
            <FormPreview
                title={title}
                description={description}
                fields={fields}
                onSubmit={onSubmit}
                submitButtonText={submitButtonText}
                isPreview={false}
            />
        </div>
    )
}
