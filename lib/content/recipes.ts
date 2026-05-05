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
