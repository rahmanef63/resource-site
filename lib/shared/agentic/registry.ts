/**
 * Agentic kit — the central tool registry.
 *
 * This is what makes ONE agent able to use MANY slices. A host registers each
 * slice's {@link ToolCollection} together with a `getCtx` thunk that resolves
 * that slice's live state. The registry:
 *   - namespaces every tool to `"<namespace>.<name>"` (collision-proof),
 *   - emits the unified Anthropic `tools[]` (every slice's tools at once),
 *   - dispatches `invoke(name)` to the right tool bound to the right context.
 *
 * The registry implements {@link ToolHost}, so {@link runAgentLoop} drives the
 * whole union with no knowledge of which slice a tool came from.
 *
 * @module lib/shared/agentic/registry
 */

import type {
  AnthropicTool,
  Tool,
  ToolCollection,
  ToolHost,
  ToolOutcome,
} from "./types";

type Entry = { tool: Tool<unknown>; getCtx: () => unknown; namespace: string };

export interface ToolRegistry extends ToolHost {
  /** Register a slice's collection + a thunk that resolves its live context. */
  register<Ctx>(collection: ToolCollection<Ctx>, getCtx: () => Ctx): void;
  /** Whether a fully-qualified tool is flagged `dangerous`. */
  isDangerous(name: string): boolean;
  /** Fully-qualified names of every registered tool. */
  names(): string[];
  /** Number of registered tools. */
  size(): number;
  /** Concatenated state read-back from every collection's `describe`. */
  describeState(): string;
}

function qualify(namespace: string, name: string): string {
  return name.startsWith(`${namespace}.`) ? name : `${namespace}.${name}`;
}

export function createToolRegistry(): ToolRegistry {
  const entries = new Map<string, Entry>();
  const describers: Array<() => string> = [];

  return {
    register(collection, getCtx) {
      const ns = collection.namespace;
      for (const tool of collection.tools) {
        const fq = qualify(ns, tool.name);
        if (entries.has(fq)) {
          throw new Error(`agentic: duplicate tool "${fq}"`);
        }
        entries.set(fq, {
          tool: { ...(tool as Tool<unknown>), name: fq },
          getCtx: getCtx as () => unknown,
          namespace: ns,
        });
      }
      if (collection.describe) {
        const d = collection.describe;
        describers.push(() => d(getCtx() as never));
      }
    },

    anthropicTools(): AnthropicTool[] {
      return [...entries.values()].map((e) => ({
        name: e.tool.name,
        description: e.tool.description,
        input_schema: e.tool.parameters,
      }));
    },

    async invoke(name, input): Promise<ToolOutcome> {
      const entry = entries.get(name);
      if (!entry) return { ok: false, result: `unknown tool "${name}"` };
      try {
        const result = await entry.tool.run(entry.getCtx(), input ?? {});
        return { ok: true, result };
      } catch (e) {
        return { ok: false, result: e instanceof Error ? e.message : "tool failed" };
      }
    },

    isDangerous(name) {
      return entries.get(name)?.tool.dangerous === true;
    },

    names() {
      return [...entries.keys()];
    },

    size() {
      return entries.size;
    },

    describeState() {
      return describers
        .map((d) => d())
        .filter(Boolean)
        .join("\n");
    },
  };
}
