/**
 * Date utility functions for database views
 */

export interface YearRange {
  earliest: number;
  latest: number;
}

/**
 * Returns the current year as a default range
 */
export function getDefaultYearRange(): YearRange {
  const year = new Date().getFullYear();
  return { earliest: year, latest: year };
}

/**
 * Computes the year range from an array of objects with optional date fields
 */
export function computeYearRange<T extends { startAt?: Date | null; endAt?: Date | null }>(
  items: T[]
): YearRange {
  const years = items
    .flatMap((item) =>
      [item.startAt?.getFullYear(), item.endAt?.getFullYear()].filter(
        (value): value is number => typeof value === "number"
      )
    )
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort();

  if (years.length === 0) {
    return getDefaultYearRange();
  }

  return {
    earliest: years[0],
    latest: years[years.length - 1],
  };
}
