# booking changelog

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): injectable `BookingAdapter` (submit / list / setStatus /
  canManage) with an in-memory mock so the request form + owner inbox are both
  interactive with zero backend. Brand-stripped to a generic session-request app.
