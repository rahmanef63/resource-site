# Security policy

## Supported versions

The `rahman-resources` CLI is supported on the latest published minor line only.
Older minors receive fixes at the maintainer's discretion; upgrade with
`npx rahman-resources@latest`.

## Reporting a vulnerability

Report privately through GitHub Security Advisories:

<https://github.com/rahmanef63/resource-site/security/advisories/new>

Do not open a public issue for an unpatched vulnerability. There is no
dedicated security email address; advisories are the only intake channel.

Acknowledgement target: **7 days** from report. If you receive no
acknowledgement within that window, re-open or ping the advisory thread.

## In scope

- The CLI install path (`npx rahman-resources`, `npm i rahman-resources`,
  `bin/cli.js`, the tarball contents published to npm).
- The `rahman-resources-mcp` server and its `rr://` resources.
- Slice code shipped by the catalog (`frontend/slices/**`, `template-base/**`,
  generated manifest) as delivered by the CLI.
- Secrets or credentials accidentally published in the package or repository.

## Out of scope

- Applications built with the CLI after install — consumer code, consumer
  configuration, consumer infrastructure and consumer secrets.
- Vulnerabilities reachable only by modifying generated files by hand.
- Third-party dependencies: report upstream first, but tell us so we can
  bump the pin.
- Missing hardening on a consumer deployment (headers, rate limits, WAF,
  Convex deployment policy).
