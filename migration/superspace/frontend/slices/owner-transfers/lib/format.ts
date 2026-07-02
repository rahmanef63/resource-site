/**
 * Slice-local currency formatter for owner-transfers.
 * Shared by TransferDetailDrawer, TransferList, TransferStatsCards.
 */
export function formatAmount(value: number, currency = "IDR") {
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
