"use client"
import * as React from "react"

export interface ToolbarProps {
  children?: React.ReactNode;
  className?: string;
}

export type SortToolParams = {
  field?: string;
  direction?: "asc" | "desc";
};

export type FilterToolParams = {
  field?: string;
  operator?: string;
  value?: unknown;
};

export type toolType = "sort" | "filter" | "search" | "view" | "actions";

export function Toolbar({ children, className }: ToolbarProps) {
  return <div className={className}>{children}</div>;
}

export function UniversalToolbar(props: ToolbarProps & { tools?: toolType[] }) {
  return <Toolbar {...props} />;
}

export default Toolbar;
