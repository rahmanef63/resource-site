import type { LandingSection } from "@/components/templates/_shared/landing/types";
import type {
  NotionBlock,
  NotionDatabase,
  NotionDoc,
  State,
  Snippet,
} from "./types";

const now = () => Date.now();

/** Notion-OS specific landing seed — features + custom snippets gallery
 *  tuned to the notion-blocks demo. Public homepage reads + renders these
 *  via LandingRenderer; admin edits them at /admin/landing. */
function nosionLandingSections(): LandingSection[] {
  return [
    {
      id: "ls-hero",
      order: 10,
      kind: "hero",
      title: "Block-based writing surface, in 4 primitives.",
      subtitle:
        "Equations, code, subscriptions, drag-fill grids. Each is a portable rr slice — drop into any React surface without convex or store coupling.",
      enabled: true,
    },
    {
      id: "ls-features",
      order: 20,
      kind: "features",
      title: "What ships in notion-blocks",
      subtitle: "Four notion-style primitives, one install.",
      enabled: true,
    },
    {
      id: "ls-snippets",
      order: 30,
      kind: "custom",
      title: "Live snippets gallery",
      subtitle: "Each entry below is admin-editable — add via /admin/snippets, renders live here.",
      enabled: true,
    },
    {
      id: "ls-cta",
      order: 40,
      kind: "cta",
      title: "Lift the whole bundle into your project.",
      subtitle: "Run `npx rr add notion-blocks` — cascades all four peer slices + every shared dep.",
      enabled: true,
    },
  ];
}

const SEED_SNIPPETS: Snippet[] = [
  {
    id: "sn-eq-1",
    kind: "equation",
    title: "Gaussian integral",
    body: String.raw`\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}`,
    order: 1,
    published: true,
  },
  {
    id: "sn-eq-2",
    kind: "equation",
    title: "Mass-energy equivalence",
    body: String.raw`E = mc^2`,
    order: 2,
    published: true,
  },
  {
    id: "sn-code-1",
    kind: "code",
    title: "Type-safe pipeline (TypeScript)",
    lang: "typescript",
    body: `type Pipe<A, B> = (a: A) => B;
const compose = <A, B, C>(f: Pipe<A, B>, g: Pipe<B, C>): Pipe<A, C> =>
  (a) => g(f(a));`,
    order: 3,
    published: true,
  },
  {
    id: "sn-code-2",
    kind: "code",
    title: "rr-sync workflow (bash)",
    lang: "bash",
    body: `pnpm sync:rr notion-blocks --dry-run
pnpm sync:rr notion-blocks
cd ~/projects/resources && git add . && git commit && git push`,
    order: 4,
    published: true,
  },
  {
    id: "sn-text-1",
    kind: "text",
    title: "About this template",
    body: "Nosion-os bundles the notion-blocks slice (4 editor primitives) with admin CRUD + public landing. Each primitive is config-driven — drop into any React surface unchanged.",
    order: 5,
    published: true,
  },
  {
    id: "sn-grid-1",
    kind: "grid",
    title: "Drag-fill demo data",
    body: JSON.stringify([
      { id: "r1", name: "Alice", role: "Author" },
      { id: "r2", name: "Bob", role: "" },
      { id: "r3", name: "Carol", role: "" },
    ]),
    order: 6,
    published: true,
  },
];

/** Notion-clone docs — tree of pages. Each carries a block body that
 *  the editor surface renders via NotionBlock. */
