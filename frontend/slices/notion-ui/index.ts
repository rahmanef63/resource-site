// notion-ui — the pure, props-driven Notion-clone primitives suite. Three
// surface variants over one shared domain-type model:
//   page      — page + block editor (NotionPage/NotionBlock, SlashMenu, …).
//   database   — 11-view database (NotionDatabase, filter/sort/group, formula).
//   sidebar    — tree-nav sidebar (NotionSidebar, dnd reorder/reparent).
// Install one with `npx rr add notion-ui page|database|sidebar`, or all with
// `npx rr add notion-ui`. The domain type model (Block/Page/Property/Database/
// DbView…) lives in shared/ and is copied for every variant.
export * from "./shared";
export * from "./variants/page";
export * from "./variants/database";
export * from "./variants/sidebar";
