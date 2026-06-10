/**
 * Agentic kit — public barrel.
 *
 * The contract for making any slice agentic WITHOUT giving it its own agent:
 *
 * 1. Author tools (`*.tools.ts`):
 *      export const fooTools = defineToolCollection<FooCtx>({
 *        namespace: "foo",
 *        tools: [defineTool({ name: "bar", description, parameters: obj({…}), run })],
 *        describe: (ctx) => `…current state…`,
 *      });
 *
 * 2. Host aggregates many slices into ONE agent:
 *      const reg = createToolRegistry();
 *      reg.register(fooTools, () => fooStore);
 *      reg.register(imageEditorTools, () => editorStore);
 *      await runAgentLoop(history, reg, { onDelta, onTool });
 *
 * 3. Wire the model once: configureAgentStream(myStreamFn).
 *
 * @module lib/shared/agentic
 */

export type {
  JsonSchema,
  Tool,
  ToolCollection,
  AnthropicTool,
  ToolUse,
  AgentMsg,
  AgentTurn,
  ToolOutcome,
  ToolHost,
} from "./types";
export { defineTool, defineToolCollection } from "./define";
export { str, num, bool, arr, obj, noArgs } from "./schema";
export { createToolRegistry, type ToolRegistry } from "./registry";
export {
  configureAgentStream,
  isAgentStreamConfigured,
  streamAgentTurn,
  type AgentStreamFn,
} from "./host";
export { runAgentLoop, type AgentEvents } from "./agent-loop";
export { globalToolRegistry, registerGlobalTools } from "./global-host";
export { useAgentTools } from "./use-agent-tools";
export { createSseAgentStream } from "./sse-client";