const SEED_DOCS: NotionDoc[] = [
  {
    id: "doc-welcome",
    parentId: null,
    title: "Welcome to Nosion-OS",
    icon: "👋",
    favorite: true,
    trashed: false,
    createdAt: now(),
    updatedAt: now(),
    blocks: [
      { id: "w-hero",    type: "h1",        text: "Welcome to Nosion-OS" } satisfies NotionBlock,
      { id: "w-tagline", type: "paragraph", text: "A Notion-style workspace built from portable rr primitives — notion-shell + notion-database + notion-blocks. Local-first, no backend." } satisfies NotionBlock,
      { id: "w-callout", type: "callout",   text: "Everything you see is editable. Tweak the welcome page, add a database row, drop a code snippet — state lives in your browser via the template store." } satisfies NotionBlock,
      { id: "w-divider1", type: "divider",  text: "" } satisfies NotionBlock,
      { id: "w-h2-fast", type: "h2",        text: "Three things to try" } satisfies NotionBlock,
      { id: "w-num-1",   type: "numbered",  text: "Hover the sidebar → click + to add a child page" } satisfies NotionBlock,
      { id: "w-num-2",   type: "numbered",  text: "Open the Roadmap database — drag rows between Board columns" } satisfies NotionBlock,
      { id: "w-num-3",   type: "numbered",  text: "Type `/` on any line for the slash menu (code, equation, callout, embed…)" } satisfies NotionBlock,
      { id: "w-divider2", type: "divider",  text: "" } satisfies NotionBlock,
      { id: "w-h2-inv",  type: "h2",        text: "Whats in the box" } satisfies NotionBlock,
      { id: "w-feat-1",  type: "bullet",    text: "**Pages** — tree-structured docs with 25+ block types, inline markdown, drag reorder" } satisfies NotionBlock,
      { id: "w-feat-2",  type: "bullet",    text: "**Databases** — table / board / feed / gallery / calendar views, per-property config" } satisfies NotionBlock,
      { id: "w-feat-3",  type: "bullet",    text: "**Snippets** — admin-editable equations, code, grid demos for marketing surfaces" } satisfies NotionBlock,
      { id: "w-feat-4",  type: "bullet",    text: "**Admin panel** — users, audit log, AI config, analytics, webhooks, settings" } satisfies NotionBlock,
      { id: "w-divider3", type: "divider",  text: "" } satisfies NotionBlock,
      { id: "w-toc",     type: "toc",        text: "" } satisfies NotionBlock,
      { id: "w-h2-gal",  type: "h2",        text: "Block gallery — every type is live" } satisfies NotionBlock,
      { id: "w-gal-tip", type: "paragraph", text: "Select any text for the format toolbar. Hover a block → ⋯ for colour, move, duplicate. Click the toggle chevron, edit a table cell, switch the callout icon." } satisfies NotionBlock,
      { id: "w-gal-tog", type: "toggle",    text: "Toggle — blocks nest inside (click the chevron)", collapsed: false, children: [
        { id: "w-gal-tog-a", type: "paragraph", text: "A nested paragraph." } satisfies NotionBlock,
        { id: "w-gal-tog-b", type: "callout",   calloutKind: "note", text: "Even callouts nest." } satisfies NotionBlock,
      ] } satisfies NotionBlock,
      { id: "w-gal-col", type: "columns2",  text: "", columns: [
        [{ id: "w-gal-col-l", type: "paragraph", text: "Left column." } satisfies NotionBlock],
        [{ id: "w-gal-col-r", type: "callout", calloutKind: "tip", text: "Right column — any block nests per column." } satisfies NotionBlock],
      ] } satisfies NotionBlock,
      { id: "w-gal-tab", type: "table",     text: "", tableHeader: true, tableRows: [["Block", "Renders"], ["Callout", "✓"], ["Toggle", "✓"], ["Columns", "✓"], ["Database", "✓"]] } satisfies NotionBlock,
      { id: "w-gal-eq",  type: "equation",  text: "E = mc^2" } satisfies NotionBlock,
      { id: "w-gal-btn", type: "button",    text: "Open the docs", url: "https://resource.rahmanef.com" } satisfies NotionBlock,
      { id: "w-divider4", type: "divider",  text: "" } satisfies NotionBlock,
      { id: "w-h2-cta",  type: "h2",        text: "Lift it into your project" } satisfies NotionBlock,
      { id: "w-cta-cmd", type: "code",      text: "npx rr add notion-blocks", lang: "bash" } satisfies NotionBlock,
      { id: "w-cta-msg", type: "quote",     text: "Cascades all four peer slices + every shared dep. Drop the template into any Next 16 surface." } satisfies NotionBlock,
    ],
  },
  {
    id: "doc-getting-started",
    parentId: "doc-welcome",
    title: "Getting started",
    icon: "🚀",
    favorite: false,
    trashed: false,
    createdAt: now(),
    updatedAt: now(),
    blocks: [
      { id: "g-h1",    type: "h1",        text: "Getting started" } satisfies NotionBlock,
      { id: "g-intro", type: "paragraph", text: "Quick tour of the building blocks. Every demo below is live — click anywhere to edit." } satisfies NotionBlock,
      { id: "g-h2-1",  type: "h2",        text: "Sidebar" } satisfies NotionBlock,
      { id: "g-l1",    type: "bullet",    text: "Hover a row → +  adds a subpage" } satisfies NotionBlock,
      { id: "g-l2",    type: "bullet",    text: "Hover a row → ⋯  duplicates / deletes" } satisfies NotionBlock,
      { id: "g-l3",    type: "bullet",    text: "Drag to reorder, drop on a parent to nest" } satisfies NotionBlock,
      { id: "g-h2-2",  type: "h2",        text: "Pages" } satisfies NotionBlock,
      { id: "g-l4",    type: "bullet",    text: "Click the page icon → emoji + lucide picker (10k+ icons)" } satisfies NotionBlock,
      { id: "g-l5",    type: "bullet",    text: "Type `/` for the slash menu — 25 block types" } satisfies NotionBlock,
      { id: "g-l6",    type: "bullet",    text: "Markdown shortcuts work inline: `**bold**`, `_italic_`, `` `code` ``" } satisfies NotionBlock,
      { id: "g-h2-3",  type: "h2",        text: "Databases" } satisfies NotionBlock,
      { id: "g-l7",    type: "bullet",    text: "Open Roadmap → switch views (Table / Board / Feed)" } satisfies NotionBlock,
      { id: "g-l8",    type: "bullet",    text: "Click a column header → rename, change type, sort, group" } satisfies NotionBlock,
      { id: "g-l9",    type: "bullet",    text: "Inline edit any cell — select cells, drag-fill autocompletes" } satisfies NotionBlock,
    ],
  },
  {
    id: "doc-roadmap-meta",
    parentId: null,
    title: "Roadmap",
    icon: "🗺️",
    favorite: true,
    trashed: false,
    createdAt: now(),
    updatedAt: now(),
    blocks: [
      { id: "r-intro", type: "paragraph", text: "Open the Roadmap database to see the table view + property editor." } satisfies NotionBlock,
    ],
  },
];

