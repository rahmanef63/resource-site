"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IFRAME_SANDBOX, type IframeOverrides, type IframeSandboxToken } from "./types";

type Props = {
  src: string;
  /** A11y title (also surfaces as iframe title attr). */
  title?: string;
  /** Sandbox preset OR explicit string. Default = PREVIEW (sandboxed). */
  sandbox?: IframeSandboxToken | string;
  /** Native iframe loading attr. Defaults to "lazy". */
  loading?: "lazy" | "eager";
  /** Block pointer events — used by thumbnails to keep card-click intact. */
  pointerEventsNone?: boolean;
  /** onLoad callback (for skeleton swap). */
  onLoad?: () => void;
  /** Misc native iframe overrides (referrerPolicy / allow / etc). */
  iframeOverrides?: Omit<IframeOverrides, "title" | "sandbox" | "loading" | "onLoad">;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The atomic iframe element used by every preview surface — thumbnail,
 * canvas, dialog. Centralizes sandbox/referrerPolicy/loading so we
 * don't duplicate those attributes per consumer.
 */
export function PreviewIframe({
  src,
  title = "Preview",
  sandbox = "PREVIEW",
  loading = "lazy",
  pointerEventsNone = false,
  onLoad,
  iframeOverrides,
  className,
  style,
}: Props) {
  const resolvedSandbox =
    sandbox in IFRAME_SANDBOX ? IFRAME_SANDBOX[sandbox as IframeSandboxToken] : sandbox;
  return (
    <iframe
      src={src}
      title={title}
      loading={loading}
      sandbox={resolvedSandbox}
      referrerPolicy={iframeOverrides?.referrerPolicy ?? "no-referrer"}
      allow={iframeOverrides?.allow}
      onLoad={onLoad}
      tabIndex={pointerEventsNone ? -1 : undefined}
      aria-hidden={pointerEventsNone || undefined}
      className={cn(
        "border-0 bg-background",
        pointerEventsNone && "pointer-events-none",
        className,
      )}
      style={style}
    />
  );
}
