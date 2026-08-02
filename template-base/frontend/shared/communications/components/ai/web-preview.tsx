"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  ChevronDownIcon, 
  RefreshCwIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  ExternalLinkIcon,
} from "lucide-react"

// Context for WebPreview state management
interface WebPreviewContextValue {
  url: string
  setUrl: (url: string) => void
  navigate: (url: string) => void
}

const WebPreviewContext = React.createContext<WebPreviewContextValue>({
  url: "",
  setUrl: () => {},
  navigate: () => {},
})

// ============================================================================
// WebPreview
// ============================================================================

interface WebPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Initial URL to load
   */
  defaultUrl?: string
  /**
   * Callback when URL changes
   */
  onUrlChange?: (url: string) => void
}

/**
 * WebPreview - Container for live iframe preview
 * 
 * Preview AI-generated websites with navigation controls.
 * 
 * @example
 * ```tsx
 * <WebPreview defaultUrl="https://example.com">
 *   <WebPreviewNavigation>
 *     <WebPreviewUrl />
 *   </WebPreviewNavigation>
 *   <WebPreviewBody />
 * </WebPreview>
 * ```
 */
function WebPreview({ 
  defaultUrl = "", 
  onUrlChange, 
  className, 
  children, 
  ...props 
}: WebPreviewProps) {
  const [url, setUrlState] = React.useState(defaultUrl)

  const setUrl = React.useCallback((newUrl: string) => {
    setUrlState(newUrl)
  }, [])

  const navigate = React.useCallback((newUrl: string) => {
    setUrlState(newUrl)
    onUrlChange?.(newUrl)
  }, [onUrlChange])

  return (
    <WebPreviewContext.Provider value={{ url, setUrl, navigate }}>
      <div
        data-slot="web-preview"
        className={cn("flex flex-col rounded-lg border bg-card overflow-hidden", className)}
        {...props}
      >
        {children}
      </div>
    </WebPreviewContext.Provider>
  )
}

// ============================================================================
// WebPreviewNavigation
// ============================================================================

interface WebPreviewNavigationProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Navigation bar container
 */
function WebPreviewNavigation({ className, children, ...props }: WebPreviewNavigationProps) {
  return (
    <div
      data-slot="web-preview-navigation"
      className={cn("flex items-center gap-2 px-2 py-1.5 border-b bg-muted/30", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// WebPreviewNavigationButton
// ============================================================================

interface WebPreviewNavigationButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  /**
   * Tooltip text on hover
   */
  tooltip?: string
}

/**
 * Navigation control button with tooltip
 */
function WebPreviewNavigationButton({ 
  tooltip, 
  className, 
  children, 
  ...props 
}: WebPreviewNavigationButtonProps) {
  const button = (
    <Button
      data-slot="web-preview-navigation-button"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      {...props}
    >
      {children}
    </Button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

// ============================================================================
// WebPreviewUrl
// ============================================================================

interface WebPreviewUrlProps extends Omit<React.ComponentPropsWithoutRef<typeof Input>, 'value' | 'onChange'> {
  /**
   * URL value (overrides context)
   */
  value?: string
  /**
   * Input change handler
   */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  /**
   * Keyboard event handler
   */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

/**
 * URL input field with Enter key navigation
 */
function WebPreviewUrl({ value, onChange, onKeyDown, className, ...props }: WebPreviewUrlProps) {
  const { url, setUrl, navigate } = React.useContext(WebPreviewContext)
  const currentValue = value ?? url

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (onChange) {
      onChange(e)
    } else {
      setUrl(e.target.value)
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      navigate(currentValue)
    }
    onKeyDown?.(e)
  }

  return (
    <Input
      data-slot="web-preview-url"
      type="url"
      value={currentValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Enter URL..."
      className={cn("h-7 flex-1 text-xs", className)}
      {...props}
    />
  )
}

// ============================================================================
// WebPreviewBody
// ============================================================================

interface WebPreviewBodyProps extends Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, 'src' | 'loading'> {
  /**
   * URL to load (overrides context)
   */
  src?: string
  /**
   * Loading indicator overlay
   */
  loadingIndicator?: React.ReactNode
  /**
   * Native iframe loading attribute
   */
  loading?: "lazy" | "eager"
}

/**
 * Iframe container for preview content
 */
function WebPreviewBody({ src, loadingIndicator, loading, className, ...props }: WebPreviewBodyProps) {
  const { url } = React.useContext(WebPreviewContext)
  const currentSrc = src ?? url
  const [isLoading, setIsLoading] = React.useState(!!currentSrc)

  return (
    <div className="relative flex-1 min-h-[300px]">
      {isLoading && loadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          {loadingIndicator}
        </div>
      )}
      {currentSrc ? (
        <iframe
          data-slot="web-preview-body"
          src={currentSrc}
          loading={loading}
          className={cn("w-full h-full border-0", className)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setIsLoading(false)}
          {...props}
        />
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center text-muted-foreground", className)}>
          <span className="text-sm">Enter a URL to preview</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// WebPreviewConsole
// ============================================================================

interface ConsoleLog {
  level: 'log' | 'warn' | 'error' | 'info'
  message: string
  timestamp: Date | string
}

interface WebPreviewConsoleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Console log entries
   */
  logs?: ConsoleLog[]
}

/**
 * Collapsible console for log output
 */
function WebPreviewConsole({ logs = [], className, ...props }: WebPreviewConsoleProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        data-slot="web-preview-console"
        className={cn("border-t", className)}
        {...props}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent/50">
          <ChevronDownIcon className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
          <span>Console</span>
          {logs.length > 0 && (
            <span className="ml-auto text-muted-foreground">{logs.length} entries</span>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="max-h-32 overflow-y-auto bg-muted/30 px-3 py-2 font-mono text-xs">
            {logs.length === 0 ? (
              <span className="text-muted-foreground">No console output</span>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "py-0.5",
                    log.level === 'error' && "text-destructive",
                    log.level === 'warn' && "text-yellow-500",
                    log.level === 'info' && "text-blue-500"
                  )}
                >
                  [{log.level}] {log.message}
                </div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
}
export type {
  WebPreviewProps,
  WebPreviewNavigationProps,
  WebPreviewNavigationButtonProps,
  WebPreviewUrlProps,
  WebPreviewBodyProps,
  WebPreviewConsoleProps,
  ConsoleLog,
}
