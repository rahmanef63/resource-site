# rahman-browser-protocol

The single source of truth for the shapes the **os-vps** browser runtime, the
**browser extension**, and any **agent client** exchange. Pure TypeScript types
plus one helper (`actionToRequest`) — no runtime dependencies.

Keeping these in one package means the runtime's `/elements` response, the
extension's DOM scan, and the agent's tool calls cannot silently drift apart.

## Exports

- `ScannedElement`, `Box` — one interactive element + its selector candidate.
- `PageState`, `ElementsResponse`, `ContentResponse`, `RuntimeInfo` — runtime
  response shapes (mirror `/state`, `/elements`, `/content`, `/info`).
- `BrowserAction` — the action verbs (navigate/click/clickSelector/fill/type/
  key/scroll/back/forward/reload).
- `actionToRequest(action)` — maps an action to its runtime `{ path, body }`,
  matching the os-vps `/api/v1/browser/*` routes.
- `BridgeMessage` — the extension's `postMessage`/`chrome.runtime` envelope.
- `PROTOCOL_VERSION`.

## Mapping to os-vps routes

| Action | os-vps route |
|--------|--------------|
| navigate | `POST /api/v1/browser/navigate` |
| click | `POST /api/v1/browser/click` |
| clickSelector | `POST /api/v1/browser/click-selector` |
| fill | `POST /api/v1/browser/fill` |
| type / key / scroll | `POST /api/v1/browser/{type,key,scroll}` |
| back / forward / reload | `POST /api/v1/browser/{back,forward,reload}` |
| (read) | `GET /api/v1/browser/{state,content,elements,info,screenshot}` |
