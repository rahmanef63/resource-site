import {
  Type, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  ListTodo, List, ListOrdered, Quote, Code, Minus, Lightbulb, FileText,
  Database, Columns2, Columns3, Columns4, ChevronRight, Image, Sigma, Table,
  Tv2, MousePointer, RefreshCw, ListTree, Mic, Video, type LucideIcon,
} from "lucide-react";
import type { BlockType } from "@notion/shared/types";
import { BLOCK_CATALOG, type BlockDescriptor } from "./lib/block-catalog";

export interface BlockSpec extends BlockDescriptor { icon: LucideIcon }
const icons: Partial<Record<BlockType, LucideIcon>> = {
  paragraph: Type, h1: Heading1, h2: Heading2, h3: Heading3, h4: Heading4, h5: Heading5, h6: Heading6,
  todo: ListTodo, bullet: List, numbered: ListOrdered, toggle: ChevronRight,
  columns2: Columns2, columns3: Columns3, columns4: Columns4, columns5: Columns4,
  quote: Quote, callout: Lightbulb, code: Code, equation: Sigma, divider: Minus,
  image: Image, page: FileText, database: Database, table: Table, embed: Tv2,
  button: MousePointer, synced: RefreshCw, toc: ListTree, audio: Mic, video: Video,
};
export const BLOCK_SPECS: BlockSpec[] = BLOCK_CATALOG.map((item) => ({ ...item, icon: icons[item.type] ?? Type }));
