# `ai-router` slice

Tier-routed LLM access via OpenRouter:

| Tier | Model | Use for |
|---|---|---|
| nano | claude-haiku-4-5 | Classification, spam-flag, headline-suggest |
| mid | claude-sonnet-4-6 | Chat, draft, summarize |
| flagship | claude-opus-4-7 | Methodology review, deep reasoning |

Convex action `api.features.aiRouter.action.callModel({ feature, prompt, tier })` logs token usage to `aiUsage`. Key-guarded: returns `{ ok: false, notice }` when `OPENROUTER_API_KEY` is unset (fresh clones degrade instead of throwing); success is `{ ok: true, text }`. Public action driving paid spend — if you compose the rate-limit slice, gate it with an `ai:` prefix `consume` before the model call.
