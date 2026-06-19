export { pagesCmsFeature } from "./config";

// Admin surfaces
export { PagesView } from "./components/PagesView";
export { PageEditorView } from "./components/PageEditorView";
export { PageEditorBlocks } from "./components/PageEditorBlocks";
export { BlockEditor, type BlockEditorProps } from "./components/block-editor";
export { PageCreateDialog, type CreateDialogMode } from "./components/page-create-dialog";

// Public render
export { BlockRenderer, BlocksRenderer } from "./components/block-renderer";

// Store
export { PagesProvider, usePagesStore, usePage, type PagesStore } from "./components/pages-context";
export { LocalPagesProvider } from "./components/local-store";

// Lib
export { pagesReducer } from "./lib/reducer";
export { duplicatePage, blankPage } from "./lib/duplicate";
export { buildPageNavItems, type PageNavItem } from "./lib/nav-builder";
export { defaultPages } from "./lib/default-pages";

// Types
export {
  emptyBlock,
  PAGE_BLOCK_KINDS,
  BLOCK_KIND_LABEL,
  type PageEntry,
  type PageBlock,
  type PageBlockKind,
  type PageStatus,
  type CtaLink,
  type PagesSlice,
  type PagesAction,
} from "./types";
