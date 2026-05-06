# Studio Feature — Progress Tracker

> **Auto-updated** — reflects current implementation status
> Last updated: 2026-03-14

---

## 🚀 Active Sprint: n8n-Compatible JSON Format

### Goal
Make Studio's Flow JSON seamlessly importable/exportable with [n8n](https://n8n.io/) workflows while keeping a consistent, unified schema across both UI layouts and automation flows.

---

## ✅ Phase 1 — Foundation (Complete)

| Task | Status | File(s) |
|------|--------|---------|
| UI Schema v0.4 (54+ widgets) | ✅ Done | `ui/types/index.ts`, `ui/hooks/useSchema.ts` |
| Workflow FlowDefinition + 26+ nodes | ✅ Done | `../../../shared/builder/flows/types.ts`, `workflow/nodes/registry.ts` |
| Node manifest PropsConfig pattern | ✅ Done | `workflow/nodes/types.ts` |
| Canvas group/focus mode | ✅ Done | `ui/slices/canvas/components/GroupNode.tsx` |
| Inspector style pass-through | ✅ Done | `ui/slices/renderer/components/Renderer.tsx` |
| Pin node → preview rendering | ✅ Done | `pages/StudioPage.tsx` |
| Docs dialog (react-markdown) | ✅ Done | `components/StudioDocsDialog.tsx` |
| Project settings localStorage | ✅ Done | `views/StudioLeftPanel.tsx` |
| Save as Template | ✅ Done | `views/StudioLeftPanel.tsx` |
| Studio docs/ folder | ✅ Done | `docs/` (this folder) |

---

## 🔄 Phase 2 — n8n JSON Compatibility (In Progress)

| Task | Status | File(s) |
|------|--------|---------|
| Studio Unified JSON schema v1.0 types | ✅ Done | `workflow/schema/studio-unified.types.ts` |
| n8n workflow JSON types | ✅ Done | `workflow/schema/n8n.types.ts` |
| Studio ↔ n8n converter | ✅ Done | `workflow/schema/n8n-converter.ts` |
| UI JSON schema v0.5 with metadata | ✅ Done | `ui/types/index.ts` (updated) |
| Update FlowDefinition for unified format | ✅ Done | `../../../shared/builder/flows/types.ts` |
| NodeManifest n8n fields | ✅ Done | `workflow/nodes/types.ts` |
| Export/import n8n format in UI | 🔄 In Progress | `pages/StudioPage.tsx`, `hooks/useAutomationExecution.ts` |
| Update public docs with both formats | 🔄 In Progress | `../../../../public/docs/studio-json-template.md` |

---

## 📋 Phase 3 — Planned

| Task | Priority | Notes |
|------|----------|-------|
| Zod runtime validation for imported JSON | 🔴 High | Validate both Studio + n8n imports |
| Credentials manager (stored secrets) | 🔴 High | Reference creds by ID, not inline secrets |
| Batch/split node | 🟡 Medium | n8n-style `splitInBatches` equivalent |
| Sub-workflow node | 🟡 Medium | Call another Studio workflow by ID |
| n8n import direct from n8n export URL | 🟡 Medium | Paste n8n workflow JSON → auto-convert |
| Expression language `{{ $node.id.json.field }}` | 🟡 Medium | Standardize expression syntax |
| Execution logs → Convex persistence | 🟡 Medium | Store run history in DB |
| Webhook registration (real server-side) | 🔴 High | Actually register webhook in Convex |
| Schedule trigger (real cron) | 🔴 High | Use Convex scheduled functions |

---

## 📁 Docs Index

| File | Description |
|------|-------------|
| `PROGRESS.md` | This file — implementation status |
| `flow-json-schema.md` | Studio Unified JSON v1.0 reference (flow + UI) |
| `n8n-compatibility.md` | n8n mapping table + import/export guide |
| `node-manifest.md` | How to write node manifests |

---

## 🗂️ Key File Map

```
frontend/slices/studio/
├── docs/                          ← YOU ARE HERE
│   ├── PROGRESS.md
│   ├── flow-json-schema.md
│   ├── n8n-compatibility.md
│   └── node-manifest.md
├── workflow/
│   ├── schema/                    ← NEW
│   │   ├── studio-unified.types.ts   # Studio JSON v1.0 schema
│   │   ├── n8n.types.ts              # n8n workflow JSON schema
│   │   └── n8n-converter.ts          # Bidirectional converter
│   ├── nodes/
│   │   ├── types.ts               # NodeManifest + n8n fields added
│   │   └── registry.ts            # 26+ manifests
│   └── templates/                 # Pre-built workflow templates
├── ui/
│   ├── types/index.ts             # UI Schema v0.5 (with metadata)
│   └── hooks/useSchema.ts         # Schema conversion
└── pages/StudioPage.tsx           # n8n export/import UI wiring
```
