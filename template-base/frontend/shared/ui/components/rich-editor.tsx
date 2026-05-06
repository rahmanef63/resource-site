"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Code2,
  Eye,
  Pen,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type Mode = "richtext" | "html" | "refiner";

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** "richtext" → WYSIWYG; "html" → raw textarea; "refiner" → raw + LLM rewrite. */
  mode: Mode;
  onModeChange?: (next: Mode) => void;
  /**
   * Refiner callback. Receives current HTML + the user's instruction prompt;
   * resolves with the refined HTML. RichEditor automatically replaces
   * `value` with the result. Throw to surface an error message.
   */
  onRefine?: (html: string, prompt: string) => Promise<string>;
  className?: string;
  placeholder?: string;
};

/**
 * Hybrid editor for tutorial content. Three modes:
 *   • richtext — WYSIWYG via TipTap StarterKit (output is plain HTML).
 *   • html     — raw textarea. Admin can paste any HTML, including
 *                iframes and <script> for interactive demos.
 *   • refiner  — raw textarea + a prompt input. Click "Refine" to call
 *                the supplied onRefine callback (typically an LLM action)
 *                that rewrites the HTML to use the project's CSS variables
 *                and theme tokens. Result replaces the body.
 *
 * Source-of-truth is the parent's controlled value. Switching modes
 * preserves content (HTML round-trips cleanly between all three views).
 */
export function RichEditor({
  value,
  onChange,
  mode,
  onModeChange,
  onRefine,
  className,
  placeholder,
}: Props) {
  const editor = useEditor(
    {
      extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
      content: value,
      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] px-3 py-2",
        },
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      // Avoids hydration mismatch on Next 15
      immediatelyRender: false,
    },
    [mode],
  );

  // Sync external value changes when *not* in richtext (raw mode) edits the
  // string directly, but switching back to richtext we must re-feed the
  // editor with the latest HTML.
  React.useEffect(() => {
    if (mode !== "richtext" || !editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, mode, editor]);

  return (
    <div
      className={cn(
        "border-2 border-foreground rounded-md bg-background overflow-hidden",
        className,
      )}
    >
      <Toolbar mode={mode} editor={editor} onModeChange={onModeChange} />
      {mode === "richtext" ? (
        <EditorContent editor={editor} />
      ) : mode === "html" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "<div>HTML, iframes, scripts — admin-trusted.</div>"}
          spellCheck={false}
          className="w-full min-h-[280px] font-mono text-xs px-3 py-2 bg-background text-foreground focus:outline-none resize-y"
        />
      ) : (
        <RefinerPanel value={value} onChange={onChange} onRefine={onRefine} />
      )}
    </div>
  );
}

function RefinerPanel({
  value,
  onChange,
  onRefine,
}: {
  value: string;
  onChange: (next: string) => void;
  onRefine?: (html: string, prompt: string) => Promise<string>;
}) {
  const [prompt, setPrompt] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refine = async () => {
    if (!onRefine || busy) return;
    setBusy(true);
    setError(null);
    try {
      const out = await onRefine(value, prompt);
      onChange(out);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal merefine");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<div>Paste raw HTML here — refiner will rewrite it.</div>"
        spellCheck={false}
        className="w-full min-h-[220px] font-mono text-xs px-3 py-2 bg-background text-foreground focus:outline-none resize-y"
      />
      <div className="border-t-2 border-foreground bg-muted/20 p-3 space-y-2">
        <label className="block text-[10px] uppercase tracking-brutal font-medium text-muted-foreground">
          Refiner prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="contoh: bikin minimal, hapus warna hardcoded, pakai utility .prose"
          rows={2}
          className="w-full font-sans text-xs px-3 py-2 border-2 border-foreground rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground leading-snug">
            Refiner akan mengubah HTML supaya pakai variabel CSS proyek
            (Tailwind theme tokens + <code className="font-mono">oklch(var(--…))</code>),
            jadi konten ikut berubah saat preset tema diganti.
          </p>
          <button
            type="button"
            onClick={refine}
            disabled={busy || !onRefine || value.trim().length === 0}
            title={!onRefine ? "onRefine callback belum dipasang" : "Refine HTML via LLM"}
            className="inline-flex items-center gap-2 border-2 border-foreground rounded-md bg-foreground text-background px-3 py-2 text-xs uppercase tracking-brutal-sm font-medium hover:bg-background hover:text-foreground transition-colors disabled:opacity-40 shrink-0"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            {busy ? "Merefine…" : "Refine"}
          </button>
        </div>
        {error && (
          <div className="border-2 border-destructive bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function Toolbar({
  editor,
  mode,
  onModeChange,
}: {
  editor: ReturnType<typeof useEditor> | null;
  mode: Mode;
  onModeChange?: (next: Mode) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap border-b-2 border-foreground bg-muted/30 px-2 py-1.5">
      {mode === "richtext" && editor && (
        <>
          <Btn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline code"
          >
            <Code className="size-3.5" />
          </Btn>
          <Sep />
          <Btn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="size-3.5" />
          </Btn>
          <Sep />
          <Btn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bulleted list"
          >
            <List className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <Code2 className="size-3.5" />
          </Btn>
          <Sep />
          <Btn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo2 className="size-3.5" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo2 className="size-3.5" />
          </Btn>
        </>
      )}

      {onModeChange && (
        <div className="ml-auto flex items-center gap-0 border-2 border-foreground rounded-sm overflow-hidden">
          <ModeBtn
            active={mode === "richtext"}
            onClick={() => onModeChange("richtext")}
            title="WYSIWYG editor"
          >
            <Pen className="size-3" /> Rich
          </ModeBtn>
          <ModeBtn
            active={mode === "html"}
            onClick={() => onModeChange("html")}
            title="Raw HTML — paste interactive iframes / scripts"
          >
            <Eye className="size-3" /> HTML
          </ModeBtn>
          <ModeBtn
            active={mode === "refiner"}
            onClick={() => onModeChange("refiner")}
            title="Refiner — LLM rewrites HTML to use project CSS variables"
          >
            <Sparkles className="size-3" /> Refiner
          </ModeBtn>
        </div>
      )}
    </div>
  );
}

function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center size-7 border-2 rounded-sm transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-transparent hover:border-foreground hover:bg-foreground hover:text-background",
        disabled && "opacity-30 pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}

function ModeBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-brutal font-medium transition-colors",
        active ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-foreground/30" />;
}
