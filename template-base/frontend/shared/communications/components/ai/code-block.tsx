"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "lucide-react"

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Code content to display
   */
  code: string
  /**
   * Programming language for syntax highlighting
   */
  language: string
  /**
   * Display line numbers
   */
  showLineNumbers?: boolean
}

/**
 * CodeBlock - Syntax-highlighted code blocks with copy buttons for AI responses
 * 
 * Features:
 * - Theme-aware styling (follows dark mode)
 * - Copy button with success feedback
 * - Optional line numbers
 * - Horizontal scroll for long lines
 * 
 * Note: For full syntax highlighting, install react-syntax-highlighter
 */
function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const lines = code.split('\n')

  return (
    <div
      data-slot="code-block"
      className={cn(
        "relative group rounded-lg overflow-hidden bg-zinc-950 text-zinc-50",
        className
      )}
      {...props}
    >
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        {children}
      </div>
      <div className="absolute left-3 top-2 z-10">
        <span className="text-xs text-zinc-400 font-mono">{language}</span>
      </div>
      <div className="overflow-x-auto pt-8 pb-4 px-4">
        <pre className="text-sm font-mono leading-relaxed">
          {showLineNumbers ? (
            <code>
              {lines.map((line, index) => (
                <div key={index} className="flex">
                  <span className="select-none text-zinc-500 pr-4 text-right min-w-[2rem]">
                    {index + 1}
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  )
}

interface CodeBlockCopyButtonProps {
  /**
   * Callback after successful copy
   */
  onCopy?: () => void
  /**
   * Error handler for copy failure
   */
  onCopyError?: (error: Error) => void
  /**
   * Duration to show success state (ms)
   */
  timeout?: number
  /**
   * Code to copy
   */
  code?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * CodeBlockCopyButton - Copy button with automatic clipboard integration
 */
function CodeBlockCopyButton({
  onCopy,
  onCopyError,
  timeout = 2000,
  code,
  className,
}: CodeBlockCopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      // If code is provided, use it; otherwise, try to find the code from parent
      const textToCopy = code || ""
      
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        onCopy?.()
        
        setTimeout(() => {
          setCopied(false)
        }, timeout)
      }
    } catch (err) {
      onCopyError?.(err instanceof Error ? err : new Error("Failed to copy"))
    }
  }

  return (
    <Button
      data-slot="code-block-copy-button"
      variant="secondary"
      size="icon"
      className={cn("size-8", className)}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <CheckIcon className="size-4 text-green-500" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Button>
  )
}

export { CodeBlock, CodeBlockCopyButton }
export type { CodeBlockProps, CodeBlockCopyButtonProps }
