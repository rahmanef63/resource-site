/**
 * notion-blocks — bundle of editor-block primitives lifted from
 * notion-page-clone. Each block is config-driven + works in ANY
 * React/Next surface (marketing site, admin, app, docs).
 *
 * Re-exports each peer slice's public API so consumers can:
 *   import { EquationBlock, CodeBlock, NotifyMePopover, SelectableCell }
 *     from "@/features/notion-blocks";
 *
 * vs. importing each peer slice individually. The peer slices stay
 * available at @/features/{equation,code-block,notifications,
 * database-cell-selection} for narrow imports.
 */

// Equation block (KaTeX)
export { EquationBlock } from "@/features/equation";
export type { EquationBlockProps } from "@/features/equation";

// Code block (highlight.js + language picker)
export { CodeBlock, CODE_LANGUAGES, normalizeLang } from "@/features/code-block";
export type { CodeBlockProps } from "@/features/code-block";

// Per-page subscription bell (localStorage)
export { NotifyMePopover, useSubscription, SUBSCRIPTION_SCOPE_LABELS } from "@/features/notifications";
export type { PageSubscription, SubscriptionScope } from "@/features/notifications";

// Drag-fill grid selection
export { SelectableCell, useDragFill } from "@/features/database-cell-selection";
export type { FillSource } from "@/features/database-cell-selection";
