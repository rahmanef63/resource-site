# broadcast-channel-sync

Cross-tab + cross-iframe state sync with one shared transport contract. React/Next remains the default distribution and exposes `useBroadcastSync()`. The additive Svelte/SvelteKit distribution exposes `createBroadcastSyncStore()` with normal Svelte store semantics.

## Install

```bash
npx rr add broadcast-channel-sync
```

For Svelte/SvelteKit:

```bash
npx rr add broadcast-channel-sync --framework sveltekit
```

## React

```tsx
const [count, setCount] = useBroadcastSync("rr:counter", 0);
```

The default barrel also exports `createBroadcastSyncStore()` for non-hook consumers.

## Transport behavior

- `BroadcastChannel` is preferred when supported.
- Same-origin `localStorage` + `storage` events are the fallback.
- Storage fallback requires JSON-serializable values; BroadcastChannel supports structured-clone values.
- SSR is safe because browser transports are opened lazily.
- Tool surface remains `broadcast-channel-sync.read` / `publish`; hosts control serialization for agent-facing values.
