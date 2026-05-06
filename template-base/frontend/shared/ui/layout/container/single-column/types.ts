/**
 * Single Column Layout Types
 */

import type { ReactNode } from "react"

export interface SingleColumnLayoutProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: string
  /** Max width constraint */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "screen-xl"
  /** Whether to center the content */
  centered?: boolean
  /** Padding preset */
  padding?: "none" | "sm" | "md" | "lg"
}
