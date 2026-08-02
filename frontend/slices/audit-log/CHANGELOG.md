# Changelog — audit-log

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `auditLogTools` — READ-ONLY query/export over injectable `AuditLogCtx.list` (audit.read gated server-side). No agent write surface — writes stay with `createAuditLogger`.
