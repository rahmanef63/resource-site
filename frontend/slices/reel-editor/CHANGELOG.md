# Changelog — reel-editor

## 1.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `reelEditorTools` exports 11
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(reelEditorTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.

## 1.1.0 — 2026-06-10

- Container-first compact mode (port from os-vps): the editor reflows off its
  OWN pane width (`useContainer` in the host seam + `@container` on the app
  root), not the viewport — narrow desktop windows get the compact layout too.
- New `CompactPanes`: on a narrow pane the side-by-side desktop panes become
  tabs under the always-visible preview (Timeline / Edit / AI / Files), all
  reachable at ~390px. Replaces the old properties sheet
  (`lib/host-inspector.tsx` removed; shadcn `sheet` dep dropped, `tabs` added).
- Touch ergonomics: ≥36px coarse-pointer tap targets on menu triggers, ratio
  buttons and the segmented mode toggle; brand label + saved-time stamp yield
  first on narrow panes (`@md` container variants).

## 1.0.0 — 2026-06-05

- First rr catalog release (lifted from os-vps).
- Self-contained host seam: sonner toasts, no-op shell buses, injectable
  fs adapter (`configureReelFs`) with an in-memory mock default.
- Slice-local `Segmented` primitive; every file ≤200 LOC.
- Barrel exports `<ReelEditor />` directly plus the `reelEditorApp`
  descriptor for appshell-style hosts.

## 0.3.0 — 2026-06-04

- Tracks are layers: top row renders frontmost; ▲▼ reorder; lock/hide/mute.
- Pro upgrade: draft auto-save + restore, filmstrip thumbnails, tabbed
  inspector (Clip/Text/Audio/Animate/Adjust), text styling + preset grid,
  per-clip color grading + vignette, animation In/Out presets, settings
  dialog (image duration, autosave, project folder).
- Workspace: config-driven resizable layout presets incl. files-pane
  layouts (Content left/right); project-files quick-import pane with
  go-to-folder + copy-path; custom composition size (W×H + swap).
- Host coupling consolidated into `lib/host.ts` (rr-lift seam).

## 0.2.0 — 2026-06-03

- Real media + unified canvas draw path (preview == export).
- Realtime WebM export with real mixed audio (streaming graph, low RAM).
- Per-clip volume/fade/duck, trim in/out, speed/reverse, transitions
  (dissolve/wipe/slide + direction), keyframe easing, waveforms,
  drag-scrub playhead, VPS file-picker import.

## 0.1.0 — 2026-05-29

- Initial mock timeline editor (gradient clips, keyframes, fake render).
