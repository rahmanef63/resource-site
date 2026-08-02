import "server-only";
import { loadSliceRegistry } from "./registry";

export type AdminStats = {
  slices: number;
  contracts: number;
  healthPct: number;
};

export async function loadAdminStats(): Promise<AdminStats> {
  const registry = await loadSliceRegistry();
  const contracts = registry.filter((s) => s.hasContract).length;
  const healthPct = registry.length
    ? Math.round((contracts / registry.length) * 100)
    : 0;

  return {
    slices: registry.length,
    contracts,
    healthPct,
  };
}
