"use client";

import { McpAdminView, type McpTokenRow } from "@/features/create-your-mcp";

// Mock token rows — production consumers fetch this via
// `useQuery(api.features["create-your-mcp"].queries.adminList)`. Preview
// uses plausible synthetic data so the table + status badges render
// without any backend wiring.
const now = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;

const mockRows: McpTokenRow[] = [
  {
    _id: "row_chatgpt_prod" as const,
    tokenPreview: "9f3a2c1e…b8d4",
    userId: "user_admin",
    clientId: "chatgpt-prod",
    scope: "cms.read cms.write",
    resource: "https://app.example.com/api/mcp",
    expiresAt: now + 320 * ONE_DAY,
    createdAt: now - 45 * ONE_DAY,
    lastUsedAt: now - 12 * 60 * 1000,
    revokedAt: null,
    label: "ChatGPT · production",
  },
  {
    _id: "row_claude_connector" as const,
    tokenPreview: "1d7f4b08…3e9a",
    userId: "user_admin",
    clientId: "claude-connector",
    scope: "cms.read",
    resource: "https://app.example.com/api/mcp",
    expiresAt: now + 285 * ONE_DAY,
    createdAt: now - 80 * ONE_DAY,
    lastUsedAt: now - 4 * 60 * 60 * 1000,
    revokedAt: null,
    label: "Claude.ai connector",
  },
  {
    _id: "row_cursor_local" as const,
    tokenPreview: "5c2e8d77…f0a1",
    userId: "user_admin",
    clientId: "cursor-mcp",
    scope: "cms.read",
    resource: "https://app.example.com/api/mcp",
    expiresAt: now + 210 * ONE_DAY,
    createdAt: now - 155 * ONE_DAY,
    lastUsedAt: now - 6 * ONE_DAY,
    revokedAt: null,
    label: "Cursor MCP · laptop",
  },
  {
    _id: "row_revoked_leak" as const,
    tokenPreview: "8a0bcc91…7d2e",
    userId: "user_admin",
    clientId: "chatgpt-dev",
    scope: null,
    resource: null,
    expiresAt: now + 360 * ONE_DAY,
    createdAt: now - 200 * ONE_DAY,
    lastUsedAt: now - 14 * ONE_DAY,
    revokedAt: now - 7 * ONE_DAY,
    label: "ChatGPT · dev (leaked)",
  },
];

export default function McpPreviewPage() {
  return (
    <main className="min-h-screen bg-background p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <McpAdminView
          siteUrl="https://app.example.com"
          defaultClientId="my-app-mcp"
          rows={mockRows}
          onRevoke={async (id, label) => {
            // Preview-only — no Convex wiring. Real consumer wires this
            // to `api.features["create-your-mcp"].mutations.revokeToken`.
            // eslint-disable-next-line no-console
            console.log(`[preview] revoke ${id} (${label})`);
          }}
        />
      </div>
    </main>
  );
}
