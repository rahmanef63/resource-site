# media-viewer — Preview (media quick-look)

Quick-look viewer for `image | video | audio | pdf | text` with native React/Next and Svelte 5/SvelteKit renderers over the same portable media core.

- **Images** — zoomable 40–300% stage with checkerboard transparency.
- **Audio** — deterministic CSS-bar waveform + playback transport.
- **Video** — play/pause + scrubber in the offline sample gallery; native controls for remote video.
- **PDF/Text** — PDF embed for remote files, truthful offline fallback surfaces for bundled samples.
- **Toolbar** — type chip, zoom, download, editor handoff, previous/next.
- **Remote payload** — `{ path, name, kind }` through the injected media source.
- **Agentic tools** — `mediaViewerTools` remains framework-neutral; React auto-registers it, Svelte can register it through the optional `registerTools` prop or directly from the export.

## Install

```bash
# React/Next default
npx rr add media-viewer

# Native Svelte 5/SvelteKit
npx rr add media-viewer --framework sveltekit
```

## React mount

```tsx
import { MediaViewer } from "@/features/media-viewer";

<MediaViewer />
<MediaViewer payload={{ path: "/media/clip.mp4", name: "clip.mp4", kind: "video" }} />
```

## Host seams

```ts
import { configureMediaSource, configureMediaOpener } from "@/features/media-viewer";

configureMediaSource({ rawUrl: (p) => `/api/v1/fs/raw?path=${encodeURIComponent(p)}` });
configureMediaOpener((appId, title, _size, payload) =>
  openWindow(appId, title, undefined, payload),
);
```

`lib/host-core.ts`, `lib/media.ts`, `lib/remote.ts`, `lib/samples.ts`, and `lib/tools.ts` are framework-neutral. React-only app descriptors/inspector wiring remain in `lib/host.ts` and never ship with the Svelte renderer.
