# Notion UI

The pure, props-driven Notion-clone primitives suite — three surfaces over one
shared domain-type model. Install one or all:

```bash
npx rr add notion-ui page       # page + block editor
npx rr add notion-ui database    # 11-view database
npx rr add notion-ui sidebar     # tree-nav sidebar
npx rr add notion-ui             # all three; import the surface you need
```

All three are stateless + callback-CRUD (the host owns data). The domain type
model (Block/Page/Property/Database/DbView…) lives in `shared/`. Single-variant
installs import domain types from `@/features/notion-ui/shared`.

> Not the full Notion app — that's the separate `notion` slice (adapter + Convex).
