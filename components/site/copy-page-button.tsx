"use client";

import * as React from "react";
import { Check, Copy, ChevronDown, FileCode, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CopyPageButton({
  title,
  url,
  body,
}: {
  title: string;
  url: string;
  body?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  function flash() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function copyMarkdown() {
    const md = `# ${title}\n\nSource: ${url}\n${body ? `\n\`\`\`tsx\n${body}\n\`\`\`\n` : ""}`;
    navigator.clipboard.writeText(md);
    toast.success("Copied as Markdown");
    flash();
  }

  function copyUrl() {
    navigator.clipboard.writeText(url);
    toast.success("Copied URL");
    flash();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          Copy Page
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={copyMarkdown}>
          <FileCode className="mr-2 size-3.5" /> Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyUrl}>
          <Link2 className="mr-2 size-3.5" /> Copy URL
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
