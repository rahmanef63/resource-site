"use client";

import * as React from "react";

/** Tracks whether the iframe has fired its load event. Used to swap
 *  skeleton → real content in catalog thumbnails. */
export function useIframeLoaded() {
  const [loaded, setLoaded] = React.useState(false);
  const onLoad = React.useCallback(() => setLoaded(true), []);
  const reset = React.useCallback(() => setLoaded(false), []);
  return { loaded, onLoad, reset } as const;
}
