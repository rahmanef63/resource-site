# Document Checklist

Job-search document tracker with country-scoped seed templates and per-user
completion state. Ships an Indonesian default checklist (KTP, NPWP, SKCK,
paspor, IELTS, etc.).

## What you get

- `<DocumentChecklist>` — top-level page with local/international tabs.
- `<CountryTemplateCard>` — per-country master list picker + import dialog.
- `useChecklistData(bindings, opts)` — derives view-model from the Convex row.
- Convex schema: `document_checklist_items` (user-scoped) +
  `document_checklist_templates` (country-keyed master lists).
- Default Indonesian seed list — `data/indonesianData.ts`.

## Install

```bash
npx rahman-resources add document-checklist
```

Then in your consumer wire Convex into the slice:

```tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  DocumentChecklist,
  CountryTemplateCard,
  type ChecklistBindings,
  type CountryTemplateBindings,
} from "@/features/document-checklist";

export default function Page() {
  // Checklist bindings — user-scoped CRUD.
  const current = useQuery(
    api.features["document-checklist"].queries.getUserChecklist,
    {},
  );
  const seed = useMutation(
    api.features["document-checklist"].mutations.seed,
  );
  const updateStatus = useMutation(
    api.features["document-checklist"].mutations.updateStatus,
  );

  const checklistBindings: ChecklistBindings = {
    current,
    seed,
    updateStatus,
  };

  // Country template bindings.
  const templates = useQuery(
    api.features["document-checklist"].queries.listTemplates,
    {},
  );
  const instantiate = useMutation(
    api.features["document-checklist"].mutations.instantiateFromTemplate,
  );

  const countryBindings: CountryTemplateBindings = {
    templates,
    getTemplate: (country) =>
      useQuery(
        api.features["document-checklist"].queries.getTemplateByCountry,
        country ? { country } : "skip",
      ),
    instantiate,
  };

  return (
    <DocumentChecklist
      bindings={checklistBindings}
      countryTemplateSlot={<CountryTemplateCard bindings={countryBindings} />}
    />
  );
}
```

## Convex backend

Tables (prefix `document_checklist_`):

- `document_checklist_items` — `{ userId, type, country?, documents[], progress }`
  with `by_user` index.
- `document_checklist_templates` — `{ country, countryLabel, flag?, documents[], isSystem }`
  with `by_country` index.

Auth model — **user-scoped** via `requireUser(ctx)` from
`convex/_shared/auth.ts`. There is no `workspaceId` column; one row per
authenticated user. (See "Workspace migration" below if your project
requires multi-tenant isolation.)

Public functions:

- `queries.getUserChecklist` — current user's row (null if not seeded).
- `queries.listTemplates` — list summarised country templates.
- `queries.getTemplateByCountry` — full template payload.
- `mutations.seed` — first-time seed of personal row.
- `mutations.updateStatus` — toggle completed/notes/expiry on one item.
- `mutations.reset` — wipe the user's row.
- `mutations.instantiateFromTemplate` — import a country template.

## Workspace migration

This slice ships **user-scoped**. To upgrade to workspace-scoped:

1. Add `workspaceId: v.id("workspaces")` to both tables.
2. Replace `by_user` index with `by_workspace`.
3. Swap `requireUser` for your project's `requirePermission(ctx, workspaceId, "document-checklist.<action>")` helper.
4. Pass `workspaceId` through every query/mutation arg.

The kitab does not yet ship a stock `requirePermission` helper —
consumers that need multi-tenancy carry their own (e.g. superspace
forks).

## Replacing the default seed

Override the data file or use `bindings.seed` directly with your own
list. The `data/indonesianData.ts` shape is `Omit<ChecklistItem, "completed">[]`.

## Provenance

Harvested from CareerPack (rahmanef63/CareerPack — `frontend/src/slices/document-checklist/`
+ `convex/documents/`) 2026-05-15. Sanitization log lives in the PR
that introduced this slice.
