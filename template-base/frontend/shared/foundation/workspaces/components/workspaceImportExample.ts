/**
 * Example / starter schema for the workspace import JSON.
 *
 * Users can download this template, hand it to an external AI, and have the
 * model fill in the concrete values before uploading it back via the
 * "Import" tab on the workspace onboarding page. The shape mirrors the
 * `WorkspaceExportData` type in `convex/workspace/exportImport.ts` and what
 * `validateImportJson` (in `useWorkspaceExportImport`) checks.
 */

const EXAMPLE_TIMESTAMP = 1_713_400_000_000

/**
 * Every feature slug currently shipped in SuperSpace. Kept in sync with
 * `frontend/slices/<slug>/`. Surfacing the full list inside the example
 * schema gives an AI concrete IDs to choose from when populating
 * `enabledFeatures` / `workspace.settings.enabledFeatures` instead of
 * guessing names that might not exist.
 *
 * CORE features (overview, workspace-settings, user-settings) are always
 * enabled at runtime even if omitted here, but listing them makes the
 * generated JSON self-explanatory.
 */
export const ALL_FEATURE_SLUGS: readonly string[] = [
  "accounting",
  "ai",
  "analytics",
  "approvals",
  "audit-log",
  "bi",
  "calendar",
  "cms-lite",
  "communications",
  "contacts",
  "content",
  "crm",
  "database",
  "documents",
  "forms",
  "hr",
  "import-export",
  "industryTemplates",
  "integrations",
  "inventory",
  "knowledge",
  "marketing",
  "menus",
  "overview",
  "platform-admin",
  "pos",
  "projects",
  "reports",
  "sales",
  "status",
  "studio",
  "support",
  "tasks",
  "user-management",
  "workspace-store",
] as const

export const WORKSPACE_IMPORT_EXAMPLE = {
  $schema: "https://superspace.dev/schemas/workspace-import-v1.json",
  _hint:
    "Required: version ('1.0'), workspace.name, workspace.type. " +
    "Valid workspace.type values: 'organization' | 'institution' | 'group' | 'family' | 'personal'. " +
    "Each role needs 'name' + 'slug' + 'permissions' (array of 'feature.action' strings, e.g. 'cms.delete', 'workspace.manage'). " +
    "Members are optional; if included they will receive pending invitations (email + roleSlug required). " +
    "`enabledFeatures` must pick slugs from the `_availableFeatures` list below — remove the ones you do not want. " +
    "Feel free to strip the fields that start with `_` and `$schema` before uploading — the importer ignores unknown fields.",
  _availableFeatures: ALL_FEATURE_SLUGS,
  version: "1.0",
  exportedAt: EXAMPLE_TIMESTAMP,
  exportedBy: "template",
  workspace: {
    name: "My New Workspace",
    slug: "my-new-workspace",
    description: "A short description of what this workspace is for.",
    type: "organization",
    timezone: "Asia/Jakarta",
    language: "en",
    icon: "Building2",
    color: "#6366f1",
    themePreset: "default",
    settings: {
      enabledFeatures: ALL_FEATURE_SLUGS,
    },
  },
  roles: [
    {
      name: "Owner",
      slug: "owner",
      description: "Full control over the workspace.",
      permissions: [
        "workspace.manage",
        "workspace.delete",
        "members.manage",
        "roles.manage",
      ],
      color: "#ef4444",
      level: 0,
      isSystemRole: true,
    },
    {
      name: "Admin",
      slug: "admin",
      description: "Can manage most workspace settings and members.",
      permissions: [
        "workspace.manage",
        "members.invite",
        "roles.view",
        "content.edit",
      ],
      color: "#f97316",
      level: 10,
      isSystemRole: true,
    },
    {
      name: "Manager",
      slug: "manager",
      description: "Manages day-to-day operations and approvals.",
      permissions: [
        "workspace.view",
        "content.edit",
        "approvals.manage",
        "tasks.manage",
      ],
      color: "#eab308",
      level: 30,
      isSystemRole: true,
    },
    {
      name: "Staff",
      slug: "staff",
      description: "Can view and edit workspace content.",
      permissions: ["workspace.view", "content.edit", "cms.view"],
      color: "#22c55e",
      level: 50,
      isSystemRole: true,
    },
    {
      name: "Client",
      slug: "client",
      description: "External collaborator with read-only access by default.",
      permissions: ["workspace.view", "content.view"],
      color: "#3b82f6",
      level: 70,
      isSystemRole: true,
    },
    {
      name: "Guest",
      slug: "guest",
      description: "Temporary / minimal access.",
      permissions: ["workspace.view"],
      color: "#64748b",
      level: 90,
      isSystemRole: true,
    },
  ],
  members: [
    {
      email: "owner@example.com",
      roleSlug: "owner",
      additionalPermissions: [],
    },
    {
      email: "teammate@example.com",
      roleSlug: "staff",
      additionalPermissions: ["analytics.view"],
    },
  ],
  enabledFeatures: ALL_FEATURE_SLUGS,
} as const

