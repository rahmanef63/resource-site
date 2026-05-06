"use client"

import * as React from "react"
import { useHeaderContextSafe } from "../context"
import { getToolbarClasses } from "../styles"
import type { HeaderToolbarProps } from "../types"

export const HeaderToolbar = React.forwardRef<HTMLDivElement, HeaderToolbarProps>(
  ({ className, children }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    return (
      <div
        ref={ref}
        className={getToolbarClasses({ size, border: true, className })}
      >
        {children}
      </div>
    )
  }
)
HeaderToolbar.displayName = "HeaderToolbar"
