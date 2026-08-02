"use client";

import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Parity reference — mirror this on every leaf component:
 *   - accept `className` and merge with `cn()` (twMerge), so a consumer
 *     override like `size-9` actually beats the default instead of leaving
 *     both classes and letting CSS source-order decide.
 *   - spread `...props` to the root element, so `ref` / `aria-*` / `data-*` /
 *     extra handlers pass through without forking the slice.
 */
export function ExampleButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="default"
      className={cn("gap-2", className)}
      {...props}
    >
      Example action
    </Button>
  );
}
