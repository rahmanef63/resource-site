/** React icon adapter over the portable block catalog. */
import {
  Type, Heading1, Heading2, Heading3, ListTodo, List, ListOrdered, Quote, Code, Minus,
  Lightbulb, FileText, Database, ChevronRight, Image as ImageIcon, Sigma, Table, Tv2, Film,
  Music, MousePointerClick, Columns2, Columns3, Columns4, ListTree, type LucideIcon,
} from "lucide-react";
import type { BlockType } from "../types";
import { BLOCK_CATALOG } from "./block-catalog";

export interface BlockSpec { type: BlockType; label: string; hint: string; icon: LucideIcon; keywords: string[]; }
const ICONS: Partial<Record<BlockType, LucideIcon>> = {
  paragraph:Type,h1:Heading1,h2:Heading2,h3:Heading3,todo:ListTodo,bullet:List,numbered:ListOrdered,
  toggle:ChevronRight,quote:Quote,callout:Lightbulb,code:Code,equation:Sigma,image:ImageIcon,divider:Minus,
  page:FileText,button:MousePointerClick,database:Database,table:Table,embed:Tv2,columns2:Columns2,columns3:Columns3,
  columns4:Columns4,video:Film,audio:Music,toc:ListTree,
};
export const BLOCK_SPECS: BlockSpec[] = BLOCK_CATALOG.flatMap((item) => {
  const icon=ICONS[item.type]; return icon ? [{...item,icon}] : [];
});
export function specFor(type: BlockType): BlockSpec | undefined { return BLOCK_SPECS.find((s)=>s.type===type); }
