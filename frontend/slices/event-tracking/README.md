# `event-tracking` slice

Framework-neutral analytics instrumentation contract. The slice owns navigation metadata and agentic tool definitions only; the host supplies an `EventTrackingCtx` transport for event emission, guarded event queries, and funnels.

## Install

- React/Next default: `npx rr add event-tracking`
- SvelteKit explicit: `npx rr add event-tracking --framework sveltekit`

Both install the same TypeScript source. There is intentionally no React or Svelte component because the canonical slice does not ship a renderer. Bind `track`, `query`, and `funnel` to the consumer's analytics implementation and enforce access rules on query/funnel at the server boundary.
