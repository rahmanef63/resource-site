"use client";

// Single integration seam for the booking slice. In the rr catalog the slice
// is SELF-CONTAINED: requests post to an in-memory mock store and the owner
// inbox is shown so the preview is fully interactive. Lifting into a real app:
// call configureBooking({ mode:"live", submit, list, setStatus, canManage })
// pointing at your backend — every other file imports ONLY this seam.

import type { ComponentType } from "react";
import { useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";

export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
  context?: string;
  suggestions?: string[];
};
export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

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
let revision = 0;
const listeners = new Set<() => void>();

export function configureBooking(next: BookingAdapter): void {
  adapter = next;
  revision += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

function getSnapshot(): number {
  return revision;
}

export type BookingApi = {
  readonly mode: BookingAdapter["mode"];
  readonly revision: number;
  readonly hasInbox: boolean;
  submit: (req: BookingRequest) => Promise<void>;
  list: () => Promise<BookingRow[]>;
  setStatus: (id: string, status: Exclude<BookingStatus, "pending">) => Promise<void>;
  canManage: () => Promise<boolean>;
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
};

export function useBookingApi(): BookingApi {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return bookingApi;
}
