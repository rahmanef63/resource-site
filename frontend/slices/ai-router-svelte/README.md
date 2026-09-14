# ai-router — SvelteKit

Native Svelte 5 ChatFab over the same AI Router request/result contract and Convex backend used by the React default.

```bash
npx rr add ai-router --framework sveltekit
```

The component is transport-injected. Bind `route` to the consumer's Convex action wrapper for `api.features.ai.action.callModel`. If no transport is supplied, the UI returns an explicit "not wired" notice instead of a fake assistant reply.

```svelte
<ChatFab route={callAiRouter} tier="mid" feature="support-chat" />
```

The Convex action requires an authenticated identity before any paid OpenRouter call and returns `{ ok: false, notice }` when authentication or provider configuration is missing.
