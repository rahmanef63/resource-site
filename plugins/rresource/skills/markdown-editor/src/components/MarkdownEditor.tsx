// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function MarkdownEditor({ value, onChange, placeholder, className }: Props) {
  const [tab, setTab] = React.useState<"write" | "preview">("write");
  return (
    <div className={className}>
      <div className="mb-2 flex gap-2 border-b">
        {(["write","preview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm ${tab === t ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
          >
            {t === "write" ? "Write" : "Preview"}
          </button>
        ))}
      </div>
      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] w-full rounded border bg-background p-3 font-mono text-sm"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "b") wrapSelection(e.currentTarget, "**", onChange);
            if ((e.metaKey || e.ctrlKey) && e.key === "i") wrapSelection(e.currentTarget, "_", onChange);
          }}
        />
      ) : (
        <article className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "_nothing yet_"}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}

function wrapSelection(ta: HTMLTextAreaElement, marker: string, onChange: (v: string) => void) {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const next = value.slice(0, s) + marker + value.slice(s, e) + marker + value.slice(e);
  onChange(next);
}
