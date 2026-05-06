"use client"

import * as React from "react"
import { useHeaderContextSafe } from "../context"
import { getHeaderBadgeClasses } from "../styles"
import type { HeaderBadgeProps } from "../types"

export const HeaderBadge = React.forwardRef<HTMLSpanElement, HeaderBadgeProps>(
  ({ text, variant = "default", icon: Icon, className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    return (
      <span
        ref={ref}
        className={getHeaderBadgeClasses({ variant, size, className })}
      >
        {Icon && <Icon className="mr-1 h-3 w-3" />}
        {text}
      </span>
    )
  }
)
HeaderBadge.displayName = "HeaderBadge"
