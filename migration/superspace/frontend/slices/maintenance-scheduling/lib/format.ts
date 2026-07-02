/**
 * Slice-local formatters for maintenance-scheduling.
 * Shared by TaskDetailDrawer, TaskList, TaskStatsCards.
 */
export function formatCurrency(value: number, currency = "IDR") {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

export function formatDate(ts: number) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(ts))
  } catch {
    return new Date(ts).toISOString().slice(0, 10)
  }
}
