export type BookingRequest = {
  name: string;
  email: string;
  topic: string;
  preferredTime?: string;
  note?: string;
};

export type BookingStatus = "pending" | "confirmed" | "declined";
export type BookingRow = BookingRequest & {
  id: string;
  status: BookingStatus;
  createdAt: number;
};

export type BookingAdapter = {
  mode: "mock" | "live";
  submit: (req: BookingRequest) => Promise<void>;
  list?: () => Promise<BookingRow[]>;
  setStatus?: (id: string, status: Exclude<BookingStatus, "pending">) => Promise<void>;
  canManage?: () => Promise<boolean>;
};

function createMockBooking(): BookingAdapter {
  const rows: BookingRow[] = [
    {
      id: "seed-1",
      name: "Dewi P.",
      email: "dewi@example.com",
      topic: "Landing page redesign",
      preferredTime: "Weekday evenings",
      status: "pending",
      createdAt: Date.now() - 36e5,
    },
  ];
  let n = 0;
  return {
    mode: "mock",
    async submit(req) {
      rows.unshift({ ...req, id: `local-${++n}`, status: "pending", createdAt: Date.now() });
    },
    async list() {
      return rows.slice();
    },
    async setStatus(id, status) {
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) return;
      if (status === "declined") rows.splice(index, 1);
      else rows[index] = { ...rows[index], status };
    },
    async canManage() {
      return true;
    },
  };
}

let adapter: BookingAdapter = createMockBooking();
let revision = 0;
const listeners = new Set<(api: BookingApi) => void>();

export type BookingApi = {
  readonly mode: BookingAdapter["mode"];
  readonly revision: number;
  readonly hasInbox: boolean;
  submit: (req: BookingRequest) => Promise<void>;
  list: () => Promise<BookingRow[]>;
  setStatus: (id: string, status: Exclude<BookingStatus, "pending">) => Promise<void>;
  canManage: () => Promise<boolean>;
  subscribe: (run: (api: BookingApi) => void) => () => void;
};

export const bookingApi: BookingApi = {
  get mode() {
    return adapter.mode;
  },
  get revision() {
    return revision;
  },
  get hasInbox() {
    return !!adapter.list;
  },
  submit: (req) => adapter.submit(req),
  list: () => (adapter.list ? adapter.list() : Promise.resolve([])),
  setStatus: (id, status) => (adapter.setStatus ? adapter.setStatus(id, status) : Promise.resolve()),
  canManage: () => (adapter.canManage ? adapter.canManage() : Promise.resolve(false)),
  subscribe(run) {
    listeners.add(run);
    run(bookingApi);
    return () => void listeners.delete(run);
  },
};

export function configureBooking(next: BookingAdapter): void {
  adapter = next;
  revision += 1;
  listeners.forEach((listener) => listener(bookingApi));
}
