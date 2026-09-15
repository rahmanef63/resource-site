/** React renderer contracts layered over the framework-neutral block domain. */
import type { ComponentType } from "react";
import type { Block, BlockType } from "./block-core";
export type { Block, BlockType } from "./block-core";

export interface BlockRendererProps {
  block: Block;
  pageId?: string;
  onUpdate: (patch: Partial<Block>) => void;
  onReplace?: (next: Block) => void;
  registerRef?: (el: HTMLElement | null) => void;
}
export type BlockRenderers = Partial<Record<BlockType, ComponentType<BlockRendererProps>>>;
