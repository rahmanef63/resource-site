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

export type State = {
  businesses: Business[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  finance: FinanceRecord[];
  staff: StaffMember[];
  /** O-wave: public pages CRUD slice. */
  pages: import("@/components/templates/_shared/pages/types").PageEntry[];
};

export type Action =
  | import("@/components/templates/_shared/pages/types").PagesAction
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
  | { type: "hydrate"; state: State }
  | { type: "reset" };
