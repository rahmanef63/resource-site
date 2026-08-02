"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UpvoteHandler } from "../lib/types";

// Decoupled upvote control. The vote backend is consumer-owned: pass an
// `onUpvote` handler that persists the toggle and resolves the new
// state. Without a handler the control renders read-only (count only),
// so the slice carries no `/api/*` route or voter-token dependency.
export function UpvotePanel({
  itemId,
  initial,
  onUpvote,
  label = "Upvote",
}: {
  itemId: string;
  initial: number;
  onUpvote?: UpvoteHandler;
  label?: string;
}) {
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  const readOnly = !onUpvote;

  const toggle = async () => {
    if (busy || !onUpvote) return;
    setBusy(true);
    const prev = voted;
    setVoted(!prev);
    setCount((c) => (prev ? Math.max(0, c - 1) : c + 1));
    try {
      const { voted: next } = await onUpvote(itemId);
      setVoted(next);
    } catch {
      setVoted(prev);
      setCount((c) => (prev ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggle}
      disabled={busy || readOnly}
      aria-pressed={voted}
      className={cn(
        "inline-flex h-auto items-center gap-2 border-2 rounded-md px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium transition-colors hover:bg-transparent",
        voted
          ? "border-current bg-foreground text-background hover:bg-foreground hover:text-background"
          : "border-current/40 hover:border-current",
        readOnly && "cursor-default",
      )}
    >
      <span aria-hidden="true">▲</span>
      <span className="tabular-nums">{count}</span>
      {!readOnly ? <span>{label}</span> : null}
    </Button>
  );
}
