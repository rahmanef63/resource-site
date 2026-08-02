"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRightIcon, FileIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// ============================================================================
// Task
// ============================================================================

interface TaskProps extends React.ComponentPropsWithoutRef<typeof Collapsible> {
  /**
   * Initial expanded state
   */
  defaultOpen?: boolean
}

/**
 * Task - Collapsible task container
 * 
 * Shows AI's work progress with file references and status tracking.
 * 
 * @example
 * ```tsx
 * <Task>
 *   <TaskTrigger title="Analyzing project structure" />
 *   <TaskContent>
 *     <TaskItem>Scanning workspace for config files</TaskItem>
 *     <TaskItem>
 *       Found <TaskItemFile>package.json</TaskItemFile>
 *     </TaskItem>
 *   </TaskContent>
 * </Task>
 * ```
 */
function Task({ defaultOpen = false, className, ...props }: TaskProps) {
  return (
    <Collapsible
      data-slot="task"
      defaultOpen={defaultOpen}
      className={cn("rounded-lg border bg-card text-card-foreground", className)}
      {...props}
    />
  )
}

// ============================================================================
// TaskTrigger
// ============================================================================

interface TaskTriggerProps extends Omit<React.ComponentPropsWithoutRef<typeof CollapsibleTrigger>, 'title'> {
  /**
   * Task title to display
   */
  title: string
  /**
   * Task status for visual indicator
   */
  status?: 'pending' | 'in_progress' | 'completed'
}

/**
 * Clickable header showing task title
 */
function TaskTrigger({ title, status, className, ...props }: TaskTriggerProps) {
  return (
    <CollapsibleTrigger
      data-slot="task-trigger"
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 text-sm font-medium hover:bg-accent/50 transition-colors",
        "[&[data-state=open]>svg]:rotate-90",
        className
      )}
      {...props}
    >
      <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
      <span className="flex-1 text-left">{title}</span>
      {status && (
        <Badge 
          variant={status === 'completed' ? 'default' : status === 'in_progress' ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {status === 'completed' ? '✓' : status === 'in_progress' ? '...' : '○'}
        </Badge>
      )}
    </CollapsibleTrigger>
  )
}

// ============================================================================
// TaskContent
// ============================================================================

interface TaskContentProps extends React.ComponentPropsWithoutRef<typeof CollapsibleContent> {}

/**
 * Container for task items with animations
 */
function TaskContent({ className, ...props }: TaskContentProps) {
  return (
    <CollapsibleContent
      data-slot="task-content"
      className={cn(
        "overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    >
      <div className="px-3 pb-3 pt-1 border-t space-y-1.5">
        {props.children}
      </div>
    </CollapsibleContent>
  )
}

// ============================================================================
// TaskItem
// ============================================================================

interface TaskItemProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Individual task item with progress indicator
 */
function TaskItem({ className, children, ...props }: TaskItemProps) {
  return (
    <div
      data-slot="task-item"
      className={cn(
        "flex items-start gap-2 text-sm text-muted-foreground pl-6",
        className
      )}
      {...props}
    >
      <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      <span className="flex-1">{children}</span>
    </div>
  )
}

// ============================================================================
// TaskItemFile
// ============================================================================

interface TaskItemFileProps extends React.ComponentPropsWithoutRef<'span'> {
  /**
   * Optional file icon
   */
  icon?: React.ReactNode
}

/**
 * File reference badge with optional icon
 */
function TaskItemFile({ icon, className, children, ...props }: TaskItemFileProps) {
  return (
    <span
      data-slot="task-item-file"
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-xs font-mono",
        className
      )}
      {...props}
    >
      {icon || <FileIcon className="h-3 w-3 opacity-50" />}
      {children}
    </span>
  )
}

export {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
}
export type {
  TaskProps,
  TaskTriggerProps,
  TaskContentProps,
  TaskItemProps,
  TaskItemFileProps,
}
