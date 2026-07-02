"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard, type SetupField } from "./mcp-admin-helpers";

export function McpSetupPanel({ fields }: { fields: SetupField[] }) {
  const [setupOpen, setSetupOpen] = useState(true);

  return (
    <section className="border-2 border-foreground rounded-lg bg-card">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setSetupOpen((v) => !v)}
        className="h-auto w-full justify-between rounded-none px-5 py-3 border-b-2 border-foreground hover:bg-foreground hover:text-background"
        aria-expanded={setupOpen}
      >
        <span className="text-sm uppercase tracking-widest font-bold">
          Setup an AI client (ChatGPT / Claude / Cursor)
        </span>
        <span className="text-xs">{setupOpen ? "▼ Hide" : "▶ Show"}</span>
      </Button>
      {setupOpen && (
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            Paste the values below into your AI client's connector form
            (e.g. ChatGPT Settings → Connectors → New). Authentication = OAuth.
          </p>
          <dl className="grid gap-2 sm:grid-cols-[200px_1fr]">
            {fields.map((f) => (
              <div key={f.label} className="contents">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground py-1.5">
                  {f.label}
                </dt>
                <dd className="flex items-center justify-between gap-2 border border-foreground/20 rounded-md bg-background px-3 py-1.5">
                  <code className="text-xs font-mono break-all">{f.value}</code>
                  {f.kind === "copyable" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(f.value)}
                      className="h-auto shrink-0 px-2 py-0.5 text-[10px] uppercase tracking-widest border-foreground/40 hover:bg-foreground hover:text-background"
                    >
                      Copy
                    </Button>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="pt-3 border-t border-foreground/20 text-xs text-muted-foreground space-y-1">
            <p>
              Discovery JSON (optional auto-fill):{" "}
              <code>/.well-known/oauth-authorization-server</code>
            </p>
            <p>
              Tokens default to 1-year TTL. Revoke cuts access immediately on
              the next call.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
