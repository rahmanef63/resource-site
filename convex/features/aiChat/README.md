# aiChat — backend half of the `ai-chat` slice

Minimal real assistant used across the template fleet (frontend:
`frontend/slices/ai-chat/components/AiChatFab.tsx`).

## Files

| File | What |
|---|---|
| `action.ts` | `chat` action — `generateText` via `ai` SDK + `@ai-sdk/anthropic` (claude-3-5-haiku). Takes `{ messages, system? }`, returns `{ ok, text?, notice? }`. |
| `_schema.ts` | `aiChatTables = {}` — stateless for now; W5 workbench adds threads/messages. |

## Key guard

When `ANTHROPIC_API_KEY` is not set on the deployment the action returns
`{ ok: false, notice }` instead of throwing — builds/prerenders never need
the key, and the FAB degrades to a "set API key" notice.

```bash
npx convex env set ANTHROPIC_API_KEY sk-ant-… --prod
```

## Naming

Folder is camelCase (`aiChat`) — Convex module paths must not contain
hyphens. The frontend slice slug stays `ai-chat`.
