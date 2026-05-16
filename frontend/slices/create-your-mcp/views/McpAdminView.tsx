"use client";

import { useState } from "react";

export type McpTokenRow = {
  _id: string;
  tokenPreview: string;
  userId: string;
  clientId: string;
  scope: string | null;
  resource: string | null;
  expiresAt: number;
  createdAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
  label: string | null;
};

export type SetupFieldKind = "static" | "copyable";

export type SetupField = {
  label: string;
  value: string;
  kind?: SetupFieldKind;
};

export type McpAdminViewProps = {
  /** Token rows from `api.features["create-your-mcp"].queries.adminList`. */
  rows: McpTokenRow[] | undefined;
  /** Site origin — used to render the setup fields. e.g. "https://app.example.com". */
  siteUrl: string;
  /** Suggested client id consumers paste into their AI client. Optional. */
  defaultClientId?: string;
  /** Called when the admin clicks Revoke on a token row. */
  onRevoke: (id: string, label: string) => Promise<void> | void;
  /** Optional override of the setup-field list. When omitted, a sensible
   *  ChatGPT / Claude / generic OAuth set is rendered. */
  setupFields?: SetupField[];
};

const formatTime = (ms: number | null): string => {
  if (!ms) return "—";
  return new Date(ms).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusOf = (r: McpTokenRow): "active" | "expired" | "revoked" => {
  if (r.revokedAt) return "revoked";
  if (r.expiresAt < Date.now()) return "expired";
  return "active";
};

const defaultSetupFields = (siteUrl: string, defaultClientId: string): SetupField[] => [
  { label: "MCP Server URL", value: `${siteUrl}/api/mcp`, kind: "copyable" },
  { label: "Authentication", value: "OAuth" },
  { label: "Registration", value: "User-Defined OAuth Client" },
  { label: "Client ID", value: defaultClientId, kind: "copyable" },
  { label: "Client Secret", value: "(leave empty — public client)" },
  { label: "Token endpoint auth method", value: "none" },
  { label: "Authorization URL", value: `${siteUrl}/oauth/authorize`, kind: "copyable" },
  { label: "Token URL", value: `${siteUrl}/api/oauth/token`, kind: "copyable" },
  { label: "Resource", value: `${siteUrl}/api/mcp`, kind: "copyable" },
];

export function McpAdminView({
  rows,
  siteUrl,
  defaultClientId = "my-app-mcp",
  onRevoke,
  setupFields,
}: McpAdminViewProps) {
  const [setupOpen, setSetupOpen] = useState(true);
  const fields = setupFields ?? defaultSetupFields(siteUrl, defaultClientId);

  const handleRevoke = async (id: string, label: string) => {
    if (typeof window === "undefined") return;
    if (
      !window.confirm(
        `Revoke token "${label}"? Apps using it will lose access on the next call.`,
      )
    ) {
      return;
    }
    await onRevoke(id, label);
  };

  const copy = async (value: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard unavailable — silent fail, value still visible to copy manually
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Admin / Integrations
        </div>
        <h1 className="text-3xl font-bold">MCP &amp; OAuth Tokens</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Bearer tokens minted via the OAuth flow at{" "}
          <code className="text-xs">/oauth/authorize</code> (AI clients like
          ChatGPT custom apps, Claude.ai connectors, Cursor MCP) or via the
          static <code className="text-xs">MCP_API_KEY</code> env (service-account
          / developer fallback). Revoke any token to cut access on the next call.
        </p>
      </header>

      <section className="border-2 border-foreground rounded-lg bg-card">
        <button
          type="button"
          onClick={() => setSetupOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 border-b-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
          aria-expanded={setupOpen}
        >
          <span className="text-sm uppercase tracking-widest font-bold">
            Setup an AI client (ChatGPT / Claude / Cursor)
          </span>
          <span className="text-xs">{setupOpen ? "▼ Hide" : "▶ Show"}</span>
        </button>
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
                      <button
                        type="button"
                        onClick={() => copy(f.value)}
                        className="shrink-0 text-[10px] uppercase tracking-widest border border-foreground/40 rounded px-2 py-0.5 hover:bg-foreground hover:text-background transition-colors"
                      >
                        Copy
                      </button>
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

      {rows === undefined ? (
        <div className="border-2 border-foreground rounded-lg p-6 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="border-2 border-foreground rounded-lg p-8 text-center text-muted-foreground">
          No tokens yet. Connect an AI client to mint the first one.
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-foreground rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Status</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Label / Client</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Token</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Created</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Last used</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Expires</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground">
              {rows.map((r) => {
                const s = statusOf(r);
                return (
                  <tr key={r._id} className="align-top">
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium ${
                          s === "active"
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-sm">{r.label ?? "—"}</div>
                      <div className="text-xs text-muted-foreground font-mono">{r.clientId}</div>
                      {r.scope && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          scope: {r.scope}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <code className="text-xs font-mono">{r.tokenPreview}</code>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">{formatTime(r.createdAt)}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">{formatTime(r.lastUsedAt)}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">{formatTime(r.expiresAt)}</td>
                    <td className="px-3 py-3 text-right">
                      {s === "active" ? (
                        <button
                          type="button"
                          onClick={() => handleRevoke(r._id, r.label ?? r.clientId)}
                          className="border-2 border-destructive rounded-md px-2 py-1 text-[10px] uppercase tracking-widest font-medium text-destructive hover:bg-destructive hover:text-background transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="border-2 border-foreground/40 rounded-lg p-4 bg-card text-xs space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          MCP_API_KEY (static fallback)
        </h3>
        <p className="text-muted-foreground">
          Static bearer for service accounts and CI scripts. Active when the
          env var is set (min 32 chars). Does not appear in the table above.
          To rotate: change the env var on your host AND on Convex
          (<code>npx convex env set MCP_API_KEY …</code>).
        </p>
      </section>
    </div>
  );
}
