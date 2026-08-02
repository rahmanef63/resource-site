"use client";
// Render published HTML in a sandboxed iframe via srcDoc, so an admin can see
// the clean output before publishing. Scripts are NOT allowed (sandbox omits
// allow-scripts) — published pages carry no runtime anyway.

import type { CSSProperties } from "react";

export interface PublishPreviewProps {
  /** A full HTML document (from publishPage(...).html). */
  html: string;
  className?: string;
  title?: string;
  /** Iframe height (number = px). */
  height?: number | string;
}

export function PublishPreview({
  html,
  className,
  title = "Preview",
  height = 480,
}: PublishPreviewProps) {
  const style: CSSProperties = { width: "100%", height, border: 0 };
  return (
    <iframe
      title={title}
      srcDoc={html}
      sandbox="allow-same-origin"
      className={className}
      style={style}
    />
  );
}
