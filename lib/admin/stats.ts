import "server-only";
import { loadDna, flattenDrift } from "./lineage";
import { loadSliceRegistry } from "./registry";

export type AdminStats = {
  slices: number;
  contracts: number;
  consumers: number;
  driftAvg: number;
  driftMax: number;
  healthPct: number;
};

export async function loadAdminStats(): Promise<AdminStats> {
  const [dnas, registry] = await Promise.all([loadDna(), loadSliceRegistry()]);
  const drift = flattenDrift(dnas);
  const consumers = new Set(drift.map((d) => d.consumer));

  const driftAvg = drift.length
    ? Math.round(drift.reduce((n, r) => n + r.drift, 0) / drift.length)
    : 0;
  const driftMax = drift.reduce((m, r) => Math.max(m, r.drift), 0);

  const contracts = registry.filter((s) => s.hasContract).length;
  const healthPct = registry.length
    ? Math.round((contracts / registry.length) * 100 - driftAvg / 4)
    : 0;

  return {
    slices: registry.length,
    contracts,
    consumers: consumers.size,
    driftAvg,
    driftMax,
    healthPct: Math.max(0, Math.min(100, healthPct)),
  };
}
