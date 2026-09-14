# Media Viewer — Svelte 5 / SvelteKit

Native Svelte renderer for the `media-viewer` slice. React/Next remains the default distribution; use `--framework sveltekit` for this renderer.

## Includes

- Offline sample gallery for image, video, audio, PDF, and text surfaces.
- Image zoom, previous/next navigation, download, and editor handoff.
- Simulated video/audio playback with scrubber and deterministic waveform.
- Remote `{ path, name, kind }` payload rendering for image/video/audio/PDF.
- Framework-neutral `configureMediaOpener` and `configureMediaSource` host seams.
- Exported `mediaViewerTools`; optionally pass `registerTools` to `MediaViewer` to register the collection with your own agent host.

## Install

```bash
npx rr add media-viewer --framework sveltekit
```

The Svelte distribution depends on `svelte@^5` only. It does not install React, Lucide, or shadcn runtime dependencies.
