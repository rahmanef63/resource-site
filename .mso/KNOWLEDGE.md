# Rahman Resources (RR) — project knowledge

## Role in Rahman infrastructure
- RR (`resource.rahmanef.com`) is the reusable/public resource source of truth: schemas, manifests, setup guidance, best-practice references, install/compose recipes, provider capability metadata, and agent-readable resources.
- RR is NOT a plaintext credential vault. API keys, tokens, OAuth secrets, private keys, cookies, setup capabilities, and generated secrets never belong in RR catalog rows, docs, MCP resources, git, or chat.
- Live provider credentials and verification belong to MSO Integrations. Project-specific resource bindings, inheritance, setup status, blockers, and provenance belong to Baton.
- Preferred flow: RR resource definition/guide → MSO named connection for private authority → Baton workspace/project binding → bounded provider operation → verification evidence back into Baton.

## Stable integration identity model
- Shared owner identity uses the native MSO credential user `rahmanfakhr` unless a project explicitly needs another owner/account.
- Provider connections are named identities, not global loose env keys. A connection may be reused by many projects while each project binds its own provider resource (repository, Dokploy app/project, Convex deployment, Vercel project, GCP project, etc.).
- Parent/child/grandchild sharing is metadata/resource inheritance; credential bytes are never copied down the tree.
- Resource definitions should expose stable fields such as provider, resourceType, resourceRef, scope, requiredFields, validation, secretClassification, inheritance recommendation, automation capability, official docs/settings URLs, and provenance.

## Dokploy
- Canonical private execution identity: `rahmanfakhr / dokploy / default` in MSO Integrations.
- RR's existing deployment helper consumes `DOKPLOY_API_URL` + `DOKPLOY_API_KEY`, but those values are legacy owner environment inputs, not the long-term RR catalog contract.
- The verified RR Dokploy application is `resource-site`; its source repository is `rahmanef63/resource-site`, branch `main`, with auto-deploy enabled.
- MSO should own reusable Dokploy API authority and expose bounded operations. RR may publish non-secret Dokploy field definitions, setup guidance, deploy recipes, and resource references; Baton should bind individual projects/apps to that shared authority.
- Never bypass Dokploy/MSO deployment contracts by editing raw Docker/container environment variables merely because shell access exists.

## Convex custom domains
- Convex has two distinct native custom-domain surfaces: `convexCloud` for client/functions/API traffic and `convexSite` for HTTP Actions/Auth.
- Cloud and Site aliases can both be provisioned and verified, but canonicalization is separate. Site canonicalization is an auth/issuer/callback migration gate and must not be bulk-applied without checking OAuth/session behavior.
- RR should model the two surfaces distinctly in future infrastructure resources rather than a single generic `domain` field.

## Future RR expansion
- Extend existing manifest/MCP/knowledge architecture instead of creating parallel configuration stores.
- Public resource catalog entries must be deterministic, versioned, composable, and machine-readable; generated catalogs should derive from canonical manifests where practical.
- Provider/resource setup guidance should be reusable by Baton form labels and agent workflows, with exact official links and validation rules.
- Keep execution adapters bounded and provider-specific. Do not create a generic cloud-admin credential or arbitrary provider request escape hatch.
- Large RR migrations should preserve current copy-first slice architecture and public MCP compatibility; infrastructure resources are an additional resource class, not a replacement for slices/templates/skills.
