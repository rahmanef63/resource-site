import type { ComponentType, ReactNode } from "react";
import type { BrandCore, NavGroupCore, NavItemCore } from "./core-types";

export type NavIcon = ComponentType<{ className?: string }>;

export interface NavItem extends NavItemCore<NavItem> {
  icon?: NavIcon;
  badge?: ReactNode;
}

export interface NavGroup extends NavGroupCore<NavItem> {}

export interface Brand extends BrandCore {
  logo?: ReactNode;
}

export type { BrandCore, NavGroupCore, NavItemCore } from "./core-types";
