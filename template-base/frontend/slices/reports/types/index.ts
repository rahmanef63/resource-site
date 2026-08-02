/**
 * Reports Types
 */

export interface ReportsItem {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface ReportsFilter {
  query?: string
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}
