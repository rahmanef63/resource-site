"use client"

import * as React from "react"
import { HeaderProvider } from "../context"
import { getHeaderContainerClasses } from "../styles"
import type { HeaderRootProps } from "../types"

export const HeaderRoot = React.forwardRef<HTMLDivElement, HeaderRootProps>(
  (
    {
      variant = "default",
      size = "md",
      layout = "standard",
      background = true,
      border = true,
      shadow = false,
      sticky = false,
      fullWidth = true,
      className,
      children,
    },
    ref
  ) => {
    return (
      <HeaderProvider
        variant={variant}
        size={size}
        layout={layout}
        sticky={sticky}
        background={background}
        border={border}
      >
        <header
          ref={ref}
          className={getHeaderContainerClasses({
            variant,
            size,
            layout,
            background,
            border,
            shadow,
            sticky,
            fullWidth,
            className,
          })}
        >
          {children}
        </header>
      </HeaderProvider>
    )
  }
)
HeaderRoot.displayName = "HeaderRoot"
