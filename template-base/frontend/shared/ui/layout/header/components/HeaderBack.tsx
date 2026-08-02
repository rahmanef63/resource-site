"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useHeaderContextSafe } from "../context"
import { getBackButtonClasses } from "../styles"
import type { HeaderBackProps } from "../types"

export const HeaderBack = React.forwardRef<HTMLButtonElement, HeaderBackProps>(
  ({ onClick, href, label = "Back", icon: CustomIcon, className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"
    const BackIcon = CustomIcon ?? ChevronLeft

    const content = (
      <>
        <BackIcon className="h-4 w-4" />
        {label && <span>{label}</span>}
      </>
    )

    if (href) {
      return (
        <Link
          href={href}
          className={getBackButtonClasses({ size, className })}
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={getBackButtonClasses({ size, className })}
      >
        {content}
      </button>
    )
  }
)
HeaderBack.displayName = "HeaderBack"
