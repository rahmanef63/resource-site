import type { MenuItem } from "../types";

/**
 * Filter menu items by search query
 */
export function filterMenuItems(items: MenuItem[] | undefined, searchQuery: string): MenuItem[] {
  if (!items) return [];
  if (!searchQuery) return items;

  const query = searchQuery.toLowerCase();
  return items.filter((item) => {
    return (
      item.name.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query) ||
      item.metadata?.description?.toLowerCase().includes(query)
    );
  });
}
