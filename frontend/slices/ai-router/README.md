# ai-router

Authenticated, tier-routed LLM access through one Convex action + OpenRouter, with a small transport-injected ChatFab.

| Tier | Model | Use for |
|---|---|---|
| nano | claude-haiku-4-5 | Classification and low-cost transforms |
| mid | claude-sonnet-4-6 | Chat, drafting, summaries |
| flagship | claude-opus-4-7 | Deep reasoning |

## Backend

`api.features.ai.action.callModel({ feature, prompt, tier })`:

- requires an authenticated Convex identity before any paid provider call;
- reads `OPENROUTER_API_KEY` server-side only;
- returns `{ ok: false, notice }` when auth/provider configuration is missing;
- logs token counts to the real `aiUsage` table through the internal mutation.

For production spend control, compose the rate-limit slice before exposing high-volume AI surfaces.

## ChatFab

The frontend is transport-injected rather than importing a Convex client. Bind `route` to the consumer's action wrapper:

```tsx
<ChatFab route={(request) => callModel(request)} tier="mid" feature="support-chat" />
```

If `route` is omitted, the shared core returns an explicit wiring notice. It never fabricates a successful assistant reply.

## Install

```bash
npx rr add ai-router
npx rr add ai-router --framework sveltekit
```

React/Next remains default. The SvelteKit distribution provides a native Svelte 5 ChatFab over the same core and Convex backend, without Lucide or shadcn dependencies.
