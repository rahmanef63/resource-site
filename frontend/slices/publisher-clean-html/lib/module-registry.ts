// Build a ModuleRegistry from a flat list of module definitions.

import type { ModuleDefinition, ModuleRegistry } from "./types";

export function createModuleRegistry(defs: ModuleDefinition[]): ModuleRegistry {
  const map = new Map(defs.map((d) => [d.id, d]));
  return { get: (id) => map.get(id) };
}
