# Changelog — ai-router

## 0.6.0 — 2026-09-14

- Added native Svelte 5 ChatFab over the same portable request/result/message core and Convex backend as React.
- Removed the fake ChatFab fallback reply; an unconfigured host now gets an explicit wiring notice.
- Required an authenticated Convex identity before paid OpenRouter calls.
- Corrected metadata from nonexistent `ai_router_usage` / `ai_router_calls` tables to the real `aiUsage` table and its real indexes.
- Replaced the synthetic preview flow with a canonical ChatFab preview adapter that never calls OpenRouter.
