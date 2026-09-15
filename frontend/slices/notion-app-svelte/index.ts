export { default as PageEditor } from "./components/PageEditor.svelte";
export { notionAppConfig, type NotionAppSvelteConfig } from "./config";
export { createPageEditorCore, type PageEditorCore, type PageEditorSnapshot } from "@notion/slices/editor/lib/page-core";
export { BLOCK_CATALOG, searchBlocks } from "@notion/slices/editor/lib/block-catalog";
export type { EditorDataAdapter, UserProfile } from "@notion/slices/editor/lib/dataAdapter";
export type { Block, BlockType, Page } from "@notion/shared/types";
export { notionTools, type NotionToolsCtx } from "@/features/notion-app/lib/tools";
