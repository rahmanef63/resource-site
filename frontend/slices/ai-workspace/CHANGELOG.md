# Changelog — ai-workspace

## 0.4.0 — 2026-09-15

- Added native Svelte 5/SvelteKit `chat`, `studio`, and `agents` distributions while keeping React/Next as the default renderer.
- Shared chat message/history semantics through `variants/chat/core.ts`; narrowed agentic imports for chat runner, agents runner, and studio tools to their framework-neutral modules.
- Added exact variant dependency gates: `chat` alone pulls `convex/features/aiChat`, `ai`, `@ai-sdk/anthropic`, and `ANTHROPIC_API_KEY`; `studio` and `agents` remain frontend-only.
- Removed unused `@ai-sdk/openai`, `OPENAI_API_KEY`, and `GOOGLE_GENERATIVE_AI_API_KEY` declarations because the bundled backend does not use them.

