"use client";

import {
  defaultSetupFields,
  type McpTokenRow,
  type SetupField,
  type SetupFieldKind,
} from "./mcp-admin-helpers";
import { McpSetupPanel } from "./McpSetupPanel";
import { McpTokenTable } from "./McpTokenTable";

export type { McpTokenRow, SetupField, SetupFieldKind };

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

export function McpAdminView({
  rows,
  siteUrl,
  defaultClientId = "my-app-mcp",
  onRevoke,
  setupFields,
}: McpAdminViewProps) {
  const fields = setupFields ?? defaultSetupFields(siteUrl, defaultClientId);

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

      <McpSetupPanel fields={fields} />

      <McpTokenTable rows={rows} onRevoke={onRevoke} />

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
