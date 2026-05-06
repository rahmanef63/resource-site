/**
 * Studio Docs Dialog
 *
 * Opens a dialog showing the JSON Schema guide (studio-json-template.md)
 * rendered as formatted markdown.
 * Provides Copy and Download buttons for AI context use.
 */
"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Button } from "@/components/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Check, BookMarked } from "lucide-react";

interface StudioDocsDialogProps {
    open: boolean;
    onClose: () => void;
}

const DOCS_URL = "/docs/studio-json-template.md";

export const StudioDocsDialog: React.FC<StudioDocsDialogProps> = ({ open, onClose }) => {
    const [content, setContent] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) return;
        fetch(DOCS_URL)
            .then((r) => r.text())
            .then(setContent)
            .catch(() => setContent(FALLBACK_CONTENT));
    }, [open]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "studio-json-template.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <ResponsiveDialog open={open} onOpenChange={(v) => !v && onClose()} variant="modal" size="xl">
            <ResponsiveDialog.Header>
                <div className="flex items-center gap-2">
                    <BookMarked size={16} className="text-primary" />
                    <ResponsiveDialog.Title>Studio JSON Schema — Guide &amp; Reference</ResponsiveDialog.Title>
                </div>
                <ResponsiveDialog.Description className="text-xs mt-1">
                    Use this as AI context when asking to build layouts in JSON format.
                    Copy the full document and paste it before your prompt.
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="overflow-hidden p-0">
                <ScrollArea className="h-full">
                    <div className="px-6 py-5 prose prose-sm dark:prose-invert max-w-none
                        prose-headings:font-semibold prose-headings:text-foreground
                        prose-p:text-foreground/90 prose-p:leading-relaxed
                        prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                        prose-pre:bg-muted prose-pre:rounded-lg prose-pre:border prose-pre:border-border
                        prose-strong:text-foreground prose-li:text-foreground/90
                        prose-table:text-xs prose-td:border prose-td:border-border prose-th:border prose-th:border-border
                        prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                    ">
                        {content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-muted-foreground text-sm">Loading…</p>
                        )}
                    </div>
                </ScrollArea>
            </ResponsiveDialog.Body>

            <ResponsiveDialog.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end bg-muted/30">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                    <Download size={13} />
                    Download .md
                </Button>
                <Button size="sm" className="gap-2" onClick={handleCopy}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy All"}
                </Button>
            </ResponsiveDialog.Footer>
        </ResponsiveDialog>
    );
};

const FALLBACK_CONTENT = `# Studio JSON Schema

Place the file \`docs/studio-json-template.md\` in your \`public/docs/\` folder to load it here.

## Basic schema structure

\`\`\`json
{
  "version": "0.5",
  "root": ["node-id"],
  "nodes": {
    "node-id": {
      "type": "div",
      "props": { "display": "flex", "gap": "1rem" },
      "children": []
    }
  }
}
\`\`\`

## Key rules
- \`version\` must be \`"0.5"\`
- \`gap\` must use CSS units: \`"1rem"\` not \`"4"\`
- \`text\` nodes: use \`content\` prop (not \`text\`)
- \`button\` nodes: use \`text\` prop (not \`content\`)
- \`metricCardBlock\`: use \`title\`, \`value\`, \`trend: { value: number, direction: "up"|"down" }\`
- \`chartBlock\`: use \`chartType\` (not \`type\`)
`;
