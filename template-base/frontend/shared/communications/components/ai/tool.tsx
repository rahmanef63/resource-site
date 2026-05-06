"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDownIcon } from "lucide-react"

type ToolState = "input-streaming" | "input-available" | "output-available" | "output-error"

interface ToolContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const ToolContext = React.createContext<ToolContextValue | null>(null)

interface ToolProps extends React.ComponentProps<typeof Collapsible> {
  /**
   * Initial expanded state
   */
  defaultOpen?: boolean
}

/**
 * Tool - Container component managing collapsible state
 * 
 * Displays AI function calls with:
 * - Collapsible containers with smooth animations
 * - Visual status badges (pending, running, completed, error)
 * - JSON-formatted parameter display
 * - Flexible output rendering
 */
function Tool({ defaultOpen = false, className, children, ...props }: ToolProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <ToolContext.Provider value={{ isOpen, setIsOpen }}>
      <Collapsible
        data-slot="tool"
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn(
          "rounded-lg border bg-muted/30",
          className
        )}
        {...props}
      >
        {children}
      </Collapsible>
    </ToolContext.Provider>
  )
}

interface ToolHeaderProps extends Omit<React.ComponentProps<typeof CollapsibleTrigger>, 'type'> {
  /**
   * Tool name/type
   */
  type: string
  /**
   * Execution state
   */
  state: ToolState
}

const stateLabels: Record<ToolState, string> = {
  "input-streaming": "Running",
  "input-available": "Pending",
  "output-available": "Completed",
  "output-error": "Error",
}

const stateVariants: Record<ToolState, "default" | "secondary" | "destructive" | "outline"> = {
  "input-streaming": "secondary",
  "input-available": "outline",
  "output-available": "default",
  "output-error": "destructive",
}

/**
 * ToolHeader - Header showing tool name and status badge
 */
function ToolHeader({ type, state, className, ...props }: ToolHeaderProps) {
  return (
    <CollapsibleTrigger
      data-slot="tool-header"
      className={cn(
        "flex w-full items-center justify-between gap-2 p-3 text-sm font-medium",
        "hover:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs">{type}</span>
        <Badge variant={stateVariants[state]} className="text-xs">
          {stateLabels[state]}
        </Badge>
      </div>
      <ChevronDownIcon className="size-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
    </CollapsibleTrigger>
  )
}

interface ToolContentProps extends React.ComponentProps<typeof CollapsibleContent> {}

/**
 * ToolContent - Container for tool parameters and results
 */
function ToolContent({ className, children, ...props }: ToolContentProps) {
  return (
    <CollapsibleContent
      data-slot="tool-content"
      className={cn("border-t", className)}
      {...props}
    >
      <div className="p-3 space-y-3">
        {children}
      </div>
    </CollapsibleContent>
  )
}

interface ToolInputProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Tool parameters (displayed as JSON)
   */
  input: any
}

/**
 * ToolInput - Display for tool input parameters
 */
function ToolInput({ input, className, ...props }: ToolInputProps) {
  return (
    <div data-slot="tool-input" className={cn("space-y-1", className)} {...props}>
      <span className="text-xs font-medium text-muted-foreground">Input</span>
      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
        {JSON.stringify(input, null, 2)}
      </pre>
    </div>
  )
}

interface ToolOutputProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Tool execution result
   */
  output?: React.ReactNode
  /**
   * Error message if failed
   */
  errorText?: string
}

/**
 * ToolOutput - Display for tool results or errors
 */
function ToolOutput({ output, errorText, className, ...props }: ToolOutputProps) {
  return (
    <div data-slot="tool-output" className={cn("space-y-1", className)} {...props}>
      <span className="text-xs font-medium text-muted-foreground">
        {errorText ? "Error" : "Output"}
      </span>
      {errorText ? (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {errorText}
        </div>
      ) : (
        <div className="text-sm bg-muted p-2 rounded">
          {typeof output === "string" ? (
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{output}</pre>
          ) : (
            output
          )}
        </div>
      )}
    </div>
  )
}

export { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput }
export type { 
  ToolProps, 
  ToolHeaderProps, 
  ToolContentProps, 
  ToolInputProps, 
  ToolOutputProps, 
  ToolState 
}
