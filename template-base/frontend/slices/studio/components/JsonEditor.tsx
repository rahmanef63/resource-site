/**
 * JsonEditor — two-way JSON binding with debounce + syntax highlighting.
 * Uses a transparent-textarea overlay on top of react-syntax-highlighter
 * for editing with coloured tokens without alignment libraries.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export interface JsonEditorProps {
  jsonText: string;
  onSchemaChange?: (v: string) => void;
}

// Shared typography constants — must be identical between the highlight layer
// and the textarea layer so characters stay pixel-aligned.
const FONT_FAMILY =
  'ui-monospace, Menlo, Monaco, "Cascadia Code", "Source Code Pro", "Courier New", monospace';
const FONT_SIZE = 12; // px  (text-xs)
const LINE_HEIGHT = 1.625; // leading-relaxed (Tailwind default for text-xs)
const PADDING = 16; // px  (p-4)

// Override the atomOneDark background so it matches the container's bg-zinc-900,
// and strip its own padding/margin so PADDING above is the single source of truth.
const highlightStyle = {
  ...atomOneDark,
  hljs: {
    ...(atomOneDark as Record<string, React.CSSProperties>)['hljs'],
    background: 'transparent',
    padding: 0,
    margin: 0,
  },
};

export function JsonEditor({ jsonText, onSchemaChange }: JsonEditorProps) {
  const [localJson, setLocalJson] = useState(jsonText);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable
    }
  }, [localJson]);

  // Sync from outside when jsonText changes (e.g. canvas update)
  useEffect(() => {
    setLocalJson(jsonText);
    setParseError(null);
  }, [jsonText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalJson(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        JSON.parse(val);
        setParseError(null);
        onSchemaChange?.(val);
      } catch (err: unknown) {
        setParseError(err instanceof Error ? err.message : 'Invalid JSON');
      }
    }, 600);
  };

  const sharedStyle: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    padding: PADDING,
    margin: 0,
    tabSize: 2,
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 dark:bg-zinc-950">
      {/* Parse-error bar */}
      {parseError && (
        <div className="shrink-0 px-3 py-1.5 bg-destructive/10 text-destructive text-[10px] font-mono border-b border-destructive/20">
          {parseError}
        </div>
      )}

      {/* Editor: highlight layer + transparent textarea overlay */}
      <div className="relative flex-1 min-h-0 overflow-auto">
        {/* ── Syntax highlight layer (visual only, non-interactive) ── */}
        <SyntaxHighlighter
          language="json"
          style={highlightStyle}
          PreTag={({ children, ...rest }) => (
            <pre
              {...rest}
              aria-hidden
              style={{
                ...sharedStyle,
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'pre',
                overflowX: 'visible',
                overflowY: 'visible',
                minWidth: '100%',
                minHeight: '100%',
                boxSizing: 'border-box',
              }}
            >
              {children}
            </pre>
          )}
          CodeTag="code"
          wrapLines={false}
          wrapLongLines={false}
        >
          {localJson}
        </SyntaxHighlighter>

        {/* ── Editable overlay (transparent text, coloured caret) ── */}
        <textarea
          value={localJson}
          onChange={handleChange}
          style={{
            ...sharedStyle,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            resize: 'none',
            background: 'transparent',
            color: 'transparent',
            caretColor: 'rgb(161 161 170)', // zinc-400 — clearly visible on dark bg
            border: 'none',
            outline: 'none',
            whiteSpace: 'pre',
            overflowX: 'auto',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* ── Copy button ── */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="Copy JSON"
          type="button"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}
