# ai-admin

Central operator console for the whole AI stack. Plugs into `admin-panel` as an `AI` section with 7 sub-tabs: Providers / Models / Skills / Tools / Agents / Budgets / Audit. Every other ai-* slice reads its registries here at runtime.

## Install

```bash
npx rr add ai-admin
```

Peers: `convex-auth`, `rbac-roles`, `admin-panel`, `audit-log`.

## Env

| Name | Scope | Required |
|---|---|---|
| `AI_ADMIN_ENCRYPTION_KEY` | convex | yes — encrypts provider API keys at rest |

## Tabs

| Tab | Manages |
|---|---|
| Providers | API sources (Anthropic / OpenAI / Google / Mistral / Ollama). API keys AES-encrypted via env key. |
| Models | Per-provider model catalog: capabilities, context window, pricing, active flag. |
| Skills | Named system prompts + tool defaults + model defaults. SSOT for chatbot / copilot / first-app personas. |
| Tools | JSON-schema'd function specs + impl wiring (http / convex / shell). Sandbox flag per tool. |
| Agents | Skill + Model + Tool subset + max-iter. Used by `ai-agent-runner`. |
| Budgets | Per-workspace cost cap (daily / monthly / hard kill). |
| Audit | Every AI call: actor, agent, tokens, cost, latency, outcome. Routes through `audit-log` slice. |

## Status

**Scaffold (0.1.0)** — contract + metadata + types + config. Real impl pending. UX target at `/preview/slices/ai-admin`.