// Empty by design — the Roadmap database ships with columns (incl. End date +
// Due date) but NO demo rows. Add rows from the table view; spin up a second
// database with the "+ New database" button to test relation + rollup.
const SEED_DATABASES: NotionDatabase[] = [
  {
    id: "db-roadmap",
    name: "Roadmap",
    icon: "🗺️",
    properties: [
      { id: "name", name: "Name", type: "text" },
      {
        id: "status", name: "Status", type: "select",
        options: [
          { id: "todo",  name: "Todo",  color: "gray" },
          { id: "doing", name: "Doing", color: "blue" },
          { id: "done",  name: "Done",  color: "green" },
        ],
      },
      { id: "done", name: "Done", type: "checkbox" },
      { id: "end", name: "End date", type: "date", dateRange: true, dateIncludeTime: true },
      { id: "due", name: "Due date", type: "date" },
    ],
    rowIds: [],
    views: [
      { id: "v-table", name: "All", type: "table", sorts: [], filters: [], search: "" },
      { id: "v-board", name: "Board", type: "board", groupBy: "status", sorts: [], filters: [], search: "" },
      { id: "v-feed", name: "Feed", type: "feed", sorts: [], filters: [], search: "" },
    ],
    activeViewId: "v-table",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const SEED_STATE: State = {
  pages: [
    {
      id: "pg-home",
      slug: "home",
      title: "Home",
      description: "Landing page showcasing notion-blocks primitives in a real surface.",
      blocks: [],
      status: "published",
      createdAt: now(),
      updatedAt: now(),
      systemPage: true,
    isLanding: true,
    },
  ],
  snippets: SEED_SNIPPETS,
  landingSections: nosionLandingSections(),
  docs: SEED_DOCS,
  databases: SEED_DATABASES,
  workspaces: [
    { id: "ws-personal", name: "Personal", icon: "🏠", sublabel: "Free" },
    { id: "ws-team", name: "Team Space", icon: "👥", sublabel: "Pro" },
    { id: "ws-acme", name: "Acme Co", icon: "🏢", sublabel: "Client" },
  ],
  activeWorkspaceId: "ws-personal",
};
