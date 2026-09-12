// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bookingApi,
  configureBooking,
  type BookingAdapter,
  type BookingRequest,
  type BookingRow,
} from "./host";

const request: BookingRequest = {
  name: "Rahman",
  email: "rahman@example.com",
  topic: "Product review",
};

function adapter(overrides: Partial<BookingAdapter> = {}): BookingAdapter {
  return { mode: "live", submit: async () => {}, ...overrides };
}

afterEach(() => configureBooking(adapter()));

describe("bookingApi", () => {
  it("keeps stable identity, notifies subscribers, and delegates to the latest adapter", async () => {
    const row: BookingRow = { ...request, id: "b-1", status: "pending", createdAt: 1 };
    const submitA = vi.fn(async () => {});
    const submitB = vi.fn(async () => {});
    const listB = vi.fn(async () => [row]);
    const statusB = vi.fn(async () => {});
    const manageB = vi.fn(async () => true);
    const first = bookingApi;

    configureBooking(adapter({ submit: submitA }));
    const revisions: number[] = [];
    const unsubscribe = first.subscribe((api) => revisions.push(api.revision));
    configureBooking(adapter({ submit: submitB, list: listB, setStatus: statusB, canManage: manageB }));

    expect(bookingApi).toBe(first);
    expect(revisions).toHaveLength(2);
    expect(revisions[1]).toBe(revisions[0] + 1);
    expect(first.hasInbox).toBe(true);
    await first.submit(request);
    expect(submitA).not.toHaveBeenCalled();
    expect(submitB).toHaveBeenCalledWith(request);
    await expect(first.list()).resolves.toEqual([row]);
    await first.setStatus("b-1", "declined");
    expect(statusB).toHaveBeenCalledWith("b-1", "declined");
    await expect(first.canManage()).resolves.toBe(true);

    unsubscribe();
  });

  it("keeps write-only public form capability safe when inbox methods are omitted", async () => {
    configureBooking(adapter());
    expect(bookingApi.hasInbox).toBe(false);
    await expect(bookingApi.list()).resolves.toEqual([]);
    await expect(bookingApi.canManage()).resolves.toBe(false);
    await expect(bookingApi.setStatus("missing", "confirmed")).resolves.toBeUndefined();
  });
});
