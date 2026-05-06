# cms-public-storefront

E-commerce / blog public storefront with Convex read-only data. Cart context + currency + i18n.

## Source

Inspired by superspace `frontend/slices/cms-lite/` — port that slice into `app/(cms)/` route group of derived project.

## Composition

```
app/(cms)/
├── layout.tsx        # CmsLayout — ConvexClientProvider mode="public", LanguageProvider, CartContext
├── page.tsx          # storefront home
├── [...slug]/page.tsx # dynamic product/page route
└── checkout/page.tsx
```

## Anatomy per page

- Navbar with currency selector, cart dropdown, language switcher
- Page sections from CMS (hero, featured products, blog, testimonials)
- Footer from CMS

## Pattern

- All Convex queries read-only on public routes
- Cart in client context (Zustand), syncs to Convex on auth
- i18n via React Context (`LanguageProvider`)
- Currency conversion via `CurrencySelector`

## When to use

- Headless CMS sites
- Small e-commerce without Stripe-grade complexity
- Marketing site with inventory display
