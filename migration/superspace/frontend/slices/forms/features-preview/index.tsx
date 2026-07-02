"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import FormBuilder, { type FormField } from "../components/FormBuilder"

const MOCK_FIELDS: FormField[] = [
  {
    id: "field_1", type: "text", order: 0,
    label: "Full name", placeholder: "Enter your full name",
    required: true,
  },
  {
    id: "field_2", type: "email", order: 1,
    label: "Email address", placeholder: "you@example.com",
    required: true,
    validation: { customMessage: "Use a valid email" },
  },
  {
    id: "field_3", type: "select", order: 2,
    label: "Industry",
    required: false,
    options: [
      { label: "F&B / Hospitality", value: "fnb" },
      { label: "Retail", value: "retail" },
      { label: "Services", value: "services" },
      { label: "Other", value: "other" },
    ],
  },
  {
    id: "field_4", type: "textarea", order: 3,
    label: "Tell us more",
    helpText: "What problem are you trying to solve?",
    required: false,
  },
]

function FormsPreview({ compact }: FeaturePreviewProps) {
  const [fields, setFields] = React.useState<FormField[]>(MOCK_FIELDS)

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Forms</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {fields.length} fields · drag-to-reorder builder
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Form builder</h3>
        <p className="text-xs text-muted-foreground">
          Drag-to-reorder fields, configure validation per field.
        </p>
      </div>
      <FormBuilder fields={fields} onChange={setFields} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "forms",
  name: "Forms",
  description: "Drag-to-reorder form builder with per-field validation.",
  component: FormsPreview,
  category: "productivity",
  tags: ["forms", "builder", "validation", "fields"],
  mockDataSets: [
    {
      id: "default",
      name: "Lead capture form",
      description: "Name, email, industry, and free-text fields.",
      data: { fields: MOCK_FIELDS },
    },
  ],
})
