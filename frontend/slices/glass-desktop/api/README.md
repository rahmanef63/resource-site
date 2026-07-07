# glass-desktop — backend

**No backend.** This slice runs entirely on a `LayoutStore` adapter with a
localStorage implementation by design: rr backend is admin-only and demo
surfaces use the localStorage adapter, not Convex.

The store is swappable for a Convex adapter later without touching widgets —
that is the lift path. Because there are no Convex functions in this slice, the
`convex-test` / authz-denied suite is satisfied vacuously (noted per the test plan).
