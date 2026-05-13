"use client"

import * as React from "react"
import NextLink from "next/link"

/**
 * Canonical link primitive for user-configurable hrefs (storefront builder
 * blocks, CMS-rendered content, user-generated snippets).
 *
 * Routing rules:
 *  - Internal routes (`/foo`, `#anchor`)   → `next/link` (prefetch + soft nav).
 *  - External (`https://…`, `//…`)         → `<a target="_blank" rel="noopener noreferrer">`.
 *  - `mailto:` / `tel:` / `sms:` schemes   → `<a>` without target (OS handler).
 *
 * Using `<Link>` for external URLs "works" but suppresses the security
 * attributes reviewers want to see. This helper makes the intent explicit
 * and keeps each rendered tag correct for its href class.
 */
function classifyHref(
  href: string,
): "internal" | "external" | "protocol" {
  if (!href) return "internal"
  // Protocol-relative `//example.com` and absolute `https://…` must be
  // classified as external BEFORE the `/`-prefix check below, because
  // `//x` also starts with `/`.
  if (/^(https?:)?\/\//i.test(href)) return "external"
  if (/^(mailto:|tel:|sms:|ftp:)/i.test(href)) return "protocol"
  if (href.startsWith("/") || href.startsWith("#")) return "internal"
  // Relative paths without a leading `/` are treated as internal so the
  // builder can serve templates that ship with `about.html` style hrefs.
  return "internal"
}

export interface SmartLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string
  /** Override the target for internal links (e.g. `_blank`). No effect on protocol URLs. */
  externalTarget?: "_blank" | "_self"
  children: React.ReactNode
}

export const SmartLink = React.forwardRef<HTMLAnchorElement, SmartLinkProps>(
  function SmartLink(
    { href, externalTarget = "_blank", children, rel, target, ...rest },
    ref,
  ) {
    const kind = classifyHref(href)

    if (kind === "internal") {
      return (
        <NextLink
          ref={ref as unknown as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          {...rest}
        >
          {children}
        </NextLink>
      )
    }

    if (kind === "external") {
      return (
        <a
          ref={ref}
          href={href}
          target={target ?? externalTarget}
          rel={rel ?? "noopener noreferrer"}
          {...rest}
        >
          {children}
        </a>
      )
    }

    // protocol (mailto/tel/sms/ftp) — let the OS handle it, no target.
    return (
      <a ref={ref} href={href} rel={rel} {...rest}>
        {children}
      </a>
    )
  },
)
