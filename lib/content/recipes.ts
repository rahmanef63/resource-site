export type RecipeEntry = {
  slug: string;
  title: string;
  description: string;
  source: string;
  repoPath: string;
  files: string[];
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
};

export const recipes: RecipeEntry[] = [
  {
    slug: "block-editor",
    title: "Notion-Style Block Editor",
    description:
      "21-block contenteditable editor with slash command menu, markdown shortcuts, drag handles. Real-time via Convex.",
    source: "notion-page-clone",
    repoPath: "recipes/block-editor",
    files: [
      "frontend/slices/notion/slices/editor/BlockEditor.tsx",
      "frontend/slices/notion/slices/editor/SlashMenu.tsx",
      "frontend/slices/notion/slices/editor/blockSpecs.ts",
    ],
    tags: ["editor", "notion", "blocks", "real-time"],
    exampleCode: `import { BlockEditor } from "@/frontend/slices/notion/slices/editor/BlockEditor";

<BlockEditor pageId={pageId} />`,
    agentRecipe:
      "Already copied at frontend/slices/notion/slices/editor/. See PORT-NOTION.md for Vite→Next port checklist (routing rewrite, use-client markers, Convex API surface rename).",
  },
  {
    slug: "page-tree-sidebar",
    title: "Page Tree Sidebar",
    description:
      "Hierarchical workspace sidebar with @dnd-kit drag-drop reordering, favorites, recents.",
    source: "notion-page-clone",
    repoPath: "recipes/page-tree-sidebar",
    files: [
      "frontend/slices/notion/slices/workspace-sidebar/components/WorkspaceSidebar.tsx",
      "frontend/slices/notion/slices/workspace-sidebar/components/SortablePageRow.tsx",
    ],
    tags: ["sidebar", "tree", "dnd-kit", "navigation"],
    exampleCode: `import { WorkspaceSidebar } from "@/frontend/slices/notion/slices/workspace-sidebar/components/WorkspaceSidebar";

<WorkspaceSidebar />`,
    agentRecipe:
      "Mount WorkspaceSidebar inside the left slot of <ThreeColumnLayout>. State backed by Zustand store at frontend/slices/notion/shared/lib/store.tsx.",
  },
  {
    slug: "multi-block-selection",
    title: "Multi-Block Selection",
    description:
      "Marquee + click+shift selection of editor blocks with floating toolbar. Bulk actions: delete, duplicate, convert.",
    source: "notion-page-clone",
    repoPath: "recipes/multi-block-selection",
    files: [
      "frontend/slices/notion/slices/block-selection/components/BlockSelectionProvider.tsx",
      "frontend/slices/notion/slices/block-selection/components/MarqueeOverlay.tsx",
    ],
    tags: ["selection", "editor", "bulk", "marquee"],
    exampleCode: `import { BlockSelectionProvider } from "@/frontend/slices/notion/slices/block-selection/components/BlockSelectionProvider";

<BlockSelectionProvider>
  <BlockEditor />
</BlockSelectionProvider>`,
    agentRecipe:
      "Wrap BlockEditor with BlockSelectionProvider. The marquee overlay attaches to document; toolbar floats above the selection bounding box.",
  },
  {
    slug: "database-views",
    title: "Database Views (11 types)",
    description:
      "Properties+rows database with 11 view types: table, board, calendar, timeline, chart, gallery, map. Per-view filter/sort/group.",
    source: "notion-page-clone",
    repoPath: "recipes/database-views",
    files: [
      "frontend/slices/notion/slices/databases/DatabaseBlock.tsx",
      "frontend/slices/notion/slices/databases/views/TableView.tsx",
      "frontend/slices/notion/slices/databases/views/BoardView.tsx",
    ],
    tags: ["database", "views", "table", "kanban", "calendar"],
    exampleCode: `import { DatabaseBlock } from "@/frontend/slices/notion/slices/databases/DatabaseBlock";

<DatabaseBlock databaseId={dbId} />`,
    agentRecipe:
      "DatabaseBlock auto-routes to the active view component. Add custom property types by extending PropertyCell.tsx.",
  },
  {
    slug: "command-palette",
    title: "Command Palette (⌘K)",
    description:
      "Cmd+K modal: feature navigation, workspace switching, theme, sign-out, custom commands. Auto-builds from feature registry.",
    source: "kitab-core + notion-page-clone",
    repoPath: "recipes/command-palette",
    files: [
      "frontend/shared/foundation/utils/system/command-menu/components.tsx",
    ],
    tags: ["palette", "cmd-k", "navigation"],
    exampleCode: `import { CommandMenu } from "@/frontend/shared/foundation/utils/system/command-menu/components";

<CommandMenu actions={customActions} />`,
    agentRecipe:
      "Mount CommandMenu once at the app shell level. It listens for Cmd+K globally. Pass extra commands via the actions prop or register via the command-registry.",
  },
  {
    slug: "comments-threaded",
    title: "Threaded Comments",
    description:
      "Page + block-level threaded comments with resolved state. Real-time via Convex.",
    source: "notion-page-clone",
    repoPath: "recipes/comments-threaded",
    files: [
      "frontend/slices/notion/slices/comments/components/BlockCommentsPopover.tsx",
      "frontend/slices/notion/slices/comments/hooks/useComments.ts",
    ],
    tags: ["comments", "real-time", "threading"],
    exampleCode: `import { BlockCommentsPopover } from "@/frontend/slices/notion/slices/comments/components/BlockCommentsPopover";

<BlockCommentsPopover blockId={blockId} pageId={pageId} />`,
    agentRecipe:
      "Anchor comments by passing pageId (always) and optional blockId. Use useComments(blockId) hook for the reactive list.",
  },
  {
    slug: "theme-preset-switcher",
    title: "Theme Preset Switcher",
    description:
      "Runtime theme swap (colors + fonts + shadows + tracking). OKLch CSS vars per preset. Persists to localStorage + Convex.",
    source: "rahmanef.com",
    repoPath: "recipes/theme-preset-switcher",
    files: [
      "frontend/shared/theme/theme-presets.ts",
      "frontend/shared/ui/components/theme-preset-switcher.tsx",
    ],
    tags: ["theme", "presets", "oklch", "design-system"],
    exampleCode: `import { ThemePresetSwitcher } from "@/frontend/shared/ui/components/theme-preset-switcher";

<ThemePresetSwitcher />`,
    agentRecipe:
      "Add a new preset by appending a CSS block in app/globals.css with [data-theme=\"<name>\"], then register in preset-groups.ts.",
  },
  {
    slug: "icon-picker",
    title: "Notion-Style Icon Picker",
    description:
      "Emoji + lucide icon picker with search, 10-color Notion palette, Twemoji/native toggle. One string stores emoji OR lucide:Name OR with ?c=hex tint — backwards-compat with raw-emoji fields.",
    source: "notion-page-clone",
    repoPath: "recipes/icon-picker",
    files: [
      "frontend/slices/notion/slices/icon-picker/components/IconPicker.tsx",
      "frontend/slices/notion/slices/icon-picker/components/DynamicIcon.tsx",
      "frontend/slices/notion/slices/icon-picker/lib/parse.ts",
      "frontend/slices/notion/slices/icon-picker/lib/colors.ts",
      "frontend/slices/notion/slices/icon-picker/lib/emoji-catalog.ts",
      "frontend/slices/notion/slices/icon-picker/lib/lucide-catalog.ts",
      "frontend/slices/notion/slices/icon-picker/lib/twemoji.ts",
      "frontend/slices/notion/slices/icon-picker/lib/style-pref.ts",
    ],
    tags: ["icon", "emoji", "lucide", "picker", "twemoji", "notion"],
    exampleCode: `import { IconPickerPopover, DynamicIcon } from "@/frontend/slices/notion/slices/icon-picker";

<IconPickerPopover value={page.icon} onChange={(v) => updateIcon(v)} onClear={() => updateIcon("")} />
<DynamicIcon value={page.icon} className="text-2xl" />`,
    agentRecipe:
      "Single icon field stores emoji or 'lucide:Name' plus optional '?c=hex'. parseIconValue() decodes; lucideValue()/withColor() build. Add 'icon: v.string()' to Convex table — no migration needed for existing emoji fields. Popover variant for inline UI, Inline for sheets/dialogs.",
  },
  {
    slug: "rbac-roles",
    title: "RBAC — Tiered System Roles",
    description:
      "Workspace-scoped RBAC with 6 system roles (owner/admin/manager/staff/client/guest) and three tier presets — solo, influencer, organization. Env-based platform admin bypass via PLATFORM_ADMIN_EMAILS. checkPermission / requirePermission helpers, role seeding mutation, @convex-dev/auth aware (no Clerk).",
    source: "superspace",
    repoPath: "recipes/rbac-roles",
    files: [
      "template-base/convex/lib/rbac/perms.ts",
      "template-base/convex/lib/rbac/role-templates.ts",
      "template-base/convex/lib/rbac/platform-admin.ts",
      "template-base/convex/lib/rbac/permissions.ts",
      "template-base/convex/lib/rbac/seed.ts",
      "template-base/convex/auth/schema.ts",
    ],
    tags: ["rbac", "auth", "permissions", "roles", "workspaces", "owner"],
    exampleCode: `import { seedWorkspaceRoles } from "@/convex/lib/rbac/seed";
import { requirePermission } from "@/convex/lib/rbac/permissions";

// In workspace-create mutation:
const wsId = await ctx.db.insert("workspaces", { ... });
await seedWorkspaceRoles(ctx, wsId, "solo"); // or "influencer" | "organization"

// In any mutation:
await requirePermission(ctx, args.workspaceId, "content.create");`,
    agentRecipe:
      "Three tier presets pick which system roles to seed: solo (owner+admin) for personal-brand-os, influencer (+manager) for creator+VA, organization (6 roles) for company/institution. Platform admin via env PLATFORM_ADMIN_EMAILS bypasses all checks. Resolution order: platform admin → workspace owner row → membership.additionalPermissions → role.permissions. Workspaces.userId is the owner field for the notion-port schema; .createdBy for superspace-style. Helpers handle both.",
  },
  {
    slug: "admin-panel",
    title: "Admin Panel — Unified Product Admin",
    description:
      "17-section admin surface (events, funnels, attribution, users, A/B, flags, pricing, CMS, email, audit, ...) gated by RBAC. Auto-filters sidebar by tier (solo/influencer/organization) and user permissions. Single backend resolver (getMyAdminAccess) mirrors frontend gate so UI can never leak.",
    source: "superspace + spec",
    repoPath: "recipes/admin-panel",
    files: [
      "template-base/frontend/slices/admin/config.ts",
      "template-base/frontend/slices/admin/page.tsx",
      "template-base/frontend/slices/admin/README.md",
      "template-base/frontend/slices/admin/components/AdminShell.tsx",
      "template-base/frontend/slices/admin/components/AccessGate.tsx",
      "template-base/frontend/slices/admin/hooks/useAdminAccess.ts",
      "template-base/frontend/slices/admin/index.ts",
      "template-base/convex/features/admin/access.ts",
    ],
    tags: ["admin", "owner", "platform", "rbac", "instrumentation", "panel"],
    exampleCode: `import { AdminPage } from "@/frontend/slices/admin";

// app/admin/page.tsx
export default function Page() {
  const ws = useCurrentWorkspace();
  if (!ws) return null;
  return <AdminPage workspaceId={ws._id} tier={ws.tier ?? "solo"} />;
}`,
    agentRecipe:
      "Wrap pages with <AdminPage workspaceId tier> — AccessGate hides UI for non-admins, AdminShell renders 2-col layout with sidebar filtered by tier+perms. ADMIN_SECTIONS registry in config.ts is single source of truth (17 entries, each with tiers + required perm + P0/P1/P2 priority). Personal-brand-os = tier 'solo' = owner sees everything via owner bypass. Set PLATFORM_ADMIN_EMAILS for cross-workspace superadmin. Depends on rbac-roles recipe — seed roles in your workspace-create mutation first.",
  },
  {
    slug: "event-tracking",
    title: "Event Tracking — P0 Instrumentation",
    description:
      "Client SDK + Convex ingestion endpoint for structured product events. Auto-captures page_view/signup/login + UTM/referrer/first-touch attribution. Batched flush via requestIdleCallback, re-queue on failure. Targets <100ms p99 ingestion. Required before any funnel/activation/A-B feature.",
    source: "spec + superspace analytics",
    repoPath: "recipes/event-tracking",
    files: [
      "template-base/frontend/slices/admin/slices/events/lib/track-event.ts",
      "template-base/convex/features/admin/events.ts",
      "template-base/convex/features/analytics/schema.ts",
    ],
    tags: ["events", "analytics", "instrumentation", "attribution", "utm", "p0"],
    exampleCode: `import { initEventTracking, trackEvent, trackPageView } from "@/frontend/slices/admin";

// app/layout.tsx — once at app root
useEffect(() => { initEventTracking(convex); }, [convex]);

// anywhere
trackEvent({ eventType: "cv_generated", productId: "careerpack", properties: { template: "modern" } });`,
    agentRecipe:
      "Writes to existing analyticsEvents table (no new schema). Anonymous page_view allowed (pre-signup funnel); other events require workspaceId. Session id per tab (sessionStorage), first-touch UTM in localStorage. Flush batched every ~500ms via requestIdleCallback. Cap retry queue at 500. Backend ingest mutation accepts batched array — keep flush under one request.",
  },
  {
    slug: "contact-form-resend",
    title: "Contact Form + Resend",
    description:
      "Contact form posting to Resend email API. Server Action + Zod input validation.",
    source: "cescadesigns",
    repoPath: "recipes/contact-form-resend",
    files: ["recipes/contact-form-resend/src/page.tsx"],
    tags: ["form", "email", "resend", "server-action"],
    exampleCode: `// app/api/contact/route.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const data = await req.formData();
  await resend.emails.send({
    from: "form@yourdomain.com",
    to: "you@yourdomain.com",
    subject: \`From \${data.get("name")}\`,
    html: \`<p>\${data.get("message")}</p>\`,
  });
  return Response.json({ ok: true });
}`,
    agentRecipe:
      "Wire ContactForm.tsx (form action /api/contact) to the route handler. Always validate inputs with Zod server-side.",
  },
];

export function getRecipe(slug: string) {
  return recipes.find((r) => r.slug === slug) ?? null;
}
