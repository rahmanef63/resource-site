"use client"

import React from "react"
import {
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Calendar,
  Clock,
  List,
  CheckSquare,
  Circle,
  Upload,
  Star,
  PenTool,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { SharedDatePicker } from "@/frontend/shared/foundation/utils/datepicker"
import { format, parseISO } from "date-fns"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    customMessage?: string
  }
  options?: { label: string; value: string }[]
  defaultValue?: unknown
  order: number
}

interface FormPreviewProps {
  title: string
  description?: string
  fields: FormField[]
  onSubmit?: (data: Record<string, any>) => void
  submitButtonText?: string
  isPreview?: boolean
}

/**
 * Form Preview/Render Component
 * Renders form fields for preview or actual submission
 */
export default function FormPreview({
  title,
  description,
  fields,
  onSubmit,
  submitButtonText = "Submit",
  isPreview = true,
}: FormPreviewProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({})

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && !isPreview) {
      onSubmit(formData)
    }
  }

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      disabled: isPreview,
    }

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            {...commonProps}
            type={field.type === "phone" ? "tel" : field.type}
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        )

      case "textarea":
        return (
          <Textarea
            {...commonProps}
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            rows={3}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        )

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case "date": {
        const raw = (formData[field.id] as string | undefined) || ""
        const parsed = raw ? parseISO(raw) : undefined
        return (
          <SharedDatePicker
            date={parsed}
            onChange={(d) => handleChange(field.id, d ? format(d, "yyyy-MM-dd") : "")}
            placeholder={field.placeholder ?? "Pick a date"}
            disabled={isPreview}
          />
        )
      }

      case "datetime":
        return (
          <Input
            {...commonProps}
            type="datetime-local"
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        )

      case "time":
        return (
          <Input
            {...commonProps}
            type="time"
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        )

      case "select":
        return (
          <Select
            value={formData[field.id] || ""}
            onValueChange={(value) => handleChange(field.id, value)}
            disabled={isPreview}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multiselect":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={(formData[field.id] || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const current = formData[field.id] || []
                    if (checked) {
                      handleChange(field.id, [...current, option.value])
                    } else {
                      handleChange(
                        field.id,
                        current.filter((v: string) => v !== option.value)
                      )
                    }
                  }}
                  disabled={isPreview}
                />
                <Label htmlFor={`${field.id}-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={formData[field.id] || false}
              onCheckedChange={(checked) => handleChange(field.id, checked)}
              disabled={isPreview}
            />
            <Label htmlFor={field.id} className="font-normal">
              {field.placeholder || "I agree"}
            </Label>
          </div>
        )

      case "radio":
        return (
          <RadioGroup
            value={formData[field.id] || ""}
            onValueChange={(value) => handleChange(field.id, value)}
            disabled={isPreview}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "file":
        return (
          <Input
            {...commonProps}
            type="file"
            onChange={(e) => handleChange(field.id, e.target.files)}
          />
        )

      case "rating":
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => !isPreview && handleChange(field.id, star)}
                className="p-1 hover:scale-110 transition-transform"
                disabled={isPreview}
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= (formData[field.id] || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        )

      case "signature":
        return (
          <div className="border rounded-lg h-24 flex items-center justify-center bg-muted/50">
            <span className="text-sm text-muted-foreground">
              Signature pad will appear here
            </span>
          </div>
        )

      case "divider":
        return <hr className="border-border" />

      default:
        return (
          <Input
            {...commonProps}
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        )
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {isPreview && (
          <div className="text-xs text-muted-foreground bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded inline-block">
            Preview Mode - Form is not interactive
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) =>
              field.type === "divider" ? (
                <div key={field.id} className="py-2">
                  <hr className="border-border" />
                </div>
              ) : (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                  {field.helpText && (
                    <p className="text-xs text-muted-foreground">{field.helpText}</p>
                  )}
                </div>
              )
            )}

          {fields.length > 0 && (
            <Button type="submit" disabled={isPreview} className="w-full">
              {submitButtonText}
            </Button>
          )}

          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No fields added yet. Add fields to see the preview.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
