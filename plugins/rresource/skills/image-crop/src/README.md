# image-crop

Standalone image crop dialog + WebP encode. No Convex, no upload pipeline (compose w/ `file-upload`).

## Install
```bash
pnpm add react-easy-crop
```

## Use
```tsx
const [src, setSrc] = React.useState<string | null>(null);
<input type="file" accept="image/*" onChange={(e) => {
  const f = e.target.files?.[0];
  if (f) setSrc(URL.createObjectURL(f));
}} />
<ImageCropDialog open={!!src} src={src ?? ""} aspect={1}
  onClose={() => setSrc(null)}
  onCropped={(blob) => uploadBlob(blob)}
/>
```
