# landing-bento

Feature-grid marketing landing. Bento-style blocks of varied size highlighting features.

## Source

Build by composing `Card` + `Magnetic` + `KineticHeading` from `template-base/frontend/shared/ui/`. No exact source — assemble from primitives.

Reference inspiration: rahmanef.com category bentos, vercel.com, linear.app feature grids.

## Pattern

```
+---------------+--------+
|               |        |
|   Feature 1   |   F2   |
|   (2x2)       |        |
|               |--------|
+-------+-------+   F3   |
|  F4   |  F5   |        |
+-------+-------+--------+
```

CSS Grid with explicit areas:
```css
.bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1rem;
}
.bento > :nth-child(1) { grid-area: 1 / 1 / 3 / 3; }
.bento > :nth-child(2) { grid-area: 1 / 3 / 2 / 4; }
/* ... */
```

## When to use

- Feature/value-prop heavy marketing pages
- Want "modern SaaS" feel
- 4-8 highlights to surface
