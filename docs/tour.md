# The Grand Tour (`/tour`) — and what replaced the OS-template catalog

> 2026-06-19 (P7). This file replaces the old `docs/templates/` playbook set
> (T1–T5 + the `_*.md` shared docs), which was deleted when the OS-website-template
> catalog was decommissioned.

## What rr is now

rr is a **slice picker** ("printilan") + **ONE showcase**. There is exactly one
public taxonomy — `slices` (`/slices`) — and one curated walkthrough that arranges
those slices in context, the **Grand Tour** at `/tour`.

## The Grand Tour — 6 Acts

Curated in `lib/content/tour.ts` (`ACT_DEFS`). Each Act has a deep-linkable page
at `/tour/<id>` and references the slice slugs it demonstrates.

| Act | Id | Theme |
|---|---|---|
| Act I | `marketing` | Marketing — hero / pricing / FAQ / CTA sections |
| Act II | `os-appshell` | OS & App Shell — desktop + mobile shell, windows, dock |
| Act III | `media` | Media — galleries, players, lightbox, studio |
| Act IV | `ai` | AI — chat, agentic tools, routing |
| Act V | `content` | Content — editor, CMS (`pages-cms`), comments |
| Act VI | `platform` | Platform, Auth & Commerce — RBAC, auth, payments |

The Tour is NOT a taxonomy and adds no catalog entry — it only references existing
slices. To change what an Act shows, edit `lib/content/tour.ts`.

## What happened to the OS website-templates

The 8 OS templates (personal-brand-os, konsultan-os, kreator-studio-os,
wirausaha-os, riset-kit, agency-studio-os, saas-marketing-os,
notion-page-clone-os) are **no longer a catalog inside rr**:

- `lib/content/layouts.ts` data is emptied (`export const layouts = []`).
- The `/layouts` + `/templates` routes — and the old `/preview/<os-template>`
  full-app + per-section demos — **308-redirect to `/tour`** (`next.config.mjs`).
- ~871 demo files under `app/preview/**` + `components/templates/**` were deleted.
- The live demos run **externally** at `demo-*.rahmanef.com`, served from their own
  Vercel dev-lab repos. The host-based rewriter in `proxy.ts` is untouched — see
  `docs/architecture/subdomain-routing.md`.

If you need to pull an OS template OUT as a standalone product, the forward-looking
design is `docs/architecture/eject-spec.md` (NOT YET IMPLEMENTED; its in-repo slug
source is now stale — see that doc's P7 banner).
