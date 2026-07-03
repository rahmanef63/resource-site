# shell-settings changelog

## 1.0.0 — 2026-06-10

- Lifted from os-vps (Topside), near-verbatim — the slice was already
  brand-free (adapter-injected values, shadcn-only imports). One swap: the
  os-vps `ui/segmented` control becomes a slice-local `Segmented` built on
  the shadcn ToggleGroup primitive (single-select, deselect ignored).
