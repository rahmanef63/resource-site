"use client";

// Single integration seam for the booking slice. In the rr catalog the slice
// is SELF-CONTAINED: requests post to an in-memory mock store and the owner
// inbox is shown so the preview is fully interactive. Lifting into a real app:
// call configureBooking({ mode:"live", submit, list, setStatus, canManage })
// pointing at your backend — every other file imports ONLY this seam.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── Shell inspector bus — inert outside a shell ────────────────────────────
export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
  context?: string;
  suggestions?: string[];
};
export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

// ── App descriptor (appshell-compatible subset the barrel uses) ────────────
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

// ── Booking adapter (public request submit + owner inbox) ──────────────────
export type BookingRequest = {
  name: string;
  email: string;
  topic: string;
  preferredTime?: string;
  note?: string;
};
export type BookingStatus = "pending" | "confirmed" | "declined";
export type BookingRow = BookingRequest & { id: string; status: BookingStatus; createdAt: number };

export type BookingAdapter = {
  mode: "mock" | "live";
  /** Public write — anyone can submit a request. */
  submit: (req: BookingRequest) => Promise<void>;
  /** Owner inbox read. Omit to expose a write-only public form (no inbox). */
  list?: () => Promise<BookingRow[]>;
  /** Owner action on a request. */
  setStatus?: (id: string, status: Exclude<BookingStatus, "pending">) => Promise<void>;
  /** Is the current viewer allowed to see + triage the inbox? */
  canManage?: () => Promise<boolean>;
};

// In-browser mock so the slice is alive (form + inbox) with zero backend.
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
    submit: async (req) => {
      rows.unshift({ ...req, id: `local-${++n}`, status: "pending", createdAt: Date.now() });
    },
    list: async () => rows.slice(),
    setStatus: async (id, status) => {
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) return;
      if (status === "declined") rows.splice(i, 1);
      else rows[i] = { ...rows[i], status };
    },
    canManage: async () => true,
  };
}

let adapter: BookingAdapter = createMockBooking();

/** Host wiring: swap the mock for a real backend (Convex, REST, inbox svc…). */
export function configureBooking(a: BookingAdapter): void {
  adapter = a;
}

// Stable identity — components keep `api` in effect deps, so a fresh object
// per render would re-run effects. Delegates live to the current adapter.
const api = {
  get mode() {
    return adapter.mode;
  },
  get hasInbox() {
    return !!adapter.list;
  },
  submit: (req: BookingRequest) => adapter.submit(req),
  list: () => (adapter.list ? adapter.list() : Promise.resolve([] as BookingRow[])),
  setStatus: (id: string, s: Exclude<BookingStatus, "pending">) =>
    adapter.setStatus ? adapter.setStatus(id, s) : Promise.resolve(),
  canManage: () => (adapter.canManage ? adapter.canManage() : Promise.resolve(false)),
};

export function useBookingApi(): typeof api {
  return api;
}
