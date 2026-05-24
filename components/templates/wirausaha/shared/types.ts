// Wirausaha OS — domain types.

export type Business = {
  id: string;
  name: string;
  type: string; // "Kuliner", "Retail", "Jasa"
  city: string;
  staffCount: number;
  monthlyRevenue: number;
  status: "active" | "paused";
};

export type Product = {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  priceLabel: string; // "Rp 25k"
  stock: number;
  unit: string; // "pcs", "kg", "porsi"
};

export type OrderStatus = "new" | "processing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  businessId: string;
  customerId: string;
  items: { productId: string; qty: number; priceLabel: string }[];
  totalLabel: string; // "Rp 240k"
  status: OrderStatus;
  ts: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  city: string;
  totalSpentLabel: string;
  orderCount: number;
};

export type FinanceKind = "income" | "expense";

export type FinanceRecord = {
  id: string;
  businessId: string;
  kind: FinanceKind;
  category: string;
  amountLabel: string; // "Rp 1.2jt"
  note: string;
  ts: number;
};

export type StaffMember = {
  id: string;
  businessId: string;
  name: string;
  role: string;
  phone: string;
  joinedAt: number;
};

/** Public catalog item — surfaces an inventory product publicly with
 *  marketing copy + a slug/category for filtering. Distinct from `Product`
 *  (admin/inventory) so we can show items even when stock = 0. */
export type CatalogItem = {
  id: string;
  productId?: string; // optional link back to inventory
  slug: string;
  name: string;
  category: string; // "Kuliner", "Retail", "Jasa", "Paket", "Promo"
  priceLabel: string;
  blurb: string;
  badge?: string; // "Best seller", "Baru", "Promo"
  emoji: string; // visual placeholder (no <img>)
  gradient: string; // tailwind classes e.g. "from-amber-400 to-rose-500"
};

/** Physical outlet / store location. */
export type StoreLocation = {
  id: string;
  name: string;
  businessId?: string;
  city: string;
  address: string;
  phone: string;
  hours: string; // e.g. "Sen–Sab 08:00–21:00"
  mapsUrl?: string;
  emoji: string;
  gradient: string;
};

/** Customer review for the public testimoni wall. */
export type Review = {
  id: string;
  author: string;
  city: string;
  category: string; // "Kuliner", "Retail", "Jasa", "Paket"
  storeId?: string; // link to StoreLocation when scoped to one outlet
  rating: number; // 1..5
  body: string;
  emoji: string;
  publishedAt: number;
};

export type PromotionKind = "percent" | "rupiah";

/** Discount / promo code (admin CRUD). */
export type Promotion = {
  id: string;
  code: string; // "HEMAT10"
  label: string;
  kind: PromotionKind;
  value: number; // % when "percent", Rp when "rupiah"
  startAt: number;
  endAt: number;
  usageLimit: number; // 0 = unlimited
  usedCount: number;
  targetSku?: string; // SKU or category slug
  targetCategory?: string;
  status: "active" | "scheduled" | "expired" | "paused";
};

/** Supplier directory entry. */
export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  leadTimeDays: number;
  terms: string; // "Net 14", "COD", ...
  category: string; // "Bahan baku", "Kemasan", "Logistik", ...
  linkedSkus: string[]; // SKU strings inventory items can match
  note?: string;
};

/** Promo / news / journal entry. */
export type JournalEntry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // plain text, paragraphs split by \n\n
  category: string; // "Promo", "Produk Baru", "Liputan", "Tips"
  author: string;
  publishedAt: number;
  emoji: string;
  gradient: string;
};

export type State = {
  businesses: Business[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  finance: FinanceRecord[];
  staff: StaffMember[];
  pages: import("@/components/templates/_shared/pages/types").PageEntry[];
  landingSections: import("@/components/templates/_shared/landing/types").LandingSection[];
  catalog: CatalogItem[];
  stores: StoreLocation[];
  journal: JournalEntry[];
  reviews: Review[];
  promotions: Promotion[];
  suppliers: Supplier[];
};

export type LandingSection = import("@/components/templates/_shared/landing/types").LandingSection;
export type LandingSectionKind = import("@/components/templates/_shared/landing/types").LandingSectionKind;
export type LandingAction = import("@/components/templates/_shared/landing/types").LandingAction;

export type Action =
  | import("@/components/templates/_shared/pages/types").PagesAction
  | LandingAction
  | { type: "business.upsert"; business: Business }
  | { type: "business.delete"; id: string }
  | { type: "product.upsert"; product: Product }
  | { type: "product.delete"; id: string }
  | { type: "order.upsert"; order: Order }
  | { type: "order.delete"; id: string }
  | { type: "customer.upsert"; customer: Customer }
  | { type: "customer.delete"; id: string }
  | { type: "finance.upsert"; record: FinanceRecord }
  | { type: "finance.delete"; id: string }
  | { type: "staff.upsert"; member: StaffMember }
  | { type: "staff.delete"; id: string }
  | { type: "review.upsert"; review: Review }
  | { type: "review.delete"; id: string }
  | { type: "promotion.upsert"; promotion: Promotion }
  | { type: "promotion.delete"; id: string }
  | { type: "supplier.upsert"; supplier: Supplier }
  | { type: "supplier.delete"; id: string }
  | { type: "hydrate"; state: State }
  | { type: "reset" };
