import type { PageEntry, PagesAction } from "@/components/templates/_shared/pages/types";
import type { WorkspaceContext } from "@/components/templates/_shared/types/common";
import type {
  LandingAction,
  LandingSection,
} from "@/components/templates/_shared/landing/types";
import type {
  Block as NotionBlock,
  Database as NotionDatabase,
  Page as NotionDoc,
  Property,
  PropertyValue,
  PropertyType,
} from "@/features/notion-shell";

/** Demo content type: one rich snippet showcasing a notion-block primitive.
 *  - "equation" kind → LaTeX rendered via EquationBlock
 *  - "code" kind → highlight.js code via CodeBlock
 *  - "text" kind → plain markdown-ish text
 *  - "grid" kind → small 3×2 sample for SelectableCell
 */
export type SnippetKind = "equation" | "code" | "text" | "grid";

export type Snippet = {
  id: string;
  kind: SnippetKind;
  title: string;
  /** Body content. For equation: raw LaTeX string. For code: source.
   *  For text: paragraph. For grid: JSON-stringified row array. */
  body: string;
  /** Used only by kind="code". highlight.js language id. */
  lang?: string;
  /** Linked page for "in-page" rendering — optional. */
  pageId?: string;
  /** Display order in admin list + public gallery. */
  order: number;
  /** Public visibility toggle. */
  published: boolean;
};

export type State = {
  pages: PageEntry[];
  snippets: Snippet[];
  landingSections: LandingSection[];
  /** Advanced-archetype multi-workspace context. Drives the
   *  WorkspaceSwitcher in the primary sidebar header (canary for the
   *  DashboardShellAdvanced shell). */
  workspaces: WorkspaceContext[];
  activeWorkspaceId: string;
  /** Notion-clone docs: tree-structured pages with block body. Database
   *  rows live here too — flagged via `rowOfDatabaseId`. */
  docs: NotionDoc[];
  /** Notion-clone databases: property schema + view config + rowIds. */
  databases: NotionDatabase[];
};

export type Action =
  | { type: "hydrate"; state: State }
  | { type: "reset" }
  | PagesAction
  | LandingAction
  | { type: "snippet.upsert"; snippet: Snippet }
  | { type: "snippet.delete"; id: string }
  /** Advanced shell — swap the active workspace context. */
  | { type: "workspace.switch"; id: string }
  /** Notion-clone doc CRUD. `doc` carries the full row on upsert. */
  | { type: "doc.create"; doc: NotionDoc }
  | { type: "doc.update"; id: string; patch: Partial<NotionDoc> }
  | { type: "doc.delete"; id: string }
  | { type: "doc.move"; id: string; parentId: string | null; beforeId: string | null }
  | { type: "doc.block.update"; docId: string; blockId: string; patch: Partial<NotionBlock> }
  | { type: "doc.block.append"; docId: string; block: NotionBlock }
  | { type: "doc.block.insertAfter"; docId: string; afterId: string; block: NotionBlock }
  | { type: "doc.block.mergeBack"; docId: string; blockId: string }
  | { type: "doc.block.remove"; docId: string; blockId: string }
  | { type: "doc.block.duplicate"; docId: string; blockId: string }
  | { type: "doc.block.turnInto"; docId: string; blockId: string; blockType: NotionBlock["type"] }
  | { type: "doc.block.reorder"; docId: string; from: number; to: number }
  | { type: "doc.duplicate"; id: string }
  /** Database schema + view config. */
  | { type: "db.create"; db: NotionDatabase }
  | { type: "db.update"; id: string; patch: Partial<NotionDatabase> }
  | { type: "db.delete"; id: string }
  | { type: "db.property.add"; dbId: string; propType: PropertyType }
  | { type: "db.property.update"; dbId: string; propId: string; patch: Partial<Property> }
  | { type: "db.property.remove"; dbId: string; propId: string }
  /** Database row mutations — operate on doc + db.rowIds atomically.
   *  `initialProps` lets callers pre-set values at insert time (e.g.
   *  BoardView "+" inside a column → row created with the group value
   *  already on it). */
  | { type: "db.row.add"; dbId: string; initialProps?: Record<string, PropertyValue> }
  | { type: "db.row.update"; dbId: string; rowId: string; propId: string; value: PropertyValue }
  | { type: "db.row.remove"; dbId: string; rowId: string }
  | { type: "db.row.duplicate"; dbId: string; rowId: string }
  /** View CRUD — sort / filter / search lives in db.views[].config. */
  | { type: "db.view.activate"; dbId: string; viewId: string }
  | { type: "db.view.add"; dbId: string; viewType: NotionDatabase["views"][number]["type"] }
  | { type: "db.view.remove"; dbId: string; viewId: string }
  | {
      type: "db.view.config";
      dbId: string;
      viewId: string;
      patch: Partial<NotionDatabase["views"][number]>;
    };

export type { PageEntry, LandingSection, NotionBlock, NotionDatabase, NotionDoc };
