# @rahman/shared

Shared UI primitives, hooks, and utils for the [rahman/resources kitab](https://github.com/rahmanef63/resource-site).

## Install (GitHub Packages)

```bash
# .npmrc in your consumer repo:
@rahman:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

pnpm add @rahman/shared
```

`GITHUB_TOKEN` must be a Personal Access Token with `read:packages` scope (or `write:packages` for publishers).

## Surfaces

| Path | Export |
|---|---|
| `@rahman/shared/ui/ResponsiveDialog` | Compound dialog/drawer/sheet/alert with mobile-aware variant |
| `@rahman/shared/ui/SmartLink` | next/link wrapper with internal/external/protocol classification |
| `@rahman/shared/ui/SharedDatePicker` | Date+time picker (calendar popover + time select) |
| `@rahman/shared/ui/DateField` | RHF-aware wrapper around SharedDatePicker |
| `@rahman/shared/ui/FileUpload` | Backend-agnostic upload zone (consumer supplies onUpload callback) |
| `@rahman/shared/hooks/useResponsive` | Tailwind breakpoint subscriber + useMediaQuery |
| `@rahman/shared/hooks/useDebounce` | Debounce value by delay ms |
| `@rahman/shared/hooks/useClickOutside` | Pointer-outside-ref handler |
| `@rahman/shared/lib/formatDate` | formatDate(d, pattern?) + formatRelative(d) |
| `@rahman/shared/lib/sanitizeHtml` | Conservative HTML sanitizer for user content |

## Publish (maintainer)

```bash
cd packages/shared
npm run publish:dry          # validate
npm publish --otp=<6-digit>  # publish
```

## Status

`0.1.0` — initial scaffold (Phase 2 of SSOT migration). Primitive re-exports populated as primitive PRs merge to main.
