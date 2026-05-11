"use client";

/**
 * Wraps page content with the user's current width preference.
 *
 *   <WidthContainer>
 *     <YourDashboard />
 *   </WidthContainer>
 *
 * Use `as="section" | "main" | "div"` to control the rendered element.
 * Pass `force` to override the user preference for routes that should
 * always be full-width (e.g. /admin/exports table) or always contained
 * (e.g. marketing pages).
 */

import * as React from "react";
import { useFullWidth, widthClass, type WidthMode } from "../lib/use-full-width";

interface WidthContainerProps {
  children: React.ReactNode;
  as?: "div" | "main" | "section" | "article";
  /** Force a width regardless of user preference. */
  force?: WidthMode;
  className?: string;
}

export function WidthContainer({
  children,
  as = "div",
  force,
  className,
}: WidthContainerProps) {
  const [mode] = useFullWidth();
  const effective = force ?? mode;
  const Tag = as;
  return (
    <Tag className={[widthClass(effective), className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
