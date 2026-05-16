"use client";

import * as React from "react";
import { PREVIEW_DEFAULTS } from "../config";

/** IntersectionObserver-gated visibility. Returns ref + flag — caller
 *  attaches `ref` to the container, renders the iframe only when
 *  `visible` is true. Falls back to instant-visible in non-IO
 *  environments (SSR / older browsers).
 *
 *  Centralizes the pattern previously inlined in IframeThumbnail. */
export function useIframeLazyLoad<T extends HTMLElement = HTMLDivElement>(
  rootMargin: string = PREVIEW_DEFAULTS.thumbnailRootMargin,
) {
  const ref = React.useRef<T | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, visible } as const;
}
