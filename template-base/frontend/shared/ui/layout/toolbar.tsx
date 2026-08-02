"use client"
import * as React from "react"

export interface ToolbarProps {
  children?: React.ReactNode;
  className?: string;
  spacing?: "compact" | "regular" | "loose";
  background?: "transparent" | "muted" | "default";
  responsive?: boolean;
}

export type SortToolParams = {
  field?: string;
  direction?: "asc" | "desc";
  options?: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  [k: string]: any;
};

export type FilterToolParams = {
  field?: string;
  operator?: string;
  value?: unknown;
  [k: string]: any;
};

export type SearchToolParams = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  [k: string]: any;
};

export const toolType = {
  sort: "sort" as const,
  filter: "filter" as const,
  search: "search" as const,
  view: "view" as const,
  actions: "actions" as const,
};
export type ToolKind = (typeof toolType)[keyof typeof toolType];

export interface ToolDescriptor {
  id: string;
  type: ToolKind;
  params?: SortToolParams | FilterToolParams | SearchToolParams | Record<string, any>;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return <div className={className}>{children}</div>;
}

export function UniversalToolbar(
  props: ToolbarProps & { tools?: Array<ToolDescriptor | ToolKind> },
) {
  return <Toolbar {...props} />;
}

export default Toolbar;
