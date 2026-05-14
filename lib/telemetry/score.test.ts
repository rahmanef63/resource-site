import { describe, expect, it } from "vitest";
import { computeQuality, computeQualityBars } from "./score";

describe("computeQuality", () => {
  it("perfect inputs → band A near 100", () => {
    const result = computeQuality({
      auditScore: 100,
      usageCount: 100,
      driftAvg: 0,
    });
    expect(result.band).toBe("A");
    expect(result.overall).toBeGreaterThanOrEqual(95);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  it("mid inputs → band C-ish", () => {
    const result = computeQuality({
      auditScore: 75,
      usageCount: 5,
      driftAvg: 25,
    });
    // audit 30 + usage ~19 + drift-inv 22.5 ≈ 72 → band C
    expect(["C", "D"]).toContain(result.band);
    expect(result.overall).toBeGreaterThanOrEqual(60);
    expect(result.overall).toBeLessThan(80);
  });

  it("failing inputs → band F", () => {
    const result = computeQuality({
      auditScore: 20,
      usageCount: 0,
      driftAvg: 80,
    });
    expect(result.band).toBe("F");
    expect(result.overall).toBeLessThan(60);
  });

  it("edge: usage=0 contributes zero to usage weight", () => {
    const result = computeQuality({
      auditScore: 100,
      usageCount: 0,
      driftAvg: 0,
    });
    // audit 40 + usage 0 + drift-inv 30 = 70 → band C
    expect(result.overall).toBe(70);
    expect(result.band).toBe("C");
    expect(result.breakdown.usageCount).toBe(0);
  });

  it("clamps out-of-range inputs", () => {
    const result = computeQuality({
      auditScore: 250,
      usageCount: -5,
      driftAvg: -10,
    });
    // audit clamped to 100, usage clamped to 0 (negative → 0), drift clamped to 0
    // → 40 + 0 + 30 = 70
    expect(result.overall).toBe(70);
    expect(result.breakdown.auditScore).toBe(100);
    expect(result.breakdown.driftAvg).toBe(0);
  });

  it("computeQualityBars returns inverted drift", () => {
    const bars = computeQualityBars({
      auditScore: 80,
      usageCount: 10,
      driftAvg: 30,
    });
    expect(bars.audit).toBe(80);
    expect(bars.drift).toBe(70); // inverted
    expect(bars.usage).toBeGreaterThan(0);
    expect(bars.usage).toBeLessThanOrEqual(100);
  });
});
