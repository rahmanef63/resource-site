import type { DokuStatus } from "./contracts";

export type ChannelGroup = "va" | "qris" | "ewallet" | "card" | "paylater" | "retail";

export interface PaymentChannel {
  id: string;
  label: string;
  group: ChannelGroup;
  color?: string;
  hint?: string;
}

export const DOKU_CHANNELS: readonly PaymentChannel[] = [
  { id: "VIRTUAL_ACCOUNT_BCA", label: "BCA Virtual Account", group: "va", color: "#0061a8", hint: "Bayar via m-BCA, KlikBCA, ATM BCA." },
  { id: "VIRTUAL_ACCOUNT_BANK_MANDIRI", label: "Mandiri Virtual Account", group: "va", color: "#003a70", hint: "Bayar via Livin, ATM Mandiri." },
  { id: "VIRTUAL_ACCOUNT_BRI", label: "BRI Virtual Account", group: "va", color: "#005baa", hint: "Bayar via BRImo, ATM BRI." },
  { id: "VIRTUAL_ACCOUNT_BNI", label: "BNI Virtual Account", group: "va", color: "#ee7400" },
  { id: "VIRTUAL_ACCOUNT_BANK_CIMB", label: "CIMB Niaga VA", group: "va" },
  { id: "VIRTUAL_ACCOUNT_BANK_PERMATA", label: "Permata VA", group: "va" },
  { id: "VIRTUAL_ACCOUNT_BANK_DANAMON", label: "Danamon VA", group: "va" },
  { id: "VIRTUAL_ACCOUNT_BSI", label: "BSI Virtual Account", group: "va" },
  { id: "VIRTUAL_ACCOUNT_DOKU", label: "DOKU Virtual Account", group: "va" },
  { id: "QRIS", label: "QRIS (semua aplikasi)", group: "qris", color: "#e2231a", hint: "Scan dengan GoPay / OVO / Dana / mobile-banking apa saja." },
  { id: "EMONEY_GOPAY", label: "GoPay", group: "ewallet", color: "#00aed6" },
  { id: "EMONEY_OVO", label: "OVO", group: "ewallet", color: "#4c2a86" },
  { id: "EMONEY_DANA", label: "DANA", group: "ewallet", color: "#118eea" },
  { id: "EMONEY_SHOPEEPAY", label: "ShopeePay", group: "ewallet", color: "#ee4d2d" },
  { id: "EMONEY_LINKAJA", label: "LinkAja", group: "ewallet", color: "#e30613" },
  { id: "CREDIT_CARD", label: "Kartu Kredit / Debit", group: "card" },
  { id: "PEER_TO_PEER_KREDIVO", label: "Kredivo PayLater", group: "paylater" },
  { id: "PEER_TO_PEER_AKULAKU", label: "Akulaku PayLater", group: "paylater" },
  { id: "PEER_TO_PEER_BCA", label: "BCA PayLater", group: "paylater" },
  { id: "ONLINE_TO_OFFLINE_ALFA", label: "Alfamart / Alfamidi", group: "retail" },
  { id: "ONLINE_TO_OFFLINE_INDOMARET", label: "Indomaret", group: "retail" },
] as const;

export const CHANNEL_BY_ID: ReadonlyMap<string, PaymentChannel> = new Map(
  DOKU_CHANNELS.map((channel) => [channel.id, channel]),
);

export const GROUP_LABELS: Record<ChannelGroup, string> = {
  va: "Virtual Account",
  qris: "QRIS",
  ewallet: "E-Wallet",
  card: "Kartu",
  paylater: "PayLater",
  retail: "Minimarket",
};

export function groupDokuChannels(allowedChannels?: readonly string[]) {
  const allowed = allowedChannels ? new Set(allowedChannels) : null;
  const groups: Record<ChannelGroup, PaymentChannel[]> = {
    va: [], qris: [], ewallet: [], card: [], paylater: [], retail: [],
  };
  for (const channel of DOKU_CHANNELS) {
    if (!allowed || allowed.has(channel.id)) groups[channel.group].push(channel);
  }
  return groups;
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function groupVa(va: string): string {
  return va.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function timeLeft(expiresAt: number | undefined): string | null {
  if (!expiresAt) return null;
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Kedaluwarsa";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (m >= 60) return `${Math.floor(m / 60)}j ${m % 60}m`;
  return `${m}m ${s}s`;
}

export const DOKU_STATUS_LABEL: Record<DokuStatus, string> = {
  pending: "Menunggu pembayaran",
  client_claimed: "Menunggu konfirmasi",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
};
