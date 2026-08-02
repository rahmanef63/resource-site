"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[docs] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Something broke</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This page hit an unexpected error. Retrying usually clears a transient
        glitch; if it persists the issue is on our side.
      </p>
      {error.digest && (
        <code className="mt-3 rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
          ref: {error.digest}
        </code>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>
          <RotateCw className="size-4" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" /> Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
