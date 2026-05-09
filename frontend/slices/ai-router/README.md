# `ai-router` slice

Tier-routed LLM access via OpenRouter:

| Tier | Model | Use for |
|---|---|---|
| nano | claude-haiku-4-5 | Classification, spam-flag, headline-suggest |
| mid | claude-sonnet-4-6 | Chat, draft, summarize |
| flagship | claude-opus-4-7 | Methodology review, deep reasoning |

Convex action `api.ai.actions.callModel({ feature, prompt, tier })` logs token usage to `aiUsage`.
