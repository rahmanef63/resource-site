# cta

Reusable call-to-action banner — two components, fully prop-driven, no
slice-local copy. Pair `CtaView` (full hero-band CTA) with `CtaButton`
(inline action button).

## Surface

| Component | Props | Notes |
|---|---|---|
| `CtaView` | `eyebrow, title, body, href, ctaLabel` (all required) | Full-bleed band; fits at the bottom of a marketing page. |
| `CtaButton` | `href, label` (both required) | Inline-flex link button with `ArrowUpRight` glyph. |

## Convex tables

None — pure component slice.

## Permissions

None.

## Dependencies

- npm: `lucide-react`, `next` (peer)
- kitab slices: none
- shadcn primitives: none (uses raw Tailwind utilities + the project's
  `border-foreground` / `bg-background` tokens)
- env vars: none

## Notes

- Tailwind tokens used: `border-foreground`, `bg-foreground`,
  `text-background`, `bg-background`, `text-foreground`, `font-serif`,
  `tracking-brutal`, `tracking-brutal-sm`. The kitab seed should
  document these as required theme tokens or convert to neutral
  Tailwind equivalents.
- All copy is consumer-supplied. The slice ships no English strings.

## Origin

Harvested from `rahmanef.com` on `2026-05-15` after a generalisation
pass that hoisted the previously-hardcoded copy + `/contact` href into
required props. Source path: `frontend/slices/cta/`.
