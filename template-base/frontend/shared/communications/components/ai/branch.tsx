"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type MessageRole = "user" | "assistant" | "system"

interface BranchContextValue {
  currentBranch: number
  totalBranches: number
  nextBranch: () => void
  previousBranch: () => void
}

const BranchContext = React.createContext<BranchContextValue | null>(null)

function useBranch() {
  const context = React.useContext(BranchContext)
  if (!context) {
    throw new Error("useBranch must be used within a Branch")
  }
  return context
}

interface BranchProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Index of the branch to show by default
   */
  defaultBranch?: number
  /**
   * Callback when branch changes
   */
  onBranchChange?: (index: number) => void
}

/**
 * Branch - Response variation navigation for AI conversations
 * 
 * Features:
 * - Branch state management without Redux
 * - CSS transitions for smooth switching
 * - Shows "2 of 5" position indicator
 * - Keyboard navigation support
 */
function Branch({
  defaultBranch = 0,
  onBranchChange,
  className,
  children,
  ...props
}: BranchProps) {
  const [currentBranch, setCurrentBranch] = React.useState(defaultBranch)
  
  // Count children in BranchMessages
  const totalBranches = React.useMemo(() => {
    let count = 0
    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement<BranchMessagesProps>(child) &&
        child.type === BranchMessages
      ) {
        count = React.Children.count(child.props.children)
      }
    })
    return count
  }, [children])

  const nextBranch = React.useCallback(() => {
    const newIndex = Math.min(currentBranch + 1, totalBranches - 1)
    setCurrentBranch(newIndex)
    onBranchChange?.(newIndex)
  }, [currentBranch, totalBranches, onBranchChange])

  const previousBranch = React.useCallback(() => {
    const newIndex = Math.max(currentBranch - 1, 0)
    setCurrentBranch(newIndex)
    onBranchChange?.(newIndex)
  }, [currentBranch, onBranchChange])

  return (
    <BranchContext.Provider value={{ currentBranch, totalBranches, nextBranch, previousBranch }}>
      <div
        data-slot="branch"
        className={cn("space-y-2", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === BranchMessages) {
            return React.cloneElement(child as React.ReactElement<any>, {
              currentBranch,
            })
          }
          return child
        })}
      </div>
    </BranchContext.Provider>
  )
}

interface BranchMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Internal - passed by Branch
   */
  currentBranch?: number
}

/**
 * BranchMessages - Container for branch message variations
 */
function BranchMessages({ currentBranch = 0, className, children, ...props }: BranchMessagesProps) {
  const childArray = React.Children.toArray(children)

  return (
    <div
      data-slot="branch-messages"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div
        className="transition-transform duration-200"
        style={{ transform: `translateX(-${currentBranch * 100}%)` }}
      >
        <div className="flex">
          {childArray.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              aria-hidden={index !== currentBranch}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface BranchSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Aligns selector for user/assistant/system messages
   */
  from?: MessageRole
}

/**
 * BranchSelector - Navigation control container with alignment
 */
function BranchSelector({ from, className, children, ...props }: BranchSelectorProps) {
  const { totalBranches } = useBranch()

  if (totalBranches <= 1) return null

  return (
    <div
      data-slot="branch-selector"
      className={cn(
        "flex items-center gap-1",
        from === "user" && "justify-end",
        from === "assistant" && "justify-start",
        from === "system" && "justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface BranchNavigationProps extends React.ComponentProps<typeof Button> {}

/**
 * BranchPrevious - Navigation button to previous branch
 */
function BranchPrevious({ className, ...props }: BranchNavigationProps) {
  const { currentBranch, previousBranch } = useBranch()

  return (
    <Button
      data-slot="branch-previous"
      variant="ghost"
      size="icon"
      className={cn("size-6", className)}
      onClick={previousBranch}
      disabled={currentBranch === 0}
      aria-label="Previous branch"
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
    </Button>
  )
}

/**
 * BranchNext - Navigation button to next branch
 */
function BranchNext({ className, ...props }: BranchNavigationProps) {
  const { currentBranch, totalBranches, nextBranch } = useBranch()

  return (
    <Button
      data-slot="branch-next"
      variant="ghost"
      size="icon"
      className={cn("size-6", className)}
      onClick={nextBranch}
      disabled={currentBranch === totalBranches - 1}
      aria-label="Next branch"
      {...props}
    >
      <ChevronRightIcon className="size-4" />
    </Button>
  )
}

interface BranchPageProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * BranchPage - Branch position indicator
 */
function BranchPage({ className, ...props }: BranchPageProps) {
  const { currentBranch, totalBranches } = useBranch()

  return (
    <span
      data-slot="branch-page"
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {currentBranch + 1} of {totalBranches}
    </span>
  )
}

export {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
  useBranch,
}
export type {
  BranchProps,
  BranchMessagesProps,
  BranchSelectorProps,
  BranchNavigationProps,
  BranchPageProps,
}
