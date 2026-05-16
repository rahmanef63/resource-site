# ai-chat

Three-column AI chatbot workbench. Claude.ai / ChatGPT-style — threads + attachments + tools on the left, streaming messages in the center, model picker + params + skills + actions on the right.

## Install

```bash
npx rr add ai-chat
```

Peers auto-resolved: `convex-auth`, `ai-router`, `ai-admin`. Optional: `vector-search` (for the RAG tool).

## Surfaces

- **Public** — `<ChatWorkbench />` consumer chat surface.
- **Admin** — `<ChatAdminPanel />` mounts as an `admin-panel` section: persona, guardrails, fallback responses, starter chips.

## Features

| | |
|---|---|
| Multi-provider | Anthropic / OpenAI / Google / Mistral / Ollama |
| Multimodal | text + image + PDF + audio attachments |
| Streaming | HTTP action SSE — resumable across reload |
| Tool calls | typed JSON-schema, registry from `ai-admin` |
| Agent mode | plan → execute → reflect, configurable max-iter |
| Threading | branch + fork (preserves parent context) |
| Citations | inline numbered + source-card hover |
| Telemetry | per-call cost + latency → ai-admin audit |

## Status

**Scaffold (0.1.0)** — contract + metadata + types shipped. Real implementation pending. See `/preview/slices/ai-chat` for the target UX.
