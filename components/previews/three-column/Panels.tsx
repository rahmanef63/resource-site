/**
 * Compound Panel Components
 */

"use client"

import { cn } from "@/lib/utils"
import type { PanelProps } from "./types"

export function LeftPanel({ children, className }: PanelProps) {
  return <div className={cn("h-full", className)}>{children}</div>
}

export function CenterPanel({ children, className }: PanelProps) {
  return <div className={cn("h-full", className)}>{children}</div>
}

export function RightPanel({ children, className }: PanelProps) {
  return <div className={cn("h-full", className)}>{children}</div>
}
