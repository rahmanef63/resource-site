"use client"

import * as React from "react"
import { useHeaderContextSafe } from "../context"
import {
  getTitleWrapperClasses,
  getTitleClasses,
  getSubtitleClasses,
  getIconContainerClasses,
  getIconSizeClass,
} from "../styles"
import type { HeaderTitleProps } from "../types"
import { cn } from "@/lib/utils"

export const HeaderTitle = React.forwardRef<HTMLDivElement, HeaderTitleProps>(
  ({ title, subtitle, icon: Icon, iconSize, size, className, children }, ref) => {
    const context = useHeaderContextSafe()
    const effectiveSize = size ?? context?.size ?? "md"

    return (
      <div
        ref={ref}
        className={getTitleWrapperClasses({
          layout: context?.layout,
          hasIcon: !!Icon,
          className,
        })}
      >
        {Icon && (
          <div className={getIconContainerClasses({ size: iconSize ?? effectiveSize })}>
            <Icon className={getIconSizeClass(iconSize ?? effectiveSize)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {(title || children) && (
            <h1 className={getTitleClasses({ size: effectiveSize })}>
              {children ?? title}
            </h1>
          )}
          {subtitle && (
            <p className={cn(getSubtitleClasses({ size: effectiveSize }), "hidden md:block")}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    )
  }
)
HeaderTitle.displayName = "HeaderTitle"
