"use client";

import * as React from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const INSTALL_CMD = "npx rr add notion-database";
const DOCS_URL =
  "https://github.com/rahmanef63/open-silong/tree/main/template-base/database-silong";

export function InstallCTA() {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      toast.success("Copied to clipboard", { description: INSTALL_CMD });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Select the command and copy manually.",
      });
    }
  }, []);

  return (
    <Card className="mb-6 border-border bg-card">
      <CardHeader className="gap-2">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base font-semibold text-foreground">
            Install this slice
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Drop the full Notion-style database into your project. Pick the
          backend mode that matches your stack.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <code
            className="flex-1 truncate rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground"
            aria-label="Install command"
          >
            {INSTALL_CMD}
          </code>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              aria-label="Copy install command"
            >
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button asChild type="button" size="sm">
              <a href={DOCS_URL} target="_blank" rel="noreferrer noopener">
                <ExternalLink className="size-4" aria-hidden />
                Docs
              </a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-sm font-medium text-foreground">
              Minimal mode
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              localStorage adapter, single-user. Zero backend setup — perfect
              for prototypes and offline tools.
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-sm font-medium text-foreground">
              Full mode
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Convex backend with multi-workspace, auth, and live sync. Ships
              with schema, mutations, and queries.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
