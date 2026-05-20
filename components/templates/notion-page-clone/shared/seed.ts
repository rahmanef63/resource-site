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
    favorite: false,
    trashed: false,
    createdAt: now(),
    updatedAt: now(),
    blocks: [
      { id: "b1", type: "h1", text: "Welcome to Nosion-OS" } satisfies NotionBlock,
      { id: "b2", type: "paragraph", text: "This is a Notion-clone website template built from rr slices: notion-shell wrappers + notion-blocks primitives." } satisfies NotionBlock,
      { id: "b3", type: "h2", text: "What lives here" } satisfies NotionBlock,
      { id: "b4", type: "bullet", text: "Pages — tree-structured docs (this is one)" } satisfies NotionBlock,
      { id: "b5", type: "bullet", text: "Databases — embedded tables w/ schema + rows" } satisfies NotionBlock,
      { id: "b6", type: "bullet", text: "Snippets — admin-editable equations / code / grids on the landing page" } satisfies NotionBlock,
      { id: "b7", type: "quote", text: "Everything is local-first via createTemplateStore — no convex, no auth, no server." } satisfies NotionBlock,
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
      { id: "g1", type: "h2", text: "Three things to try" } satisfies NotionBlock,
      { id: "g2", type: "numbered", text: "Hover a sidebar row → click + to add a subpage" } satisfies NotionBlock,
      { id: "g3", type: "numbered", text: "Click this page icon → pick a different emoji or lucide icon" } satisfies NotionBlock,
      { id: "g4", type: "numbered", text: "Open the Roadmap database — edit cells inline, add rows / properties" } satisfies NotionBlock,
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
  // Roadmap database rows (rowOfDatabaseId = "db-roadmap")
  { id: "row-r1", parentId: null, title: "Ship notion-shell", icon: "📦", favorite: false, trashed: false, createdAt: now(), updatedAt: now(), blocks: [], rowOfDatabaseId: "db-roadmap", rowProps: { name: "Ship notion-shell", status: "done", done: true } },
  { id: "row-r2", parentId: null, title: "Wire template",     icon: "🔌", favorite: false, trashed: false, createdAt: now(), updatedAt: now(), blocks: [], rowOfDatabaseId: "db-roadmap", rowProps: { name: "Wire template",     status: "doing", done: false } },
  { id: "row-r3", parentId: null, title: "Add command palette", icon: "⌨️", favorite: false, trashed: false, createdAt: now(), updatedAt: now(), blocks: [], rowOfDatabaseId: "db-roadmap", rowProps: { name: "Add command palette", status: "todo",  done: false } },
];

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
    ],
    rowIds: ["row-r1", "row-r2", "row-r3"],
    views: [],
    activeViewId: "",
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
};
