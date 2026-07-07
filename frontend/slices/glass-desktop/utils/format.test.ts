import { describe, expect, it } from "vitest";
import { clockFace, compact, currency, duration } from "./format";

describe("clockFace", () => {
  it("renders a 24h HH:MM:SS face in en-GB", () => {
    // Constructed in local time and formatted in local time → tz-independent.
    expect(clockFace(new Date(2024, 0, 1, 14, 5, 9))).toBe("14:05:09");
  });
  it("zero-pads and uses h23 (midnight is 00, never 24)", () => {
    expect(clockFace(new Date(2024, 0, 1, 0, 0, 0))).toBe("00:00:00");
  });
});

describe("duration", () => {
  it("formats minutes:seconds", () => {
    expect(duration(259)).toBe("4:19");
  });
  it("shows hours only when present", () => {
    expect(duration(3600 + 4 * 60 + 19)).toBe("1:04:19");
  });
  it("floors to 0:00 and clamps negatives", () => {
    expect(duration(0)).toBe("0:00");
    expect(duration(-5)).toBe("0:00");
  });
  it("renders deciseconds on demand", () => {
    expect(duration(13, { deci: true })).toBe("0:13.0");
  });
  it("auto-renders deciseconds when fractional", () => {
    expect(duration(13.4)).toBe("0:13.4");
  });
});

describe("compact", () => {
  it("abbreviates thousands and millions with one decimal", () => {
    expect(compact(12400)).toBe("12.4K");
    expect(compact(1200000)).toBe("1.2M");
  });
  it("leaves small numbers untouched", () => {
    expect(compact(999)).toBe("999");
  });
});

describe("currency", () => {
  it("formats a grouped 2-decimal value without a symbol", () => {
    expect(currency(462.35)).toBe("462.35");
    expect(currency(1234.5)).toBe("1,234.50");
  });
});
