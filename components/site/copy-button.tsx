"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  className,
  size = "icon",
}: {
  value: string;
  className?: string;
  size?: "icon" | "sm" | "default";
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={copy}
      aria-label="Copy"
      className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}
