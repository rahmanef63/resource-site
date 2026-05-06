import type { IconCategory, IconName } from "./types";
import { ICONS_BY_CATEGORY } from "./constants";
import { getAllIconNames, normalizeIconName } from "./dynamic-icon";

/**
 * Search for icons by query string
 * Matches against icon names using fuzzy search
 */
export function searchIcons(query: string): IconName[] {
  if (!query || query.trim() === "") {
    return ICONS_BY_CATEGORY.all;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const allIcons = getAllIconNames();

  // Exact match first
  const exactMatches = allIcons.filter(
    (icon) => icon.toLowerCase() === normalizedQuery
  );

  // Starts with query
  const startsWithMatches = allIcons.filter(
    (icon) =>
      icon.toLowerCase().startsWith(normalizedQuery) &&
      !exactMatches.includes(icon)
  );

  // Contains query
  const containsMatches = allIcons.filter(
    (icon) =>
      icon.toLowerCase().includes(normalizedQuery) &&
      !exactMatches.includes(icon) &&
      !startsWithMatches.includes(icon)
  );

  return [...exactMatches, ...startsWithMatches, ...containsMatches];
}

/**
 * Get icons by category
 */
export function getIconsByCategory(category: IconCategory): IconName[] {
  return ICONS_BY_CATEGORY[category] || ICONS_BY_CATEGORY.all;
}

/**
 * Get all icons from constants
 */
export function getAllIcons(): IconName[] {
  return ICONS_BY_CATEGORY.all;
}

/**
 * Get icon category
 */
export function getIconCategory(iconName: IconName): IconCategory {
  const normalizedName = normalizeIconName(iconName);

  for (const [category, icons] of Object.entries(ICONS_BY_CATEGORY)) {
    if (category !== "all" && icons.includes(normalizedName)) {
      return category as IconCategory;
    }
  }

  return "common";
}

/**
 * Check if icon is in a specific category
 */
export function isIconInCategory(
  iconName: IconName,
  category: IconCategory
): boolean {
  const icons = ICONS_BY_CATEGORY[category] || [];
  return icons.includes(normalizeIconName(iconName));
}

/**
 * Get random icons from a category or all icons
 */
export function getRandomIcons(
  count: number,
  category?: IconCategory
): IconName[] {
  const icons = category
    ? getIconsByCategory(category)
    : ICONS_BY_CATEGORY.all;
  const shuffled = [...icons].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get suggested icons based on a keyword
 * Uses simple keyword matching
 */
export function getSuggestedIcons(keyword: string, limit = 10): IconName[] {
  const searchResults = searchIcons(keyword);
  return searchResults.slice(0, limit);
}

/**
 * Search icons within a specific category
 */
export function searchIconsInCategory(
  query: string,
  category: IconCategory
): IconName[] {
  const categoryIcons = getIconsByCategory(category);

  if (!query || query.trim() === "") {
    return categoryIcons;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Exact match first
  const exactMatches = categoryIcons.filter(
    (icon) => icon.toLowerCase() === normalizedQuery
  );

  // Starts with query
  const startsWithMatches = categoryIcons.filter(
    (icon) =>
      icon.toLowerCase().startsWith(normalizedQuery) &&
      !exactMatches.includes(icon)
  );

  // Contains query
  const containsMatches = categoryIcons.filter(
    (icon) =>
      icon.toLowerCase().includes(normalizedQuery) &&
      !exactMatches.includes(icon) &&
      !startsWithMatches.includes(icon)
  );

  return [...exactMatches, ...startsWithMatches, ...containsMatches];
}
