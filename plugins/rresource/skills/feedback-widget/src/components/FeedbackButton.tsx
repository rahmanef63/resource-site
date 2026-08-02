// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import { useFeedbackStore } from "../hooks/useFeedbackStore";

type Props = {
  onSubmit?: (text: string) => Promise<void> | void;   // pass Convex mutation here for real persistence
  className?: string;
};

export function FeedbackButton({ onSubmit, className }: Props) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const { add } = useFeedbackStore();

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      if (onSubmit) await onSubmit(text);
      else add(text);
      setText(""); setOpen(false);
    } finally { setBusy(false); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={className ?? "fixed bottom-4 right-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg"}>
        Feedback
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-sm rounded-lg border bg-background p-4 shadow-xl">
            <p className="mb-2 text-sm font-semibold">Send feedback</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded border p-2 text-sm" placeholder="What's working? What's broken?" />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded border px-3 py-1.5 text-sm">Cancel</button>
              <button onClick={submit} disabled={busy} className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground">{busy ? "Sending…" : "Send"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
