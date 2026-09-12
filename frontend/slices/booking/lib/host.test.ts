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
  return {
    mode: "live",
    submit: async () => {},
    ...overrides,
  };
}

afterEach(() => {
  configureBooking(adapter());
});

describe("bookingApi", () => {
  it("keeps stable identity while delegating to the latest adapter", async () => {
    const submitA = vi.fn(async () => {});
    const submitB = vi.fn(async () => {});
    const row: BookingRow = { ...request, id: "b-1", status: "pending", createdAt: 1 };
    const listB = vi.fn(async () => [row]);
    const statusB = vi.fn(async () => {});
    const manageB = vi.fn(async () => true);
    const first = bookingApi;
    const before = first.revision;

    configureBooking(adapter({ submit: submitA }));
    configureBooking(adapter({ submit: submitB, list: listB, setStatus: statusB, canManage: manageB }));

    expect(bookingApi).toBe(first);
    expect(first.revision).toBe(before + 2);
    expect(first.hasInbox).toBe(true);
    await first.submit(request);
    expect(submitA).not.toHaveBeenCalled();
    expect(submitB).toHaveBeenCalledWith(request);
    await expect(first.list()).resolves.toEqual([row]);
    await first.setStatus("b-1", "confirmed");
    expect(statusB).toHaveBeenCalledWith("b-1", "confirmed");
    await expect(first.canManage()).resolves.toBe(true);
  });

  it("degrades optional inbox capabilities safely", async () => {
    configureBooking(adapter());
    expect(bookingApi.hasInbox).toBe(false);
    await expect(bookingApi.list()).resolves.toEqual([]);
    await expect(bookingApi.canManage()).resolves.toBe(false);
    await expect(bookingApi.setStatus("missing", "declined")).resolves.toBeUndefined();
  });
});
