# pdf-generator

Standalone DOM-to-PDF. No Convex. Client-side.

## Install
```bash
pnpm add html2canvas jspdf
```

## Files
- `lib/pdf.ts` — `generatePdfFromElement(el, opts)`
- `components/DownloadPdfButton.tsx`

## Use
```tsx
const ref = React.useRef<HTMLDivElement>(null);
<div ref={ref}>{/* your printable content */}</div>
<DownloadPdfButton target={ref} filename="report.pdf" />
```

## Common breakage
- Tailwind `oklch()` colors not painted in canvas → set fallback `rgb()` on PDF wrapper.
- Web fonts not loaded → preload via `<link rel="preload" as="font">` before generate.
- CORS on remote images → set `crossOrigin="anonymous"` + server CORS headers.
