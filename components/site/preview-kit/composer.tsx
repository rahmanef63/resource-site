"use client";

import * as React from "react";
import { Paperclip, Send, X, Mic, Sparkles, FileText, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ComposerAttachment = {
  id: string;
  name: string;
  mime?: string;
  sizeKb?: number;
};

export type ComposerProps = {
  value: string;
  onValueChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  attachments?: ComposerAttachment[];
  onAttach?: () => void;
  onVoice?: () => void;
  onRemoveAttachment?: (id: string) => void;
  /** When true, send button shows a spinner and is disabled. */
  busy?: boolean;
  /** Optional inline hint above the composer (e.g. active skill). */
  hint?: React.ReactNode;
  className?: string;
};

function attachmentIcon(mime: string | undefined) {
  if (!mime) return Paperclip;
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.startsWith("application/pdf")) return FileText;
  return Paperclip;
}

/** Chat composer block. Composes shadcn Textarea + Button. Handles
 *  cmd/ctrl+Enter submit, attachment tray, voice trigger, optional
 *  hint chip. Caller owns submission semantics. */
export function Composer({
  value,
  onValueChange,
  onSubmit,
  placeholder = "Ask anything…",
  attachments,
  onAttach,
  onVoice,
  onRemoveAttachment,
  busy = false,
  hint,
  className,
}: ComposerProps) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!busy && value.trim()) onSubmit();
    }
  };
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card shadow-sm transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
        className,
      )}
    >
      {hint && (
        <div className="flex items-center gap-2 border-b border-border/40 px-3 py-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3 text-info" />
          {hint}
        </div>
      )}
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
          {attachments.map((a) => {
            const Icon = attachmentIcon(a.mime);
            return (
              <Badge
                key={a.id}
                variant="secondary"
                className="h-7 gap-1.5 rounded-md pl-2 pr-1 text-[11px] font-normal"
              >
                <Icon className="size-3 text-muted-foreground" />
                <span className="max-w-[160px] truncate">{a.name}</span>
                {a.sizeKb != null && (
                  <span className="text-[10px] text-muted-foreground/70">{a.sizeKb}kb</span>
                )}
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(a.id)}
                    aria-label={`Remove ${a.name}`}
                    className="ml-1 grid size-4 place-items-center rounded-sm hover:bg-muted-foreground/15"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
      <Textarea
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        className="min-h-[44px] resize-none border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center gap-1 border-t border-border/40 px-2 py-1.5">
        {onAttach && (
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onAttach}>
            <Paperclip className="size-3.5" />
          </Button>
        )}
        {onVoice && (
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onVoice}>
            <Mic className="size-3.5" />
          </Button>
        )}
        <span className="ml-auto hidden text-[10px] text-muted-foreground sm:inline">
          ⌘↵ to send
        </span>
        <Button
          type="button"
          size="sm"
          onClick={onSubmit}
          disabled={busy || !value.trim()}
          className="h-7 gap-1.5"
        >
          {busy ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
          Send
        </Button>
      </div>
    </div>
  );
}
