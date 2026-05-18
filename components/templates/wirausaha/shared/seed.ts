import { SEED_PAGES } from "./pages-seed";
import type {
  Business,
  Customer,
  FinanceRecord,
  Order,
  Product,
  StaffMember,
  State,
} from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_BUSINESSES: Business[] = [
  { id: "biz-1", name: "Warung Kopi Lorem", type: "Kuliner", city: "Bandung",  staffCount: 5, monthlyRevenue: 38_400_000, status: "active" },
  { id: "biz-2", name: "Toko Bahan Ipsum",  type: "Retail",  city: "Surabaya", staffCount: 3, monthlyRevenue: 22_800_000, status: "active" },
  { id: "biz-3", name: "Jasa Cuci Dolor",   type: "Jasa",    city: "Jakarta",  staffCount: 4, monthlyRevenue: 18_200_000, status: "active" },
];

export const SEED_PRODUCTS: Product[] = [
  { id: "p-1", businessId: "biz-1", name: "Kopi Susu Gula Aren", sku: "KSG-01", priceLabel: "Rp 22k", stock: 120, unit: "porsi" },
  { id: "p-2", businessId: "biz-1", name: "Roti Bakar Coklat",   sku: "RBC-02", priceLabel: "Rp 18k", stock: 60,  unit: "porsi" },
  { id: "p-3", businessId: "biz-2", name: "Tepung Terigu 1kg",   sku: "TT-001", priceLabel: "Rp 14k", stock: 240, unit: "pcs" },
  { id: "p-4", businessId: "biz-3", name: "Cuci Setrika 1kg",    sku: "CSI-1",  priceLabel: "Rp 7k",  stock: 999, unit: "kg" },
];

export const SEED_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Budi Santoso",   phone: "+62 812-3456-7890", city: "Bandung",  totalSpentLabel: "Rp 1.4jt",  orderCount: 18 },
  { id: "cust-2", name: "Siti Aminah",    phone: "+62 821-2345-6789", city: "Surabaya", totalSpentLabel: "Rp 480k",   orderCount: 6  },
  { id: "cust-3", name: "Linda Kusuma",   phone: "+62 813-4567-8901", city: "Jakarta",  totalSpentLabel: "Rp 920k",   orderCount: 12 },
];

export const SEED_ORDERS: Order[] = [
  {
    id: "ord-1",
    businessId: "biz-1",
    customerId: "cust-1",
    items: [{ productId: "p-1", qty: 2, priceLabel: "Rp 22k" }, { productId: "p-2", qty: 1, priceLabel: "Rp 18k" }],
    totalLabel: "Rp 62k",
    status: "delivered",
    ts: day(0),
  },
  {
    id: "ord-2",
    businessId: "biz-2",
    customerId: "cust-2",
    items: [{ productId: "p-3", qty: 5, priceLabel: "Rp 14k" }],
    totalLabel: "Rp 70k",
    status: "processing",
    ts: now - 30 * 60 * 1000,
  },
  {
    id: "ord-3",
    businessId: "biz-3",
    customerId: "cust-3",
    items: [{ productId: "p-4", qty: 4, priceLabel: "Rp 7k" }],
    totalLabel: "Rp 28k",
    status: "new",
    ts: now - 12 * 60 * 1000,
  },
];

export const SEED_FINANCE: FinanceRecord[] = [
  { id: "fin-1", businessId: "biz-1", kind: "income",  category: "Penjualan harian", amountLabel: "Rp 1.2jt", note: "Total kasir Senin", ts: day(0) },
  { id: "fin-2", businessId: "biz-1", kind: "expense", category: "Bahan baku",       amountLabel: "Rp 480k",  note: "Beli kopi + susu",  ts: day(1) },
  { id: "fin-3", businessId: "biz-2", kind: "income",  category: "Penjualan",        amountLabel: "Rp 760k",  note: "—",                 ts: day(0) },
  { id: "fin-4", businessId: "biz-3", kind: "expense", category: "Listrik",          amountLabel: "Rp 320k",  note: "Tagihan bulanan",   ts: day(2) },
];

export const SEED_STAFF: StaffMember[] = [
  { id: "stf-1", businessId: "biz-1", name: "Aditya Pratama", role: "Barista",     phone: "+62 813-1111-1111", joinedAt: day(120) },
  { id: "stf-2", businessId: "biz-1", name: "Rina Wijaya",    role: "Kasir",       phone: "+62 813-2222-2222", joinedAt: day(60) },
  { id: "stf-3", businessId: "biz-2", name: "Bayu Hartono",   role: "Penjaga toko",phone: "+62 813-3333-3333", joinedAt: day(180) },
  { id: "stf-4", businessId: "biz-3", name: "Sari Pertiwi",   role: "Operator",    phone: "+62 813-4444-4444", joinedAt: day(40) },
];

export const SEED_STATE: State = {
  businesses: SEED_BUSINESSES,
  products: SEED_PRODUCTS,
  orders: SEED_ORDERS,
  customers: SEED_CUSTOMERS,
  finance: SEED_FINANCE,
  staff: SEED_STAFF,
  pages: SEED_PAGES,
};
