# media-viewer — Preview (media quick-look)

Quick-look viewer for `image | video | audio | pdf | text`:

- **Images** — zoomable stage (40–300%) on a checkerboard so transparency reads,
  dimensions in the inspector chip.
- **Audio** — card player with CSS-bar waveform + transport.
- **Video** — play/pause, scrubber, volume.
- **PDF** — full-bleed embed. **Text** — simple surface.
- Toolbar: type chip, zoom, Download, Open-in-editor, prev/next.

## Two ways to mount

```tsx
import { MediaViewer } from "@/features/media-viewer";

// 1) Sample gallery (offline, no wiring needed)
<MediaViewer />

// 2) A real file
<MediaViewer payload={{ path: "/media/clip.mp4", name: "clip.mp4", kind: "video" }} />
```

Or hand `mediaViewerApp` (lazy `load`) to an appshell-style launcher.

## Host seams (`lib/host.ts`)

```ts
import { configureMediaSource, configureMediaOpener } from "@/features/media-viewer";

// Resolve fs paths to fetchable URLs (identity by default — public URLs just work)
configureMediaSource({ rawUrl: (p) => `/api/v1/fs/raw?path=${encodeURIComponent(p)}` });

// Route "Open in Image/Video Editor" to your shell (no-op by default)
configureMediaOpener((appId, title, _size, payload) => openWindow(appId, title, undefined, payload));
```

Everything else in the slice imports ONLY this seam — swapping it is the whole
integration.
