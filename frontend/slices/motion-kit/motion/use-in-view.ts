"use client";

import * as React from "react";
import { observeInView, type InViewOptions } from "../lib/core";

export function useInView<T extends HTMLElement>(options: InViewOptions = {}) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return observeInView(element, setInView, options);
  }, [options.once, options.root, options.rootMargin, options.threshold]);

  return { ref, inView };
}
