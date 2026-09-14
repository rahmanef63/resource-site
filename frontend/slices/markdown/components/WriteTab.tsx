"use client";

/** Write tab — raw markdown source editor with live preview. Controlled:
 *  `value` + `onChange`. Toolbar inserts snippets at the caret. The preview
 *  pane re-parses on every keystroke (parser is line-based and cheap). */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseMarkdown } from "../lib/parse";
import { renderNodes } from "./MdNodeView";

import { MARKDOWN_SNIPPETS } from "../lib/snippets";


interface Props {
  value: string;
  onChange: (next: string) => void;
}

export function WriteTab({ value, onChange }: Props) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const nodes = React.useMemo(() => parseMarkdown(value), [value]);

  const insert = (snippet: string) => {
    const el = ref.current;
    const at = el ? el.selectionStart : value.length;
    const next = value.slice(0, at) + snippet + value.slice(at);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + snippet.length, at + snippet.length);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {MARKDOWN_SNIPPETS.map((s) => (
          <Button key={s.label} variant="outline" size="sm" type="button" className="h-7 px-2 text-xs" onClick={() => insert(s.snippet)}>
            {s.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Markdown source"
          spellCheck={false}
          className="min-h-[420px] resize-y font-mono text-xs leading-relaxed"
        />
        <div className="min-h-[420px] overflow-auto rounded-md border border-border bg-background px-4 py-2">
          {renderNodes(nodes)}
        </div>
      </div>
    </div>
  );
}
