"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Portable copy-to-clipboard button — shows a transient "Copied" state
// inline. No toast/notification dependency; the consumer can wrap or
// restyle via className.
export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked — no-op */
        }
      }}
      className={cn(
        "inline-flex h-auto items-center gap-2 border-2 border-current rounded-md px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium transition-colors hover:bg-current hover:text-background",
        className,
      )}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}
