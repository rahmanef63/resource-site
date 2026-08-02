"use client"

import * as React from "react"
import { getHeaderSectionClasses } from "../styles"
import type { HeaderSectionProps } from "../types"

export const HeaderSection = React.forwardRef<HTMLDivElement, HeaderSectionProps>(
  ({ position, align, className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={getHeaderSectionClasses({ position, align, className })}
      >
        {children}
      </div>
    )
  }
)
HeaderSection.displayName = "HeaderSection"
