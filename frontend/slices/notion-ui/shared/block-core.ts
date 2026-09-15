/** Framework-neutral Notion block domain shared by React and Svelte renderers. */
export type BlockType =
  | "paragraph"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "todo" | "bullet" | "numbered"
  | "quote" | "code" | "divider"
  | "callout" | "page" | "database"
  | "image" | "equation" | "table" | "embed" | "button"
  | "toc" | "audio" | "video" | "toggle"
  | "columns2" | "columns3" | "columns4";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
  lang?: string;
  pageId?: string;
  databaseId?: string;
  children?: Block[];
  columns?: Block[][];
  collapsed?: boolean;
  url?: string;
  caption?: string;
  tableRows?: string[][];
  tableHeader?: boolean;
  width?: number;
  align?: "left" | "center" | "right";
  indent?: number;
  calloutKind?: "note" | "tip" | "warning" | "important" | "caution" | "default";
  color?: string;
  bgColor?: string;
}
