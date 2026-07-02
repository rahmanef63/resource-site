import type { MenuItem, FeatureType } from "../types";

/**
 * Normalize feature type to valid values
 */
export function normalizeFeatureType(type?: string): "default" | "system" | "optional" {
  if (type === "system") return "system";
  if (type === "optional") return "optional";
  return "default";
}

/**
 * Get current feature type from menu item
 */
export function getFeatureType(item: MenuItem): FeatureType {
  const current = item.metadata?.featureType as string | undefined;
  if (current === "system" || current === "optional" || current === "default") {
    return current;
  }
  return "custom";
}

/**
 * Get original feature type (before any modifications)
 */
export function getOriginalFeatureType(item: MenuItem): "default" | "system" | "optional" {
  const original = item.metadata?.originalFeatureType as string | undefined;
  return normalizeFeatureType(
    original ?? (item.metadata?.featureType as string | undefined)
  );
}

/**
 * Check if feature type can be restored to original
 */
export function canRestoreFeatureType(item: MenuItem): boolean {
  const current = getFeatureType(item);
  const original = getOriginalFeatureType(item);
  return current === "system" && original !== "system";
}
