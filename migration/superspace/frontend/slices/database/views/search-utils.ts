import type { PropertyRowData } from "./table-columns";

interface RecordSearchOptions {
  includeRowId?: boolean;
  includeTopLevelValues?: boolean;
}

function normalizeSearchValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value).toLowerCase();
  }

  if (value instanceof Date) {
    return value.toISOString().toLowerCase();
  }

  if (Array.isArray(value)) {
    const normalizedItems = value
      .map((item) => normalizeSearchValue(item))
      .filter((item): item is string => Boolean(item));

    return normalizedItems.length > 0 ? normalizedItems.join(" ") : null;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, (_key, item) =>
        item instanceof Date ? item.toISOString() : item
      ).toLowerCase();
    } catch {
      const normalizedValues = Object.values(value as Record<string, unknown>)
        .map((item) => normalizeSearchValue(item))
        .filter((item): item is string => Boolean(item));

      return normalizedValues.length > 0 ? normalizedValues.join(" ") : null;
    }
  }

  return String(value).toLowerCase();
}

export function matchesSearchValue(value: unknown, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const normalizedValue = normalizeSearchValue(value);
  return normalizedValue ? normalizedValue.includes(normalizedQuery) : false;
}

export function matchesRecordSearch(
  record: PropertyRowData,
  query: string,
  options: RecordSearchOptions = {},
): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const { includeRowId = true, includeTopLevelValues = true } = options;

  if (includeRowId && matchesSearchValue(record.id, normalizedQuery)) {
    return true;
  }

  if (includeTopLevelValues) {
    const topLevelMatch = Object.entries(record).some(([key, value]) => {
      if (key === "id" || key === "properties") {
        return false;
      }

      return matchesSearchValue(value, normalizedQuery);
    });

    if (topLevelMatch) {
      return true;
    }
  }

  return Object.values(record.properties ?? {}).some((value) =>
    matchesSearchValue(value, normalizedQuery),
  );
}
