export type LoadingKind =
  | "text"
  | "card"
  | "list"
  | "table"
  | "form"
  | "page"
  | "block";

export interface LoadingPreset {
  /** Default repeat count for kinds that render rows/lines. */
  count: number;
  /** Human hint — surfaces in previews and docs. */
  hint: string;
}

/** kind → default {count, hint}. `count` is overridable via props. */
export const LOADING_PRESETS: Record<LoadingKind, LoadingPreset> = {
  text: { count: 3, hint: "paragraph lines, last one shorter" },
  card: { count: 1, hint: "avatar header + body lines in a card frame" },
  list: { count: 4, hint: "avatar + two-line rows" },
  table: { count: 5, hint: "header row + data rows" },
  form: { count: 3, hint: "label + field pairs + submit button" },
  page: { count: 1, hint: "title strip + text + card grid + tall block" },
  block: { count: 1, hint: "single rounded placeholder block" },
};

export const LOADING_KINDS = Object.keys(LOADING_PRESETS) as LoadingKind[];
