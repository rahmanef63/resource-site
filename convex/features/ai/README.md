# `ai` Convex feature

Authenticated tier-routed model dispatch via OpenRouter + per-call usage log.

- Set `OPENROUTER_API_KEY` in Convex server scope.
- `callModel` requires `ctx.auth.getUserIdentity()` before any provider call.
- Missing auth or provider configuration returns `{ ok: false, notice }` without spending provider tokens.
- Successful calls log token counts to the `aiUsage` table.
