"use client";

import { useCallback, useMemo } from "react";
import { useEditor } from "../lib/store";
import { EDITOR_TOOLS } from "./registry";
import { invokeEditorCommand, type ToolInvocation, type ToolOutcome } from "./invoke";
import type { AnthropicTool } from "./types";

export type { ToolInvocation, ToolOutcome } from "./invoke";

export function useEditorCommands(): {
  tools: AnthropicTool[];
  invoke: (call: ToolInvocation) => Promise<ToolOutcome>;
} {
  const ctx = useEditor();
  const invoke = useCallback((call: ToolInvocation) => invokeEditorCommand(ctx, call), [ctx]);
  return useMemo(() => ({ tools: EDITOR_TOOLS, invoke }), [invoke]);
}
