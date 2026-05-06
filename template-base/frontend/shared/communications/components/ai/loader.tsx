"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LoaderIcon } from "lucide-react"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width and height in pixels
   */
  size?: number
}

/**
 * Loader - Animated loader for AI streaming responses
 * 
 * Features:
 * - CSS animations that don't block the main thread
 * - Scales to any size without looking pixelated
 * - Inherits text color from parent
 * - Proper accessibility with role="status"
 */
function Loader({ size = 16, className, ...props }: LoaderProps) {
  return (
    <div
      data-slot="loader"
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <LoaderIcon
        className="animate-spin"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export { Loader }
export type { LoaderProps }
