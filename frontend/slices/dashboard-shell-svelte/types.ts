import type { BrandCore, NavGroupCore, NavItemCore } from "../dashboard-shell/lib/core-types";

export interface RenderSnippet<Parameters extends unknown[] = []> {
  (this: void, ...args: number extends Parameters["length"] ? never : Parameters): unknown;
}

export interface NavItem extends NavItemCore<NavItem> {
  icon?: RenderSnippet<[className?: string]>;
  badge?: string | number;
}

export interface NavGroup extends NavGroupCore<NavItem> {}

export interface Brand extends BrandCore {
  logo?: RenderSnippet;
}

export type ShellSlot = RenderSnippet;
