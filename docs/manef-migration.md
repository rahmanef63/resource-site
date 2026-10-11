# Resource → Manef

Decision: 2026-10-11. Product owner: Manef. Creator: Rahman Fakhru.
Canonical URL: https://resource.manef.dev. Legacy URL: https://resource.rahmanef.com.
Tracking: Linear Rahman HQ, RAH-220.

## Compatibility and isolation

- Keep this repository and the published npm package names unchanged.
- Existing demo-*.rahmanef.com mappings remain on the legacy Worker.
- Only the exact resource.rahmanef.com hostname redirects, preserving path/query.
- Preserve historical changelogs, attribution, and external MCP endpoint until its own migration is verified.
- Public slice demos use browser localStorage. Browser-local demo state and host-only admin cookies do not automatically move between origins. No database data is deleted by this migration.
- Admin secrets, rate-limit backend, paid API keys and OAuth are not recreated from guesses. Private runtime functions must be verified separately before claiming full admin parity.

## Release gate

1. Run the existing pre-commit/pre-push hooks without bypasses, plus routing tests.
2. Deploy the reviewed source to the Manef hosting account.
3. Add resource.manef.dev, verify DNS/TLS and public page/API/assets behavior.
4. Verify protected admin surfaces remain inaccessible without authentication.
5. Only after target verification, install the exact-host permanent redirect at Cloudflare.
6. Record deployment IDs, checks, exceptions and rollback in Linear RAH-220.

## Rollback

Disable only the migration redirect rule. The original Worker and all demo bindings are retained.
Revert the migration commit using a new commit; do not reset or force-push history.
