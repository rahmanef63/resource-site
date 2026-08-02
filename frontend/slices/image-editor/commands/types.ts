import type { useEditor } from "../lib/store";
import type { JsonSchema, Tool, AnthropicTool } from "@/shared/agentic";

// The live editor context (every store action) — commands run against this.
export type EditorCtx = ReturnType<typeof useEditor>;

// Re-export the shared agentic vocabulary so the editor uses ONE definition of
// a tool / its schema (was: a private copy). An EditorCommand is just a
// shared Tool bound to the editor context — name, description, parameters
// (Anthropic `input_schema`), and a `run` that mutates the live store and
// returns a short serialisable result the model reads as the tool_result.
export type { JsonSchema, AnthropicTool };
export type EditorCommand = Tool<EditorCtx>;
