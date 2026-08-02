# Feature Harvest — Instatic-convex × personal-brand-os → rr slices

**Executive summary.** Twenty features were studied across `personal-brand-os` (Next16/React19/Convex-Cloud template, already slice-shaped, consumes rr) and `Instatic-convex` (Bun/Vite self-hosted-Convex CMS with a visual page-builder). Of the 20: **1 is already covered**, **11 are partially covered** (rr has the concept, harvest only the missing delta), and **8 are genuinely net-new** — and almost all the net-new value is the Instatic **visual-CMS engine**: `visual-page-canvas`, `visual-components-model`, `publisher-clean-html`, `content-loops`, `site-templates-engine`, plus `cms-native-forms`, `plugin-sandbox`, and the portable `import-engines` (site-transfer). The headline deliverable is one **flagship composite** — the visual page-builder — assembled from five pure-logic leaf slices wired by barrels, so we harvest the differentiator (the editor-free tree/module/publish engine) and reuse, not rebuild, everything rr already ships (auth, rbac, payments, content domains, theming, command palette).

## Coverage counts

| rr coverage | count | features |
|---|---|---|
| **covered** | 1 | audit-log |
| **partial** | 11 | data-workspace, media-library, spotlight-command, ai-byok, auth-access-rbac, admin-dashboard, site-runtime-shell, content-model, commerce-checkout, setup-onboarding, theming-presets |
| **net-new** | 8 | visual-page-canvas, visual-components-model, publisher-clean-html, plugin-sandbox, cms-native-forms, content-loops, import-engines, site-templates-engine |

By action: **15 build-new**, **4 enhance** (spotlight-command, auth-access-rbac, audit-log, commerce-checkout), **1 pure reuse** (content-model).

## Coverage matrix

| Feature | Source | rr coverage | Existing / proposed slice | Action | Effort |
|---|---|---|---|---|---|
| [Visual Page Canvas (WYSIWYG builder)](features/visual-page-canvas.md) | instatic + pbos | net-new | `visual-page-canvas` (new) | build-new | L |
| [Visual Components Model / registry](features/visual-components-model.md) | instatic + pbos | net-new | `visual-components-model` (new) | build-new | L |
| [Publisher — clean-HTML pipeline](features/publisher-clean-html.md) | instatic | net-new | `publisher-clean-html` (new) | build-new | L |
| [Plugin System (QuickJS sandbox + SDK)](features/plugin-sandbox.md) | instatic | net-new | `plugin-sandbox` (new) | build-new | L |
| [CMS Native Forms (builder + submissions)](features/cms-native-forms.md) | instatic + pbos | net-new | `cms-native-forms` (new) | build-new | L |
| [Content Loops (pluggable repeater)](features/content-loops.md) | instatic | net-new | `content-loops` (new) | build-new | L |
| [Site templates engine](features/site-templates-engine.md) | instatic + pbos | net-new | `site-templates-engine` (new) | build-new | M |
| [Import engines (site-transfer)](features/import-engines.md) | instatic + pbos | net-new | `import-engines` (new) | build-new | M |
| [Data Workspace (dynamic tables/rows/publish)](features/data-workspace.md) | instatic + pbos | partial | `data-workspace` (new) + reuse `notion-database`/`notion-shell` | build-new | L |
| [Media Library (folders + storage)](features/media-library.md) | instatic + pbos | partial | `media-library` (new) + reuse `file-explorer`/`files` | build-new | L |
| [AI subsystem (BYOK)](features/ai-byok.md) | instatic + pbos | partial | `ai-byok` (new); consumed by `ai-admin`/`ai-chat` | build-new | L |
| [Admin dashboard & shell](features/admin-dashboard.md) | instatic + pbos | partial | `dashboard-grid` (new) + reuse `appshell` | build-new | M |
| [Public site runtime & shell](features/site-runtime-shell.md) | instatic + pbos | partial | `site-runtime-shell` (new) + reuse `marketing-chrome`/`theme-presets` | build-new | M |
| [Commerce: checkout/orders/leads](features/commerce-checkout.md) | pbos | partial | `commerce-checkout` (new UI) + `convex/features/orders`+`leads`; reuse `storefront-checkout` | enhance | M |
| [First-run setup & onboarding](features/setup-onboarding.md) | instatic + pbos | partial | `setup-onboarding` (new) + reuse `onboarding-wizard` | build-new | M |
| [Theming & editor preferences](features/theming-presets.md) | instatic + pbos | partial | reuse `theme-presets` + `editor-preferences` (new) | build-new | M |
| [Spotlight / command palette](features/spotlight-command.md) | instatic | partial | `command-menu` (enhance: add `lib/engine/`) | enhance | M |
| [Auth, sessions, roles & capabilities](features/auth-access-rbac.md) | instatic + pbos | partial | `auth-hardening` (new) on top of `convex-auth`+`rbac-roles` | enhance | M |
| [Content model (pages/posts/portfolio/…)](features/content-model.md) | instatic + pbos | partial | reuse `pages-cms`+`blog-section`+`portfolio-section`+`landing-sections`+`services`+`library` | reuse | S |
| [Audit log](features/audit-log.md) | instatic + pbos | covered | `audit-log` (enhance: real `_schema.ts`+mutation) | enhance | S |

See [ULTRAPLAN.md](ULTRAPLAN.md) for the build roadmap, dependency graph, and waves.
