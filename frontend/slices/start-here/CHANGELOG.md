# start-here changelog

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): injectable `StartHereAdapter` (apps / open / stages) with an
  in-memory mock (a few generic apps + 3 stages) so the guided welcome tour
  renders fully alive with zero host. Drift-proof — it reads the injected app
  catalog instead of a hardcoded list. Brand-stripped to a generic onboarding
  tour (no person/brand identity copy).
