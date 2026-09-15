import type { BlockType } from "@/features/notion-ui/shared/block-core";

export interface BlockCatalogItem {
  type: BlockType;
  label: string;
  hint: string;
  glyph: string;
  keywords: string[];
}

export const BLOCK_CATALOG: BlockCatalogItem[] = [
  ["paragraph","Text","Just start writing with plain text","¶",["text","paragraph","p"]],
  ["h1","Heading 1","Big section heading","H1",["h1","heading","title"]],
  ["h2","Heading 2","Medium section heading","H2",["h2","heading"]],
  ["h3","Heading 3","Small section heading","H3",["h3","heading"]],
  ["todo","To-do","Track tasks with a checkbox","☑",["todo","task","check"]],
  ["bullet","Bulleted list","Create a simple list","•",["bullet","list","ul"]],
  ["numbered","Numbered list","Create an ordered list","1.",["numbered","ol"]],
  ["toggle","Toggle","Collapsible section","›",["toggle","collapse","accordion"]],
  ["quote","Quote","Capture a quote","❝",["quote"]],
  ["callout","Callout","Make writing stand out","!",["callout","info"]],
  ["code","Code","Code block with syntax highlight","</>",["code"]],
  ["equation","Equation","Block math (LaTeX/KaTeX)","Σ",["equation","math","latex","formula"]],
  ["image","Image","Embed an image from a URL","▧",["image","img","photo","picture"]],
  ["divider","Divider","Visual separator","—",["divider","hr"]],
  ["page","Page","Embed or create a sub-page","▤",["page","subpage","doc"]],
  ["button","Button","A clickable button that opens a link","↗",["button","cta","action","link"]],
  ["database","Database","Inline database with multiple views","▦",["database","db","kanban","board"]],
  ["table","Table","Plain table grid","▦",["table","grid","spreadsheet"]],
  ["embed","Embed","YouTube · Vimeo · Loom · Figma · CodePen","◫",["embed","iframe","youtube","vimeo"]],
  ["columns2","2 columns","Two side-by-side columns","Ⅱ",["columns","column","2","layout","split"]],
  ["columns3","3 columns","Three side-by-side columns","Ⅲ",["columns","column","3","layout"]],
  ["columns4","4 columns","Four side-by-side columns","Ⅳ",["columns","column","4","layout"]],
  ["video","Video","Embed a video by URL","▶",["video","mp4","movie","clip"]],
  ["audio","Audio","Embed an audio clip by URL","♪",["audio","mp3","sound","music","podcast"]],
  ["toc","Table of contents","Heading outline","≡",["toc","outline","contents"]],
].map(([type,label,hint,glyph,keywords])=>({type,label,hint,glyph,keywords})) as BlockCatalogItem[];

export const blockCatalogItem = (type: BlockType) => BLOCK_CATALOG.find((item) => item.type === type);