export const WORKSPACE_IMPORT_EXAMPLE_FILENAME = "superspace-workspace-import-example.json"
export const WORKSPACE_IMPORT_PROMPT_FILENAME = "superspace-workspace-import-prompt.md"

/** Serialize the example to a pretty-printed JSON string. */
export function stringifyWorkspaceImportExample(): string {
  return JSON.stringify(WORKSPACE_IMPORT_EXAMPLE, null, 2)
}

/**
 * Build a self-contained markdown prompt that wraps the schema so users can
 * paste it directly into any external LLM (ChatGPT / Claude / Gemini / etc.)
 * and get back a ready-to-import JSON file.
 */
export function buildWorkspaceImportPrompt(): string {
  const schema = stringifyWorkspaceImportExample()
  return `# SuperSpace — Workspace Import Generator

You are helping set up a new SuperSpace workspace by filling in a
\`WorkspaceExportData\` JSON document. Follow every rule below and return
**only** the final JSON (no prose, no markdown fences).

## What I want you to build

> Replace this line with a short description of the workspace you want to
> create — the industry, the team size, the vibe, and any specific
> features that must be enabled or disabled.

## Hard rules

- Return **valid JSON only**. Strip the leading \`_hint\`, \`_availableFeatures\`
  and \`$schema\` helper fields in your final answer (the importer tolerates
  them but they are noise).
- \`version\` must stay \`"1.0"\`.
- \`workspace.type\` ∈ \`"organization" | "institution" | "group" | "family" | "personal"\`.
- \`workspace.slug\` must be lowercase kebab-case (letters, numbers, dashes only).
- Every role needs \`name\`, \`slug\`, and a non-empty \`permissions\` array.
  Use the \`{feature}.{action}\` convention (e.g. \`cms.delete\`,
  \`workspace.manage\`, \`analytics.view\`).
- SuperSpace uses a fixed role-level hierarchy: Owner=0, Admin=10, Manager=30,
  Staff=50, Client=70, Guest=90. Keep the numbers in that range and include
  the system roles shown below.
- \`enabledFeatures\` (and \`workspace.settings.enabledFeatures\`) must only
  contain slugs listed in \`_availableFeatures\`. Keep \`overview\`,
  \`workspace-settings\`, and \`user-settings\` — they are core.
- \`members\` is optional. If you include any, each one needs a valid
  \`email\` and a \`roleSlug\` matching one of the roles you defined.
- Set \`exportedAt\` to the current Unix epoch in milliseconds and
  \`exportedBy\` to \`"ai-generated"\`.

## Schema + example values

Use the document below as the exact shape. Replace the placeholder values
with values that match my request above.

\`\`\`json
${schema}
\`\`\`

## Deliverable

Return one JSON document that satisfies every rule. Do not wrap it in code
fences, do not add commentary — just the JSON so I can save it straight to
\`workspace.json\` and upload it.
`
}

function triggerDownload(contents: string, mime: string, filename: string): void {
  if (typeof window === "undefined") return
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Trigger a browser download of the example JSON file. */
export function downloadWorkspaceImportExample(
  filename: string = WORKSPACE_IMPORT_EXAMPLE_FILENAME,
): void {
  triggerDownload(stringifyWorkspaceImportExample(), "application/json", filename)
}

/** Trigger a browser download of the markdown prompt (schema bundled in). */
export function downloadWorkspaceImportPrompt(
  filename: string = WORKSPACE_IMPORT_PROMPT_FILENAME,
): void {
  triggerDownload(buildWorkspaceImportPrompt(), "text/markdown;charset=utf-8", filename)
}
