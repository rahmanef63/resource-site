import type { PageEntry, PagesAction } from "@/components/templates/_shared/pages/types";
import type {
  LandingAction,
  LandingSection,
} from "@/components/templates/_shared/landing/types";

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
};

export type Action =
  | { type: "hydrate"; state: State }
  | { type: "reset" }
  | PagesAction
  | LandingAction
  | { type: "snippet.upsert"; snippet: Snippet }
  | { type: "snippet.delete"; id: string };

export type { PageEntry, LandingSection };
