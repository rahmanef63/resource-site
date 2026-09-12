# booking changelog

## 1.1.0 — 2026-09-13

- Added an explicit Svelte 5/SvelteKit distribution with public form + owner inbox parity, native controls, and the same injectable BookingAdapter contract.
- Made runtime adapter replacement reactive in the canonical React host while keeping the delegated API identity stable.
- Added host, request-normalization, Svelte contract, and framework-distribution regression coverage.

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): injectable `BookingAdapter` (submit / list / setStatus /
  canManage) with an in-memory mock so the request form + owner inbox are both
  interactive with zero backend. Brand-stripped to a generic session-request app.
