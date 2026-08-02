"use client";

import * as React from "react";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { site } from "@/lib/content/site";

export function InstallWithAgent({
  prompt,
  size = "default",
  variant = "default",
  label = "Install with AI agent",
}: {
  prompt: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "ghost";
  label?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className="gap-2">
          <Sparkles className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <DialogTitle>Install with AI Agent</DialogTitle>
          </div>
          <DialogDescription>
            Copy this prompt and paste it into Claude Code, Cursor, or any agent. The
            agent will fetch the knowledge base + repo and bootstrap the project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <CodeBlock code={prompt} language="markdown" filename="agent-prompt.md" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 break-all text-xs text-muted-foreground">
              Knowledge base: <code className="font-mono">{site.url}/llms.txt</code>
            </p>
            <CopyButton value={prompt} size="sm" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
