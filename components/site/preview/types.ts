/**
 * Live-preview module — type SSOT.
 *
 * Every preview surface (catalog thumbnail, hover-trigger dialog, slice
 * detail page) consumes the same normalized PreviewSource and the same
 * enum tokens for sandboxing / context. Stop duplicating string literals.
 */

import type { PreviewView, PreviewOrientation } from "@/lib/preview-presets";

/** Which surface a dual-preview entry opens first. */
export type PreviewSurfaceMode = "public" | "admin";

/** Normalized live-preview reference. Build with `normalizePreviewSource`
 *  from a SliceEntry / LayoutEntry or supply directly. */
export type PreviewSource = {
  /** Public iframe src. */
  publicPath: string;
  /** Optional admin iframe src for dual-surface slices/templates. */
  adminPath?: string;
  /** BR-wave — canonical external URLs for "Open in new tab" links
   *  in the LivePreviewButton + detail-page split-pane toolbars.
   *  Iframes still load publicPath/adminPath (same origin, localStorage
   *  preserved); only the new-tab destinations switch to these. Set
   *  by `normalizePreviewSource()` when the upstream entry has a
   *  matching demo subdomain mapping. */
  publicExternalUrl?: string;
  adminExternalUrl?: string;
  /** Which surface opens first when both present. Default "public". */
  defaultSurface?: PreviewSurfaceMode;
  /** Initial viewport preset. Default PREVIEW_DEFAULTS.view. */
  defaultView?: PreviewView;
  /** Initial zoom (1.0 = real size). */
  defaultZoom?: number;
  /** Optional dialog/A11y title. */
  title?: string;
};

/** Iframe sandbox tokens. Centralized so callers can't typo. */
export const IFRAME_SANDBOX = {
  /** Default — sandboxed previews. Blocks forms, top-nav, popups. */
  PREVIEW: "allow-scripts allow-same-origin",
  /** Permissive — first-party detail iframe. Allows form submit / popups. */
  INTERACTIVE: "allow-scripts allow-same-origin allow-forms allow-popups",
} as const;

export type IframeSandboxToken = keyof typeof IFRAME_SANDBOX;

/** Where the iframe lives — affects sizing/lazy/interaction strategy. */
export const PREVIEW_CONTEXT = {
  THUMBNAIL: "thumbnail",
  DIALOG: "dialog",
  DETAIL: "detail",
} as const;

export type PreviewContext = (typeof PREVIEW_CONTEXT)[keyof typeof PREVIEW_CONTEXT];

/** Viewport state shared by detail-page PreviewFrame chrome. */
export type PreviewState = {
  view: PreviewView;
  zoom: number;
  orientation: PreviewOrientation;
  iframeKey: number;
  fullscreen: boolean;
};

/** Custom override slot for any preview surface — lets host apps tweak
 *  the iframe element (extra headers via referrerPolicy, custom title,
 *  inline allow attribute, custom onLoad) without forking the component. */
export type IframeOverrides = {
  title?: string;
  sandbox?: IframeSandboxToken | string;
  referrerPolicy?: React.IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"];
  allow?: string;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
};
