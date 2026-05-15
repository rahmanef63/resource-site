/**
 * Document Checklist feature types.
 */

export type DocumentCategory = "local" | "international"
export type DocumentSubcategory =
  | "identity"
  | "education"
  | "professional"
  | "financial"
  | "health"
  | "travel"

export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: DocumentCategory
  subcategory: DocumentSubcategory
  required: boolean
  completed: boolean
  dueDate?: string
  notes?: string
}
