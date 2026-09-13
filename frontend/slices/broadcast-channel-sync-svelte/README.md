# broadcast-channel-sync — Svelte 5 / SvelteKit

Install the explicit Svelte distribution with:

```sh
npx rr add broadcast-channel-sync --framework sveltekit
```

It exposes a Svelte-readable store contract without React or a required Svelte runtime import:

```ts
import { createBroadcastSyncStore } from "$lib/slices/broadcast-channel-sync";

export const counter = createBroadcastSyncStore("rr:counter", 0);
```

The returned object implements `subscribe`, `set`, and `update`, so Svelte can consume it with normal store semantics. It also exposes `get()` and `destroy()` for imperative hosts.

## Transport behavior

- Uses `BroadcastChannel` when the browser supports it.
- Falls back to same-origin `localStorage` + the `storage` event when BroadcastChannel is unavailable.
- Storage fallback requires JSON-serializable values; BroadcastChannel itself supports structured-clone values.
- SSR is safe: no browser transport is opened when `window` is unavailable.
- `destroy()` closes the channel/storage listener. The transport also stops automatically when the final subscriber unsubscribes.

The default `rr add broadcast-channel-sync` remains the React hook distribution.
