# ai-studio

Generation canvas where AI is the entire product flow. Big prompt → streaming output → iterate. Suno / Midjourney / Lovable pattern.

## Install

```bash
npx rr add ai-studio
```

Peers: `convex-auth`, `ai-router`, `ai-admin`.

## Surfaces

- **Public** — `<GeneratorCanvas />` is the consumer studio. Single big input, 4-up variation grid, version tree.
- **Admin** — template library + few-shot pairs + output moderation rules. Mounts as `admin-panel` section.

## Output kinds

`image` · `text` · `code` · `audio` — pick via `kind` prop or per-template default.

## Status

**Scaffold (0.1.0)** — contract + metadata + types. Real impl pending. UX target at `/preview/slices/ai-studio`.
