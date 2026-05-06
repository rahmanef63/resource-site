"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useHeaderContextSafe } from "../context"
import {
  getBreadcrumbsContainerClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbSeparatorClasses,
} from "../styles"
import type { HeaderBreadcrumbsProps } from "../types"

export const HeaderBreadcrumbs = React.forwardRef<HTMLDivElement, HeaderBreadcrumbsProps>(
  ({ items, separator, maxItems = 5, className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    // Collapse breadcrumbs if too many
    const displayItems = React.useMemo(() => {
      if (items.length <= maxItems) return items
      
      const first = items.slice(0, 1)
      const last = items.slice(-2)
      return [...first, { label: "...", isCurrent: false }, ...last]
    }, [items, maxItems])

    const defaultSeparator = <ChevronRight className="h-3.5 w-3.5" />

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={getBreadcrumbsContainerClasses({ size, className })}
      >
        <ol className="flex items-center gap-1">
          {displayItems.map((item, index) => {
            const ItemIcon = item.icon
            const isLast = index === displayItems.length - 1
            const isLink = !!(item.href || item.onClick)

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className={getBreadcrumbSeparatorClasses()}>
                    {separator ?? defaultSeparator}
                  </span>
                )}
                {isLink && !item.isCurrent ? (
                  item.href ? (
                    <Link
                      href={item.href}
                      className={getBreadcrumbItemClasses({ isLink: true, isCurrent: item.isCurrent })}
                    >
                      {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={getBreadcrumbItemClasses({ isLink: true, isCurrent: item.isCurrent })}
                    >
                      {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                      <span>{item.label}</span>
                    </button>
                  )
                ) : (
                  <span
                    className={getBreadcrumbItemClasses({
                      isLink: false,
                      isCurrent: item.isCurrent || isLast,
                    })}
                    aria-current={item.isCurrent || isLast ? "page" : undefined}
                  >
                    {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)
HeaderBreadcrumbs.displayName = "HeaderBreadcrumbs"
