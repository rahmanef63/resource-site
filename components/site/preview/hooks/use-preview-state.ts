"use client";

import * as React from "react";
import type { PreviewView, PreviewOrientation } from "@/lib/preview-presets";
import { PREVIEW_DEFAULTS, previewStorageKey } from "../config";
import type { PreviewState } from "../types";

type Options = {
  defaultView?: PreviewView;
  defaultZoom?: number;
  defaultOrientation?: PreviewOrientation;
  /** When set, view + zoom persist to localStorage under `${prefix}${storageKey}`. */
  storageKey?: string;
};

type Actions = {
  setView: (view: PreviewView) => void;
  setZoom: (zoom: number) => void;
  setOrientation: (o: PreviewOrientation) => void;
  toggleOrientation: () => void;
  refreshIframe: () => void;
  setFullscreen: (b: boolean) => void;
  toggleFullscreen: () => void;
};

/** Single source of state for any preview chrome — view, zoom,
 *  orientation, iframe refresh key, fullscreen toggle. Optional
 *  localStorage persistence. Replaces the bag of `useState` calls
 *  previously inlined in PreviewFrame. */
export function usePreviewState(opts: Options = {}): PreviewState & Actions {
  const {
    defaultView = PREVIEW_DEFAULTS.view,
    defaultZoom = PREVIEW_DEFAULTS.zoom,
    defaultOrientation = "portrait",
    storageKey,
  } = opts;

  const persistKey = storageKey ? previewStorageKey(storageKey) : null;

  // Hydrate from localStorage (best-effort — SSR-safe). Runs once.
  const initial = React.useMemo<Partial<PreviewState>>(() => {
    if (!persistKey || typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(persistKey);
      if (!raw) return {};
      return JSON.parse(raw) as Partial<PreviewState>;
    } catch {
      return {};
    }
  }, [persistKey]);

  const [view, setView] = React.useState<PreviewView>(initial.view ?? defaultView);
  const [zoom, setZoom] = React.useState<number>(initial.zoom ?? defaultZoom);
  const [orientation, setOrientation] = React.useState<PreviewOrientation>(
    initial.orientation ?? defaultOrientation,
  );
  const [iframeKey, setIframeKey] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);

  // Persist on changes.
  React.useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        persistKey,
        JSON.stringify({ view, zoom, orientation }),
      );
    } catch {
      // Ignore quota / privacy errors.
    }
  }, [persistKey, view, zoom, orientation]);

  const toggleOrientation = React.useCallback(
    () => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait")),
    [],
  );
  const refreshIframe = React.useCallback(() => setIframeKey((k) => k + 1), []);
  const toggleFullscreen = React.useCallback(() => setFullscreen((f) => !f), []);

  return {
    view,
    zoom,
    orientation,
    iframeKey,
    fullscreen,
    setView,
    setZoom,
    setOrientation,
    toggleOrientation,
    refreshIframe,
    setFullscreen,
    toggleFullscreen,
  };
}
