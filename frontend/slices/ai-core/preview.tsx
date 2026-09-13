"use client";

import * as React from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { ConfirmDialog } from "./components/responsive-dialog";
import { ErrorLine } from "./lib/errors";
import { ago, dt, fmt } from "./lib/format";

type Scenario = "confirm" | "error" | "format";

function AiCorePreview({ variant }: { variant: Record<string, string> }) {
  const scenario = (variant.scenario as Scenario | undefined) ?? "confirm";
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  if (scenario === "error") {
    return (
      <div className="max-w-xl rounded-lg border p-4">
        <ErrorLine
          e={{ data: { code: "rate_limited", status: 429, detail: "Provider retry window is active.", provider: "openai", model: "gpt-demo" } }}
          isAdmin
          labels={{ openai: "OpenAI" }}
        />
      </div>
    );
  }

  if (scenario === "format") {
    const now = Date.now();
    return (
      <div className="grid max-w-xl gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">fmt(12500)</div><div className="mt-1 font-mono">{fmt(12500)}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">ago(3m)</div><div className="mt-1 font-mono">{ago(now - 180_000)}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">dt(now)</div><div className="mt-1 font-mono text-xs">{dt(now)}</div></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl rounded-lg border p-4">
      <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => setOpen(true)}>
        Open confirm dialog
      </button>
      {confirmed ? <p className="mt-3 text-sm text-muted-foreground">Confirmed.</p> : null}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setConfirmed(true)}
        title="Delete this item?"
        message="This preview exercises the canonical native-dialog confirm flow."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

const preview: SlicePreviewModule = {
  AiCorePreview: ({ variant }) => <AiCorePreview variant={variant} />,
};

export default preview;
