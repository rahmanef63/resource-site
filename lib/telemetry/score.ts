/**
 * Slice quality scoring — pure, deterministic, no I/O.
 *
 * Weights:
 *   audit-bp  40%  (raw 0-100)
 *   usage     30%  (logarithmic — saturates at ~100 consumers)
 *   drift     30%  (inverted — 0 drift = 100, 100 drift = 0)
 *
 * Bands: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, else F.
 */

export interface SliceQualityInputs {
  /** 0-100 from audit-bp. Higher is better. */
  auditScore: number;
  /** Raw count of consumers using slice. */
  usageCount: number;
  /** 0-100, average drift across consumers (0 = perfectly synced). */
  driftAvg: number;
}

export type QualityBand = "A" | "B" | "C" | "D" | "F";

export interface SliceQualityScore {
  /** Weighted: audit 40%, usage 30%, drift 30% (inverted). 0-100 integer. */
  overall: number;
  band: QualityBand;
  breakdown: SliceQualityInputs;
}

const WEIGHT_AUDIT = 0.4;
const WEIGHT_USAGE = 0.3;
const WEIGHT_DRIFT = 0.3;

/** Saturates: 0 consumers → 0, 1 → ~33, 10 → ~70, 100+ → ~100. */
function usageToScore(count: number): number {
  if (count <= 0) return 0;
  // log10(count + 1) / log10(101) maps 0..100 → 0..1 smoothly.
  const norm = Math.log10(count + 1) / Math.log10(101);
  return Math.min(100, Math.max(0, norm * 100));
}

function clamp01x100(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function bandFor(overall: number): QualityBand {
  if (overall >= 90) return "A";
  if (overall >= 80) return "B";
  if (overall >= 70) return "C";
  if (overall >= 60) return "D";
  return "F";
}

export function computeQuality(inputs: SliceQualityInputs): SliceQualityScore {
  const audit = clamp01x100(inputs.auditScore);
  const drift = clamp01x100(inputs.driftAvg);
  const usage = usageToScore(inputs.usageCount);

  const overallRaw =
    audit * WEIGHT_AUDIT + usage * WEIGHT_USAGE + (100 - drift) * WEIGHT_DRIFT;

  const overall = Math.round(overallRaw);
  return {
    overall,
    band: bandFor(overall),
    breakdown: {
      auditScore: audit,
      usageCount: inputs.usageCount,
      driftAvg: drift,
    },
  };
}

/** Component-level normalized scores (0-100), exposed for UI breakdown bars. */
export function computeQualityBars(inputs: SliceQualityInputs): {
  audit: number;
  usage: number;
  drift: number;
} {
  return {
    audit: Math.round(clamp01x100(inputs.auditScore)),
    usage: Math.round(usageToScore(inputs.usageCount)),
    drift: Math.round(100 - clamp01x100(inputs.driftAvg)),
  };
}
