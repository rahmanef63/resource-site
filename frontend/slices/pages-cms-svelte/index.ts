export { default as PagesView } from "./components/PagesView.svelte";
export { default as PageEditorView } from "./components/PageEditorView.svelte";
export { default as PageEditorBlocks } from "./components/PageEditorBlocks.svelte";
export { default as BlockEditor } from "./components/BlockEditor.svelte";
export { default as BlockRenderer } from "./components/BlockRenderer.svelte";
export { default as BlocksRenderer } from "./components/BlocksRenderer.svelte";
export { default as PageCreateDialog } from "./components/PageCreateDialog.svelte";
export { default as PagesProvider } from "./components/PagesProvider.svelte";
export { default as LocalPagesProvider } from "./components/LocalPagesProvider.svelte";
export { getPagesStore, usePagesStore, usePage } from "./lib/context";
export { pagesCmsFeature } from "./config";

export { pagesReducer } from "../pages-cms/lib/reducer";
export { duplicatePage, blankPage } from "../pages-cms/lib/duplicate";
export { buildPageNavItems, type PageNavItem } from "../pages-cms/lib/nav-builder";
export { defaultPages } from "../pages-cms/lib/default-pages";
export {
  editablePageSnapshot,
  moveBlock,
  orderPagesForAdmin,
  pageHref,
  removeBlock,
  replaceBlock,
  type CreateDialogMode,
  type PagesStore,
} from "../pages-cms/lib/core";
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
} from "../pages-cms/types";
