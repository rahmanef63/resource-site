import type { BlockRendererProps } from "@notion/shared/types";

export type SimpleTableBlockProps = Pick<BlockRendererProps, "block" | "onUpdate" | "onReplace">;
