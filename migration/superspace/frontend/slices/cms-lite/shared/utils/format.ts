import { formatDate as formatDateSSOT, truncate, formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format";

export { truncate };

export function formatDate(date: Date | string, locale: string = "en"): string {
  return formatDateSSOT(date, { year: "numeric", month: "long", day: "numeric" }, locale);
}

export function formatCurrency(amount: number, locale: string = "en-US", currency: string = "SAR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(value: number, locale: string = "en-US", decimals?: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || singular + 's';
}

/**
 * Alias to formatRelativeTime — kept for backward compatibility with date-fns API naming.
 */
export function formatDistanceToNow(date: Date): string {
  return formatRelativeTime(date);
}
