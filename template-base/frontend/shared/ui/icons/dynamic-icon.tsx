"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

import type { DynamicIconProps, IconLookup, IconName } from "./types";
import {
  FEATURE_ICONS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
  DEFAULT_FEATURE_ICON,
  DEFAULT_CATEGORY_ICON,
} from "./constants";

/**
 * Get icon component lookup map
 * Uses dynamic import from lucide-react
 */
const getIconsLookup = (): IconLookup => {
  return LucideIcons as unknown as IconLookup;
};

/**
 * Normalize icon name to match lucide-react component names
 * Handles various input formats: kebab-case, snake_case, lowercase
 *
 * @example
 * normalizeIconName("chevron-down") // "ChevronDown"
 * normalizeIconName("CHEVRON_DOWN") // "ChevronDown"
 * normalizeIconName("chevronDown") // "ChevronDown"
 */
export function normalizeIconName(name: string): string {
  if (!name) return DEFAULT_ICON;

  // If already in PascalCase (starts with uppercase), return as-is
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return name;
  }

  // Handle kebab-case and snake_case
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Get icon component by name
 * Returns the Lucide icon component or null if not found
 */
export function getIconComponent(name: IconName): LucideIcons.LucideIcon | null {
  if (!name) return null;

  const icons = getIconsLookup();
  const normalizedName = normalizeIconName(name);

  return icons[normalizedName] || null;
}

/**
 * Check if an icon exists
 */
export function iconExists(name: IconName): boolean {
  return getIconComponent(name) !== null;
}

/**
 * Get all available icon names
 */
export function getAllIconNames(): string[] {
  const icons = getIconsLookup();
  return Object.keys(icons).filter(
    (key) =>
      typeof icons[key] === "function" &&
      /^[A-Z]/.test(key) &&
      !key.startsWith("create") &&
      !key.startsWith("default")
  );
}

/**
 * Get feature icon name with fallback
 */
export function getFeatureIconName(feature: string): IconName {
  const key = feature.toLowerCase();
  return FEATURE_ICONS[key] || DEFAULT_FEATURE_ICON;
}

/**
 * Get category icon name with fallback
 */
export function getCategoryIconName(category: string): IconName {
  const key = category.toLowerCase();
  return CATEGORY_ICONS[key] || DEFAULT_CATEGORY_ICON;
}

/**
 * DynamicIcon Component
 *
 * Renders a Lucide icon dynamically based on its name string.
 * This eliminates the need for static imports of individual icons.
 *
 * @example
 * // Instead of:
 * import { Home } from "lucide-react";
 * <Home className="h-4 w-4" />
 *
 * // You can now use:
 * <DynamicIcon name="Home" className="h-4 w-4" />
 *
 * // With fallback:
 * <DynamicIcon name="NonExistentIcon" fallback="HelpCircle" />
 */
export function DynamicIcon({
  name,
  fallback = DEFAULT_ICON,
  ...props
}: DynamicIconProps) {
  const IconComponent = getIconComponent(name) || getIconComponent(fallback);

  if (!IconComponent) {
    console.warn(
      `[DynamicIcon] Icon "${name}" and fallback "${fallback}" not found`
    );
    return null;
  }

  return <IconComponent {...props} />;
}

/**
 * FeatureIcon Component
 *
 * Renders an icon for a specific feature/module.
 * Uses FEATURE_ICONS mapping for consistent icons across the app.
 *
 * @example
 * <FeatureIcon feature="cms" className="h-5 w-5" />
 * <FeatureIcon feature="automation" />
 */
export function FeatureIcon({
  feature,
  ...props
}: { feature: string } & Omit<LucideProps, "ref">) {
  const iconName = getFeatureIconName(feature);
  return <DynamicIcon name={iconName} {...props} />;
}

/**
 * CategoryIcon Component
 *
 * Renders an icon for a specific category.
 * Uses CATEGORY_ICONS mapping for consistent icons.
 *
 * @example
 * <CategoryIcon category="layout" className="h-5 w-5" />
 * <CategoryIcon category="content" />
 */
export function CategoryIcon({
  category,
  ...props
}: { category: string } & Omit<LucideProps, "ref">) {
  const iconName = getCategoryIconName(category);
  return <DynamicIcon name={iconName} {...props} />;
}

// Legacy exports for backward compatibility
export const iconFromName = getIconComponent;
export const getFeatureIcon = (feature: string) =>
  getIconComponent(getFeatureIconName(feature));
export const getCategoryIcon = (category: string) =>
  getIconComponent(getCategoryIconName(category));
