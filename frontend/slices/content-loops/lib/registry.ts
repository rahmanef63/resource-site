// LoopSourceRegistry — singleton of registered sources.
//
// Ported verbatim from Instatic `src/core/loops/registry.ts` (same namespacing
// rules, same lookup semantics). Ids MUST be `namespace.name` so a consumer
// source can't shadow a built-in. Registration is optional: pass `source`
// directly to <ContentLoop> to skip the global registry entirely.

import type { ILoopSourceRegistry, LoopEntitySource } from "./types";

class LoopSourceRegistry implements ILoopSourceRegistry {
  private readonly sources = new Map<string, LoopEntitySource>();

  private validateId(id: string): void {
    if (!id || !id.includes(".")) {
      throw new Error(
        `[content-loops] Invalid source id "${id}". Ids must be namespaced: "namespace.name" (e.g. "data.rows").`,
      );
    }
  }

  register(source: LoopEntitySource): void {
    this.validateId(source.id);
    if (this.sources.has(source.id)) {
      throw new Error(
        `[content-loops] Source "${source.id}" already registered. Use registerOrReplace() to overwrite.`,
      );
    }
    this.sources.set(source.id, source);
  }

  registerOrReplace(source: LoopEntitySource): void {
    this.validateId(source.id);
    this.sources.set(source.id, source);
  }

  unregister(id: string): void {
    this.sources.delete(id);
  }

  get(id: string): LoopEntitySource | undefined {
    return this.sources.get(id);
  }

  getOrThrow(id: string): LoopEntitySource {
    const source = this.sources.get(id);
    if (!source) {
      throw new Error(
        `[content-loops] Source "${id}" not registered. Register it first, or pass source={...} to <ContentLoop>.`,
      );
    }
    return source;
  }

  has(id: string): boolean {
    return this.sources.has(id);
  }

  list(): LoopEntitySource[] {
    return Array.from(this.sources.values());
  }
}

/** Process-wide source registry. Sources self-register via `register()`. */
export const loopSourceRegistry = new LoopSourceRegistry();
