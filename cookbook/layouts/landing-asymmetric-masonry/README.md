# landing-asymmetric-masonry

Portfolio / showcase landing with 8-slot repeating asymmetric masonry. Scroll-reveal stagger. Lifted from rahmanef.com.

## Source

- `src/PortfolioGrid.tsx` + accompanying components copied from `rahmanef.com/frontend/slices/portfolio/components/`

## Pattern

8-slot repeating: 2x2 feature, 1x1 squares, 2x1 wide, tall cells. Intersection Observer → CSS `--reveal-delay` stagger.

## Composition

```tsx
// app/(marketing)/portfolio/page.tsx
import { PortfolioGrid } from "@/cookbook/landing-asymmetric-masonry/PortfolioGrid";

export default function PortfolioPage() {
  return <PortfolioGrid items={items} />;
}
```

## When to use

- Visual showcase (design, photography, case studies)
- Want one section to feel handcrafted vs grid-of-cards monotony
- Items have varied aspect ratios

## Variant

`bento/` subfolder per category (WebsiteBento, InteriorBento) — different asymmetric arrangements per category. See rahmanef source.
