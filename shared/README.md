# `rahman-shared` — Kitab Shared Primitives

> SSOT for reusable primitives consumed by all Rahman projects via npm package.
> Published as `rahman-shared` on GitHub Packages.

## Status

**Phase 1 scaffold** — directories created, primitives not yet harvested.

Harvest plan: `/home/rahman/projects/resources/docs/SSOT_MIGRATION_PLAN.md` Phase 2.

## Directory layout

```
shared/
├── ui/             # React component primitives
│   ├── ResponsiveDialog/    # desktop dialog + mobile drawer (TBD — superspace)
│   ├── SmartLink/           # internal/external/protocol-aware routing (TBD)
│   ├── SharedDatePicker/    # RHF-aware date input (TBD)
│   ├── DateField/           # date input field (TBD)
│   ├── FileUpload/          # auto-WebP convert, server mime enforce (TBD)
│   └── Form/                # RHF + Zod wrappers (TBD)
├── lib/            # framework-agnostic utilities
│   ├── format/              # date, currency, plural helpers (TBD)
│   ├── cn/                  # tailwind-merge class name util (TBD)
│   └── sanitizeHtml/        # DOMPurify wrapper (TBD)
├── hooks/          # React hooks
│   ├── useDebounce/         # (TBD)
│   ├── useMediaQuery/       # (TBD)
│   └── useClickOutside/     # (TBD)
└── types/          # cross-primitive shared types
    └── README.md (this file points to source)
```

## Distribution

`packages/shared/` is the npm-publishable package that re-exports this directory.

Consumer install:

```bash
pnpm add rahman-shared
```

Consumer usage:

```tsx
import { ResponsiveDialog, SmartLink, FileUpload } from "rahman-shared/ui";
import { cn, formatDate } from "rahman-shared/lib";
import { useDebounce } from "rahman-shared/hooks";
```

## Versioning

- Semver pinned per release
- Major bump for breaking API changes (new required prop, prop rename, behavior shift)
- Minor for additive (new prop with default, new primitive)
- Patch for bugfix only

## Harvest source priority

Per `SSOT_MIGRATION_PLAN.md` Phase 2:

| Primitive | Source |
|-----------|--------|
| ResponsiveDialog | superspace `components/ui/responsive-dialog` |
| SmartLink | superspace `components/ui/smart-link` |
| SharedDatePicker | superspace `components/ui/date-picker` |
| FileUpload | superspace (auto-WebP pipeline) |

Each harvest: copy → normalize imports → write `<Name>/test.tsx` → docs.

## Anti-patterns enforced

Once published, consumer ESLint rules reject:
- Raw `<a>` for internal routes → use `SmartLink`
- `<input type="date">` → use `DateField`
- `<dialog>` or hand-rolled Radix Dialog → use `ResponsiveDialog`
- Direct file uploads without WebP conversion → use `FileUpload`

## Roadmap

- [ ] Phase 2 — harvest primitives from superspace
- [ ] Phase 3 — write per-primitive tests (Vitest + @testing-library)
- [ ] Phase 4 — publish `rahman-shared@0.1.0` to GitHub Packages
- [ ] Phase 5 — migrate consumer projects to import from `rahman-shared`
