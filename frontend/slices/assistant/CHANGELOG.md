# assistant changelog

## 1.1.0 — 2026-06-10

- Central agent host: `registerAssistantTools(collection, getCtx)` registers
  any slice's ToolCollection; the chat function-calls across all of them via
  the shared `@/shared/agentic` loop once `configureAgentStream` is wired
  (typing demo stays the unwired fallback). `configureAssistantStream`
  (text-only) is deprecated but kept, funnelled into the shared seam.
- Tool catalog goes live: registered tools replace the static `OS_TOOLS`
  demo list in the editors/pickers (`assistantCatalog()`, open `Tool.group`).
- Mobile-responsive port from os-vps (Topside): scrollable tab rows with
  collapsing spacers (no unreachable overflow), ≥36px tab tap targets on
  coarse pointers, safe-area bottom padding on the composer/grids/forms
  (`--sai-bottom` with a 0px fallback so the slice stays standalone), and a
  compact-pane Save button in the form header (the FormShell declares its own
  `@container` so the @max-[700px] variants work without a host window).

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  configureAssistantStream injects any async text-delta generator (SSE/AI
  SDK/agent loop); a typing demo stream keeps the UI alive unwired;
  inspector bus inert. Agents/skills/automations persist in localStorage.
