"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { McpAdminView, type McpTokenRow } from "../views/McpAdminView"

const NOW = Date.UTC(2026, 6, 1)
const DAY = 24 * 60 * 60 * 1000

const SAMPLE_ROWS: McpTokenRow[] = [
  {
    _id: "tok_chatgpt",
    tokenPreview: "mcp_live_9f2a…c7",
    userId: "user_owner",
    clientId: "chatgpt-custom-app",
    scope: "tools:read tools:write",
    resource: "https://app.example.com/api/mcp",
    expiresAt: NOW + 7 * DAY,
    createdAt: NOW - 2 * DAY,
    lastUsedAt: NOW - 3 * 60 * 60 * 1000,
    revokedAt: null,
    label: "ChatGPT connector",
  },
  {
    _id: "tok_cursor",
    tokenPreview: "mcp_live_11be…4d",
    userId: "user_owner",
    clientId: "cursor-mcp",
    scope: "tools:read",
    resource: "https://app.example.com/api/mcp",
    expiresAt: NOW - DAY,
    createdAt: NOW - 10 * DAY,
    lastUsedAt: NOW - 6 * DAY,
    revokedAt: null,
    label: "Cursor (expired)",
  },
]

function CreateYourMcpPreview(_props: FeaturePreviewProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <McpAdminView
        rows={SAMPLE_ROWS}
        siteUrl="https://app.example.com"
        onRevoke={() => {}}
      />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "create-your-mcp",
  name: "Create Your MCP",
  description:
    "Ubah workspace jadi server MCP — sambungkan ChatGPT / Claude.ai / Cursor lewat OAuth 2.1 + PKCE, kelola bearer token, dan atur tool yang boleh dipanggil AI.",
  component: CreateYourMcpPreview,
  category: "administration",
  mockDataSets: [
    {
      id: "create-your-mcp-default",
      name: "Sample tokens",
      description: "Two sample bearer tokens (an active ChatGPT connector and an expired Cursor token).",
      data: { rows: SAMPLE_ROWS },
    },
  ],
})
