# ocr

Client-side image-to-text via Tesseract.js. No server, no Convex.

## Install
```bash
pnpm add tesseract.js
```

## Use
```tsx
const [text, setText] = React.useState("");
<OcrDropzone lang="ind+eng" onText={setText}>Drop receipt</OcrDropzone>
<pre>{text}</pre>
```

## Languages
`eng`, `ind`, `jpn`, etc. Combine with `+` (e.g. `ind+eng`). First call downloads ~3MB language pack — cached afterward.
