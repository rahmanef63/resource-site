export type McpTokenRow = {
  _id: string;
  // no token/preview field by design — only the sha256 digest is stored,
  // so there is no raw value the admin list could show or leak.
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

export const formatTime = (ms: number | null): string => {
  if (!ms) return "—";
  return new Date(ms).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const statusOf = (r: McpTokenRow): "active" | "expired" | "revoked" => {
  if (r.revokedAt) return "revoked";
  if (r.expiresAt < Date.now()) return "expired";
  return "active";
};

export const defaultSetupFields = (
  siteUrl: string,
  defaultClientId: string,
): SetupField[] => [
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

export const copyToClipboard = async (value: string): Promise<void> => {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // clipboard unavailable — silent fail, value still visible to copy manually
  }
};
