/**
 * Format Utilities
 * String, number, and date formatting helpers
 */

/**
 * Format number with locale
 */
export function formatNumber(
  value: number,
  locale = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value)
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number,
  decimals = 0,
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Format date
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-US"
): string {
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(locale, options).format(d)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale = "en-US"
): string {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (days > 0) return rtf.format(-days, "day")
  if (hours > 0) return rtf.format(-hours, "hour")
  if (minutes > 0) return rtf.format(-minutes, "minute")
  return rtf.format(-seconds, "second")
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Convert to title case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ")
}

/**
 * Convert to slug (URL-Contactly)
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Convert to kebab-case
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
}

/**
 * Convert to camelCase
 */
export function toCamelCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
}

/**
 * Pluralize word based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const p = plural || `${singular}s`
  return `${count} ${count === 1 ? singular : p}`
}
