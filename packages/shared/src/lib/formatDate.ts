import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from "date-fns"

type DateInput = Date | string | number

function toDate(input: DateInput): Date {
  if (input instanceof Date) return input
  if (typeof input === "number") return new Date(input)
  return parseISO(input)
}

/**
 * Format a date as `yyyy-MM-dd` by default. Pass a date-fns pattern to override.
 * Accepts Date, ISO string, or epoch ms.
 */
export function formatDate(input: DateInput, pattern = "yyyy-MM-dd"): string {
  return format(toDate(input), pattern)
}

/**
 * Human-friendly relative format:
 *   - Today               → "h:mm a" (e.g. "3:42 PM")
 *   - Yesterday           → "Yesterday h:mm a"
 *   - Within 7 days       → "<N> days ago"
 *   - Older               → "MMM d, yyyy"
 */
export function formatRelative(input: DateInput): string {
  const d = toDate(input)
  if (isToday(d)) return format(d, "h:mm a")
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (diffDays < 7) return formatDistanceToNowStrict(d, { addSuffix: true })
  return format(d, "MMM d, yyyy")
}
