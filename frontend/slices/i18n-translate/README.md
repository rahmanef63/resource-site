# i18n-translate

Google Translate widget as a drop-in slice. Replaces hand-maintained locale dictionaries with on-the-fly translation to a curated locale list (16 by default, override via `languages` prop).

## Why a widget instead of a dictionary

A dictionary scales linearly with the surface — every new heading, CTA, microcopy needs a manual entry per locale. The widget translates everything (chrome + body + dynamic content) for the cost of one script tag, with no API key and no Google Cloud billing.

Trade-off: search engines still index the source-language page only. If indexed translated URLs matter, layer a server-side Google Cloud Translation pipeline on top — this slice does not block that.

## Usage

```tsx
// app/header.tsx (or wherever)
import { GoogleTranslate } from "@/features/i18n-translate";

<GoogleTranslate />
```

Project-scoped overrides:

```tsx
<GoogleTranslate
  storageKey="my-app-lang"
  pageLanguage="id"
  languages={[
    { code: "id", label: "Bahasa Indonesia" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
  ]}
  triggerClassName="my-button-styles"
  fallbackRefresh="router"
/>
```

## CSP allowlist (REQUIRED)

The consumer's `middleware.ts` / `proxy.ts` must allow:

```
script-src   https://translate.google.com https://translate.googleapis.com
             https://translate-pa.googleapis.com https://www.gstatic.com
style-src    https://www.gstatic.com
font-src     https://fonts.gstatic.com
connect-src  https://translate.googleapis.com https://translate-pa.googleapis.com
frame-src    https://translate.google.com https://*.translate.goog
```

Without these allowances the widget script fails to load and the button silently no-ops.

## Behavior

| When | What |
|------|------|
| First visit | Reads `navigator.language`. If it doesn't start with `pageLanguage`, picks the closest match from `languages` and sets the `googtrans` cookie BEFORE the widget script loads — first paint is already translated. |
| User picks a lang | Cookie + `localStorage[storageKey]` updated, then `window.location.reload()` (default). The reloaded page reads the new cookie at widget init and comes back already translated. |
| `fallbackRefresh="none"` | Best-effort programmatic combo dispatch instead of reload. Fragile across Cache Components and React re-renders — opt in only if you can't tolerate a reload AND have tested the path. |
| Subsequent visit | `localStorage[storageKey]` wins over browser detection — user choice persists. |

## SSR safety

All DOM/cookie/localStorage access is gated behind `useEffect`; the component renders an inert button shell on the server.

## Multiple instances

Each instance generates its own mount id, but only the first one to mount triggers Google's script load. Later instances reuse the existing `select.goog-te-combo`. Calling `setLang` from any instance affects the whole page.

## Caveats

- Google's widget mutates the DOM by wrapping text nodes in `<font>` tags. If your React tree re-mounts large subtrees often, the translation can blink. Mark stable wrappers with `translate="no"` / `className="notranslate"` to skip them.
- `productionBrowserSourceMaps` + the widget together can spam the console with "could not load source map" — harmless, comes from Google's own bundles.
- The widget is officially "no longer supported for new sites" per Google's deprecation notice (2019), but the endpoint remains live and is widely used. Plan for an eventual migration to the Cloud Translation API if Google ever sunsets the widget endpoint.

## Module layout

| Path | Purpose |
|---|---|
| `components/GoogleTranslate.tsx` | The visible dropdown UI. |
| `hooks/useGoogleTranslate.ts` | Stateful hook — boots widget, manages `current`/`ready`. |
| `lib/widget.ts` | Google widget plumbing (script load, combo dispatch, retry loop). |
| `lib/cookie.ts` | `googtrans` cookie setter (with cross-subdomain share). |
| `lib/storage.ts` | localStorage persistence + browser-lang detection. |
| `lib/styles.ts` | Hides Google's injected chrome (banner / gadget / tooltip). |
| `lib/defaults.ts` | `DEFAULT_LANGUAGES` (16-locale curated set) + default classNames. |
| `lib/types.ts` | `Lang`, `GoogleTranslateProps`, Google widget API type defs. |

## Origin

Lifted from `rahmanef.com` on `2026-05-27`. Source was a 510-LOC monolith at `frontend/slices/i18n-translate/components/GoogleTranslate.tsx`; split into 8 sub-files for the rr 200-LOC cap. Project-specific Tailwind utilities (`tracking-brutal-sm`, `border-[length:var(--border-width,2px)]`) stripped from defaults — replaced with stock `tracking-wider` + `border-2` so the slice renders without a brutalism preset.
