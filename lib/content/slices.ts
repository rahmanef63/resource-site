// Tier-3 slice registry — single source of truth.
//
// Was duplicated by the deprecated lib/content/features.ts (same 8 concepts,
// drifted slugs). Consolidated 2026-05-09: features.ts deleted, slices.ts
// now carries the rich docsUrl/install/exampleCode/usedBy fields too.
//
// Consumed by: npm tarball manifest, /slices catalog page, Bundle Builder UI,
// MCP `rr_list_slices`/`rr_get_slice`, sidebar Slices group.

import type { SliceCategory } from "@/lib/shared/features/defineFeature";
import type { PreviewView } from "@/lib/preview-presets";

export type SlicePeer = { slug: string; range: string; reason?: string };
export type SliceEnvVar = {
  name: string;
  scope: "convex" | "next-public" | "server";
  required?: boolean;
  description?: string;
};

/**
 * Slice shape — what the slice ships at a glance.
 *
 *   "ui"        — pure frontend; no Convex tables/actions. Pop in & style.
 *                 Lives under frontend/slices/* but `convexPaths` is empty.
 *                 Examples: motion primitives, command palette, layout shell.
 *   "backend"   — pure Convex (schema + queries/actions). No UI shipped.
 *                 Lives under convex/features/*. `slicePath` may be empty.
 *                 Examples: vector-search index helper, ai-router proxy.
 *   "full"      — both frontend + Convex, full vertical feature.
 *                 Examples: doku-payment, midtrans-payment.
 *
 * Builder UI filters by kind so users picking "just a UI primitive" don't
 * see env-var requirements for backend-coupled slices.
 */
export type SliceKind = "ui" | "backend" | "full";

/**
 * M5-BP — public taxonomy fields. All optional + additive (no
 * breaking change). Surfaces of consumption decide which to use:
 *
 *   resourceType — visual shape of the unit (primitive vs block vs
 *                  module). Site filter chips read this to group
 *                  /slices into "UI Primitives", "Blocks", "Modules".
 *   domain      — business domain the slice belongs to. Replaces the
 *                 less-specific `category` for ops-flavored grouping
 *                 (auth/cms/crm/payments/admin/…).
 *   maturity    — readiness signal for the builder UI. Hides
 *                 "draft" from default catalog; flags "beta" in cards.
 *
 * Backfilling existing slices is a separate wave — only tag entries
 * that are clearly classified to start.
 */
export type ResourceType = "primitive" | "component" | "block" | "module";
export type Domain =
  | "auth" | "rbac" | "cms" | "crm" | "commerce" | "payments"
  | "ai" | "data" | "search" | "messaging" | "admin" | "infra";
export type Maturity =
  | "stable"        // production-ready, default (available)
  | "beta"          // feature-complete, polishing
  | "wip"           // in-develop — visible but flagged not-ready
  | "draft"         // hidden from default catalog (truly unfinished)
  | "experimental"  // research preview, may break
  | "deprecated";   // scheduled for removal

/** Compat status per (template × slice) or (slice × slice) pairing. */
export type CompatStatus = "native" | "recommended" | "warn" | "incompatible";
export type SliceCompatEntry = { status: CompatStatus; note?: string };

/**
 * Compat declared per slice. Moved here from `lib/build/compat.ts` matrix
 * (Phase 4 of REFACTOR-PLAN.md, 2026-05-12). Single source of truth.
 *
 *   templates  — per-template compatibility. Missing = silent compatible.
 *   conflicts  — slices this one is MUTUALLY EXCLUSIVE with.
 *   enhances   — slices this one pairs well with (informational).
 */
export type SliceCompat = {
  templates?: Record<string, SliceCompatEntry>;
  conflicts?: string[];
  enhances?: string[];
};

export type SliceEntry = {
  slug: string;
  title: string;
  category: SliceCategory;
  /** Default "full" so old entries without `kind` keep working — but every
   *  new entry SHOULD set this explicitly. */
  kind?: SliceKind;
  version: string;
  /** CH-wave (2026-05-21) — short hook for catalog cards (≤ ~140 chars,
   *  ~1 sentence). When set, the catalog card renders this instead of
   *  the verbose `description`. Detail page always shows the full
   *  `description`. Leave undefined to fall back to description. */
  tagline?: string;
  description: string;
  source: string;
  slicePath: string;
  convexPaths: string[];
  npm?: string[];
  shadcn?: string[];
  env?: SliceEnvVar[];
  peers?: SlicePeer[];
  providers?: string[];
  tags?: string[];
  /** Upstream docs (vendor or platform). */
  docsUrl?: string;
  /** Plain copy-paste install line — kept for the catalog page snippet. */
  install?: string;
  /** Inline example code shown on the slice detail page. */
  exampleCode?: string;
  /** Templates that ship with this slice pre-wired. */
  usedBy?: string[];
  /** Brief recipe for an AI agent installing the slice manually. */
  agentRecipe?: string;
  /** Copy-paste wiring/usage snippet shown in the Code tab (not the live
   *  preview — keeps the public preview to the demo itself). */
  wiring?: string;
  /** Named variants of the slice, listed in the Code tab. */
  variants?: { title: string; desc: string }[];
  /** Live preview route, e.g. "/preview/slices/full-width-toggle". When set,
   *  the slice detail page renders a PreviewFrame iframing this URL. */
  previewPath?: string;
  /** Optional second preview surface — admin/operator side of a full slice.
   *  When set together with `previewPath`, slice detail page shows a
   *  Public / Admin tab pair like the website-template detail page. */
  adminPreviewPath?: string;
  /** When both preview paths exist, which surface opens first. Defaults to "public". */
  defaultSurface?: "public" | "admin";
  /** Initial preview viewport on the detail page. Defaults to desktop.
   *  Pick "mobile" for mobile-first UIs (e.g. comments thread, forms). */
  defaultView?: PreviewView;
  /** Initial preview zoom (1.0 = real size). Override when the slice
   *  is dense and benefits from being scaled down inside the iframe. */
  defaultZoom?: number;
  /** Compatibility: per-template status + slice peer/conflict declarations.
   *  Was hand-curated in lib/build/compat.ts pre-Phase-4. */
  compat?: SliceCompat;
  /** M5-BP — visual shape (primitive/component/block/module). Drives
   *  /slices filter chips. Optional; omit means "uncategorized yet". */
  resourceType?: ResourceType;
  /** M5-BP — business domain (auth/cms/crm/…). More specific than
   *  `category`. Optional; omit means "no domain mapping yet". */
  domain?: Domain;
  /** M5-BP — readiness signal. Omit = `"stable"` default. */
  maturity?: Maturity;
};

export const slices: SliceEntry[] = [
  {
    slug: "ai-core",
    title: "AI Core Kit",
    category: "ui",
    kind: "ui",
    version: "0.2.0",
    tagline: "No-shadcn dialog + error + theme substrate for the ai-* cluster.",
    description:
      "Shared UI + helper substrate for the ai-* slice cluster (lifted from models-rahmanef-com). Ships the ResponsiveDialog/ConfirmDialog overlay primitive (+ useConfirm), SectionErrorBoundary, a light/dark useTheme hook, fmt/ago/dt formatters, and a provider-agnostic ConvexError renderer (errData/ErrorLine/FRIENDLY). React-only, no Convex, no shadcn — the lightweight no-shadcn dialog variant. Foundation the byok/workspaces/memory/combos/scheduled-agents/channels slices import via @/features/ai-core.",
    source: "models-rahmanef-com",
    slicePath: "frontend/slices/ai-core",
    convexPaths: [],
    npm: ["lucide-react"],
    tags: ["ui", "dialog", "theme", "error-state", "no-shadcn", "ai"],
    resourceType: "primitive",
    domain: "ai",
    maturity: "beta",
  },
  {
    slug: "image-editor",
    title: "Image Editor — layered raster editor",
    category: "os",
    kind: "ui",
    version: "2.1.1",
    tagline: "Layered raster editor: layers, transform, paint, filters, layer styles, 1-click background removal, AI command registry, export.",
    description:
      "A Photoshop-style raster image editor built on Konva. Layers panel (reorder, opacity, visibility, lock, 16 blend modes), free transform (move/scale/rotate/flip via a Transformer), image + text + shape + paint layers, brush & eraser with size/opacity/hardness, non-destructive adjustments + filters, canvas resize/aspect presets, and LAYER STYLES: stroke, drop shadow, outer glow, clipping mask. One-click BACKGROUND REMOVAL runs fully in-browser via @imgly/background-removal (free, no API key — downloads a small ONNX model on first use). Undo/redo, zoom/pan, shortcuts, PNG/JPG/WebP export. v2 adds an AI FUNCTION-CALLING layer: every editor operation is a named, schema'd command (EDITOR_COMMANDS registry + useEditorCommands binding) driven by an in-editor chat; the streaming bridge is injectable via configureAgentStream(fn) and everything except the chat works without it. A headless server barrel (server.ts) runs commands against documents with no DOM. Image I/O via props (initialImage / onSave).",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/image-editor",
    convexPaths: [],
    npm: ["lucide-react", "konva", "react-konva", "@imgly/background-removal", "class-variance-authority", "radix-ui"],
    shadcn: ["button", "input", "label", "separator", "select", "scroll-area", "switch", "dropdown-menu", "tooltip", "resizable", "popover"],
    env: [],
    peers: [],
    tags: ["image-editor", "photoshop", "canvas", "konva", "layers", "filters", "background-removal", "paint", "ai", "ui"],
    resourceType: "module",
    maturity: "beta",
    compat: { enhances: ["appshell", "file-explorer"] },
    previewPath: "/preview/slices/image-editor",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui + Konva. A layered raster image editor. Image I/O is via props; background removal runs in-browser (no backend).

STEP 1 — Install. \`npx rr add image-editor\`. Ensure \`@/features/image-editor\` resolves in tsconfig paths and Tailwind scans the slice folder.

STEP 2 — Deps. npm: \`konva react-konva @imgly/background-removal lucide-react\`. shadcn: \`npx shadcn@latest add button input slider select tabs scroll-area separator tooltip label switch popover\`.

STEP 3 — Mount. It is fully self-contained; the Konva stage is loaded client-only (next/dynamic ssr:false) inside the slice, so just render it in a height-bearing box:
\`\`\`tsx
"use client";
import { ImageEditor } from "@/features/image-editor";
export default function Page() {
  return (
    <div className="h-dvh">
      <ImageEditor onSave={(dataUrl) => console.log(dataUrl)} />
    </div>
  );
}
\`\`\`
Props: \`initialImage?\` (data/object/remote URL opened on mount), \`width?\`/\`height?\` (blank canvas size, default 1080²), \`onSave?(dataUrl)\` (fires from the Save button with a PNG data URL; omit to hide Save), \`className?\`.

STEP 4 — Background removal. The "Remove BG" button calls removeImageBackground() from @imgly/background-removal — free, in-browser, no key. First run downloads a small model to the browser cache, then runs locally via WASM. You can also import \`removeImageBackground(src) => Promise<pngDataUrl>\` directly.

STEP 5 — Export. PNG/JPG/WebP at 1×/2×/3× via the Export tab, or call \`exportStage(stage, {...})\` / \`stageToDataURL(stage, {...})\`. The container owns the box — render inside h-dvh / h-full.`,
    exampleCode: `"use client";
import { ImageEditor } from "@/features/image-editor";

export default function ImageEditorDemo() {
  // No props → opens a blank 1080×1080 canvas with one paint layer. Brush/erase,
  // add text/shapes, open an image + remove its background (free, in-browser),
  // apply layer styles + filters, then export PNG/JPG/WebP. Konva stage is
  // client-only (loaded via next/dynamic) so SSR never touches canvas/window.
  return (
    <div className="h-dvh w-full">
      <ImageEditor onSave={(dataUrl) => console.log("save", dataUrl.slice(0, 32))} />
    </div>
  );
}`,
  },
  {
    slug: "reel-editor",
    title: "Reel — video timeline editor",
    category: "os",
    kind: "ui",
    version: "1.3.0",
    tagline: "React + Svelte in-browser NLE over one composition/media/render core — timeline, keyframes, AI edits and realtime WebM export.",
    description:
      "Framework-parity in-browser video editor. React/Next remains default with the existing resizable workspace; native Svelte 5/SvelteKit reuses the same immutable composition model, observable undo/redo history, Canvas-2D draw path shared by preview and WebM export, MediaCache/audio graph, keyframes/transitions, AI edit transforms, local draft/settings, filesystem seam and realtime MediaRecorder exporter. The Svelte renderer covers playback, layered timeline, track controls, clip inspector, local/sample/filesystem import, AI commands, keyboard shortcuts, autosave/settings and WebM export without React/Next/Lucide React/shadcn/Sonner/resizable-panels/agent runtime.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/reel-editor",
    convexPaths: [],
    npm: ["lucide-react@^1.16.0", "react-resizable-panels@^4.11.1", "sonner@^2.0.7"],
    shadcn: ["button", "input", "slider", "tooltip", "dialog", "dropdown-menu", "resizable", "sheet", "sonner"],
    env: [],
    peers: [],
    tags: ["video", "video-editor", "timeline", "nle", "keyframes", "transitions", "webm", "canvas", "ui", "svelte", "framework-parity"],
    resourceType: "module",
    maturity: "beta",
    compat: { enhances: ["appshell", "file-explorer", "image-editor"] },
    previewPath: "/preview/slices/reel-editor",
    defaultView: "desktop",
    agentRecipe: `React/default: \`npx rr add reel-editor\`. SvelteKit: \`npx rr add reel-editor --framework sveltekit\`. Both reuse the same composition/history/draw/media/audio/AI/settings/filesystem/export cores. React keeps the resizable shadcn workspace, Sonner, Lucide and automatic tool registration; Svelte installs only svelte@^5 + portable cores and accepts optional registerTools. Wire production file access through configureReelFs({ list, mkdir, rawUrl }); enforce path authorization and signed/media access on that backend. Render/export remains client-side MediaRecorder WebM using the same drawFrame() path as preview.`,
    exampleCode: `"use client";
import { ReelEditor } from "@/features/reel-editor";

export default function VideoEditorDemo() {
  // Opens with a sample composition. Import media via File menu (local picker
  // works with zero backend — object URLs), arrange clips on layered tracks,
  // add text/transitions/keyframes, then Render → realtime WebM with audio.
  return (
    <div className="h-dvh w-full">
      <ReelEditor />
    </div>
  );
}`,
  },
  {
    slug: "media-viewer",
    title: "Preview — media quick-look",
    category: "os",
    kind: "ui",
    version: "1.3.0",
    tagline: "Quick-look viewer for image/video/audio/pdf: zoomable stage, transport players, editor handoff — backend optional.",
    description:
      "A quick-look media viewer in the macOS Preview spirit. Images render on a zoomable (40–300%) checkerboard stage so transparency reads; audio gets a card player with a CSS-bar waveform + transport; video gets play/pause + scrubber + volume; PDFs embed full-bleed and text gets a simple surface. The toolbar carries a type-indicator chip, zoom, Download, Open-in-editor, and prev/next. Two framework-neutral integration seams in lib/host-core.ts make it portable: configureMediaSource maps fs paths to fetchable URLs (identity by default, so public URLs work with zero wiring) and configureMediaOpener routes the Open-in-editor handoff (image → design-studio, video/audio → reel-editor) to your shell — both inert until set. Launched bare it shows a fully offline sample gallery (inline SVG gradients, simulated A/V playback). Pairs with file-explorer (onOpenFile → MediaViewer payload) and the editors.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/media-viewer",
    convexPaths: [],
    npm: ["lucide-react"],
    shadcn: ["button", "badge", "separator", "tooltip", "slider"],
    env: [],
    peers: [],
    tags: ["media", "preview", "viewer", "quick-look", "image", "video", "audio", "pdf", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell", "file-explorer", "image-editor", "reel-editor"] },
    previewPath: "/preview/slices/media-viewer",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. A quick-look media viewer (image/video/audio/pdf/text). Fully client-side; no backend required.

STEP 1 — Install. \`npx rr add media-viewer\`. Ensure \`@/features/media-viewer\` resolves in tsconfig paths and Tailwind scans the slice folder.

STEP 2 — Deps. npm: \`lucide-react\`. shadcn: \`npx shadcn@latest add button badge separator tooltip slider\`.

STEP 3 — Mount. \`<MediaViewer />\` with no payload shows the offline sample gallery. Pass a file to view it:
\`\`\`tsx
"use client";
import { MediaViewer } from "@/features/media-viewer";
export default function Page() {
  return <div className="h-dvh"><MediaViewer payload={{ path: "/media/clip.mp4", name: "clip.mp4", kind: "video" }} /></div>;
}
\`\`\`
Or register the \`mediaViewerApp\` descriptor in an appshell manifest for windowed hosts.

STEP 4 — Remote files (optional). Paths resolve through \`configureMediaSource({ rawUrl })\` — identity by default, so public/absolute URLs already work. Point rawUrl at your fs endpoint for private files.

STEP 5 — Editor handoff (optional). \`configureMediaOpener((appId, title, size, payload) => …)\` routes the "Open in Image/Video Editor" actions to your shell (no-op until set). Wire it to openWindow when running inside appshell with image-editor / reel-editor installed.`,
    exampleCode: `"use client";
import { MediaViewer } from "@/features/media-viewer";

export default function PreviewDemo() {
  // No payload → offline sample gallery (gradient images, simulated A/V).
  // Pass { path, name, kind } to view a real file; wire configureMediaSource
  // when paths need resolving against your own fs API.
  return (
    <div className="h-dvh w-full">
      <MediaViewer />
    </div>
  );
}`,
  },
  {
    slug: "code-editor",
    title: "Code — overlay syntax editor",
    category: "os",
    kind: "ui",
    version: "1.3.0",
    tagline: "Framework-parity code editor over one observable editor/filesystem core.",
    description:
      "Framework-parity lightweight code editor over one observable editor/filesystem core. React/Next remains default with appshell inspector + automatic tool registration; native Svelte 5/SvelteKit adds explorer, tabs, overlay syntax editing, create/save, status, payload-open handoff, and optional host tool registration over the exact same CodeFsAdapter, writable mock FS, buffers, dirty/save state, highlighter, and tool semantics. Writes stay best-effort — read-only hosts keep the local buffer and surface the failed remote save.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/code-editor",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "badge", "input", "textarea", "scroll-area", "sheet", "dialog"],
    env: [],
    peers: [],
    tags: ["code", "editor", "syntax-highlight", "ide", "tabs", "file-tree", "ui", "svelte", "framework-parity"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell", "file-explorer", "media-viewer"] },
    previewPath: "/preview/slices/code-editor",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. A lightweight overlay-highlighting code editor with a lazy explorer tree. Fully client-side; no backend required.

STEP 1 — Install React/default with \`npx rr add code-editor\`, or native Svelte 5 with \`npx rr add code-editor --framework sveltekit\`. Both reuse one editor/filesystem core.

STEP 2 — Deps. npm: \`lucide-react\`. shadcn: \`npx shadcn@latest add button badge input scroll-area sheet dialog\`.

STEP 3 — Mount. \`<CodeEditor />\` opens the seeded sample tree (writable in-memory mock). Open a specific file with a payload:
\`\`\`tsx
"use client";
import { CodeEditor } from "@/features/code-editor";
export default function Page() {
  return <div className="h-dvh"><CodeEditor payload={{ path: "/Projects/hello.ts" }} /></div>;
}
\`\`\`
Or register the \`codeEditorApp\` descriptor in an appshell manifest for windowed hosts.

STEP 4 — Real filesystem (optional). \`configureCodeFs({ list, read, write, mkdir })\` — list returns { path, entries: [{ name, kind }] } for ONE directory (the tree fetches per expand), read returns the file body, write/mkdir mutate. Writes are best-effort: on failure the editor keeps the local buffer and flags the status bar.

STEP 5 — Cross-app open. From a file manager (e.g. the file-explorer slice), wire onOpenFile to re-render CodeEditor with payload={{ path }} — the editor adds a tab and hydrates the buffer.`,
    exampleCode: `"use client";
import { CodeEditor } from "@/features/code-editor";

export default function CodeDemo() {
  // No payload → seeded sample tree on the writable in-memory mock fs.
  // Explorer lazy-lists each directory on expand; + buttons create
  // files/folders; Cmd/Ctrl+S saves. Wire configureCodeFs for a real backend.
  return (
    <div className="h-dvh w-full">
      <CodeEditor />
    </div>
  );
}`,
  },
  {
    slug: "system-monitor",
    title: "System Monitor — host telemetry dashboard",
    category: "os",
    kind: "ui",
    version: "1.3.0",
    tagline: "Activity-Monitor-style dashboard: CPU/RAM/disk/GPU gauges, sparklines, live process table — telemetry injected.",
    description:
      "Activity-Monitor-style host telemetry dashboard with React/Next as the default distribution and native Svelte 5/SvelteKit gauges, sparklines, and responsive process UI over one injected telemetry adapter + rolling history core. Polling stays at 1.5s with ~40 CPU/network points; zero-backend mock and host live adapter remain supported.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/system-monitor",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["scroll-area"],
    env: [],
    peers: [],
    tags: ["monitoring", "telemetry", "dashboard", "gauges", "sparkline", "processes", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/system-monitor",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. Host telemetry dashboard. Fully client-side; no backend required.

STEP 1 — Install. \`npx rr add system-monitor\`. Ensure \`@/features/system-monitor\` resolves and Tailwind scans the slice folder.

STEP 2 — Deps. npm: \`lucide-react\`. shadcn: \`npx shadcn@latest add scroll-area\`.

STEP 3 — Mount. \`<SystemMonitor />\` in a height-bearing box — unwired it runs a wavy in-browser telemetry mock. Or register \`systemMonitorApp\` in an appshell manifest.

STEP 4 — Real telemetry. \`configureSysmon({ mode:"live", stats, processes })\` — stats returns { cpu:{pct,cores}, mem:{used,total}, disk:{used,total}, net?:{rx,tx}, uptime }; processes returns [{ pid, name, status, cpu, mem }].`,
    exampleCode: `"use client";
import { SystemMonitor } from "@/features/system-monitor";

export default function MonitorDemo() {
  // Unwired -> wavy mock telemetry; configureSysmon for a real host.
  return <div className="h-dvh w-full"><SystemMonitor /></div>;
}`,
  },
  {
    slug: "booking",
    title: "Booking — session request form + owner inbox",
    category: "os",
    kind: "ui",
    version: "1.1.0",
    tagline: "Public 'book a session' form + the owner's triage inbox in one app — backend injected.",
    description:
      "One app that is BOTH a public 'book a session' request form AND the owner's triage inbox — it flips to show the inbox when the viewer can manage. Visitors submit name/email/topic (+ optional preferred time / note); the owner sees pending requests with Confirm / Decline. The backend is INJECTED via a small BookingAdapter (submit/list/setStatus/canManage): point configureBooking at your store, or keep the bundled in-memory mock so it renders fully interactive — form + inbox — with zero backend.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/booking",
    convexPaths: [],
    npm: ["lucide-react"],
    shadcn: ["button", "input", "textarea", "scroll-area"],
    env: [],
    peers: [],
    tags: ["booking", "contact", "form", "inbox", "lead", "scheduling", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/booking",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. A booking request form + owner inbox. Fully client-side; backend optional.

STEP 1 — Install. \`npx rr add booking\`. Ensure \`@/features/booking\` resolves and Tailwind scans the slice folder.

STEP 2 — Deps. npm: \`lucide-react\`. shadcn: \`npx shadcn@latest add button input textarea scroll-area\`.

STEP 3 — Mount. \`<Booking />\` in a height-bearing box — unwired it runs on an in-memory mock store (form + inbox both live). Or register \`bookingApp\` in an appshell manifest.

STEP 4 — Real backend. \`configureBooking({ mode:"live", submit, list, setStatus, canManage })\` — submit takes { name, email, topic, preferredTime?, note? }; list returns rows with { id, status, createdAt }; omit list/canManage for a write-only public form.`,
    exampleCode: `"use client";
import { Booking } from "@/features/booking";

export default function BookingDemo() {
  // Unwired -> in-memory mock; configureBooking for a real backend.
  return <div className="h-dvh w-full"><Booking /></div>;
}`,
  },
  {
    slug: "html-studio",
    title: "HTML Studio — sandboxed HTML/CSS/JS editor with live preview",
    category: "os",
    kind: "ui",
    version: "1.1.1",
    tagline: "Write HTML/CSS/JS, see it render live in a sandboxed iframe (opaque origin), Save to a shareable link — backend injected.",
    description:
      "Sandboxed HTML/CSS/JS studio with one framework-neutral document store, mock/live HtmlStudioAdapter, device/view helpers, starter document, share helpers, and exact opaque-origin iframe sandbox contract. React/Next remains the default Lucide + shadcn renderer; Svelte 5/SvelteKit gets native Code/Split/Preview, responsive/tablet/phone preview, 250ms live srcdoc, Save/open/delete list, public/private visibility, copy-link and payload-slug flows over the same core.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/html-studio",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "input", "textarea", "scroll-area"],
    env: [],
    peers: [],
    tags: ["html", "editor", "sandbox", "iframe", "preview", "playground", "code", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/html-studio",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. A sandboxed HTML/CSS/JS studio: editor + live iframe preview + saved pages. Fully client-side; backend optional.

STEP 1 — Install. \`npx rr add html-studio\`. Ensure \`@/features/html-studio\` resolves and Tailwind scans the slice folder.

STEP 2 — React deps. npm: \`lucide-react@^0.400.0\`. shadcn: \`npx shadcn@latest add button input textarea scroll-area\`. SvelteKit: \`npx rr add html-studio --framework sveltekit\` installs only \`svelte@^5\` + the shared portable core.

STEP 3 — Mount. \`<HtmlStudio />\` in a height-bearing box — unwired it runs on an in-memory mock (editor + live sandboxed preview + saved list all live). Pass \`payload={{ slug }}\` to open a page, or register \`htmlStudioApp\` in an appshell manifest.

STEP 4 — Real backend. \`configureHtmlStudio({ mode:"live", save, load, list, remove })\` — save takes { slug?, title, html, visibility } and returns { slug }; load(slug) -> SavedPage | null; omit save for a read-only sandbox or list to hide the saved rail. React and Svelte share the exact \`HTML_SANDBOX\`; KEEP it without allow-same-origin so arbitrary srcdoc stays in an opaque origin.`,
    exampleCode: `"use client";
import { HtmlStudio } from "@/features/html-studio";

export default function HtmlStudioDemo() {
  // Unwired -> in-memory mock; configureHtmlStudio for a real backend.
  return <div className="h-dvh w-full"><HtmlStudio /></div>;
}`,
  },
  {
    slug: "resources-launcher-admin",
    title: "Resources Admin — curated icon-launcher CRUD",
    category: "os",
    kind: "ui",
    version: "1.1.1",
    tagline: "Owner-gated CRUD for a curated icon-launcher — add/edit/remove/reorder links that open in a new tab, backend injected.",
    description:
      "Owner-gated curated launcher CRUD over one framework-neutral ResourcesAdapter/core. React/Next remains the default Lucide + shadcn surface; Svelte 5/SvelteKit gets native add/edit/remove/reorder UI over the same mock/live adapter, resource model, icon-name catalog, normalization, sorting, and permission state. Backend wiring stays injected through configureResources (list/upsert/remove/canManage).",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/resources-launcher-admin",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "input", "label", "scroll-area", "native-select"],
    env: [],
    peers: [],
    tags: ["launcher", "links", "bookmarks", "admin", "crud", "icons", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/resources-launcher-admin",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. A curated icon-launcher admin (CRUD + reorder). Fully client-side; backend optional.

STEP 1 — Install. \`npx rr add resources-launcher-admin\`. Ensure \`@/features/resources-launcher-admin\` resolves and Tailwind scans the slice folder.

STEP 2 — React deps. npm: \`lucide-react@^0.400.0\`. shadcn: \`npx shadcn@latest add button input label scroll-area native-select\`. SvelteKit: \`npx rr add resources-launcher-admin --framework sveltekit\` installs only \`svelte@^5\` + the shared portable core.

STEP 3 — Mount. \`<ResourcesAdmin />\` in a height-bearing box — unwired it runs on an in-memory mock store (add / edit / remove / reorder all live). Or register \`resourcesAdminApp\` in an appshell manifest.

STEP 4 — Real backend. \`configureResources({ mode:"live", list, upsert, remove, canManage })\` — list returns rows { id, label, icon, url, group, order }; upsert takes the same minus id to insert (pass id to patch); canManage gates the editor + reorder. Icons are lucide NAME strings resolved via resolveIcon.`,
    exampleCode: `"use client";
import { ResourcesAdmin } from "@/features/resources-launcher-admin";

export default function ResourcesAdminDemo() {
  // Unwired -> in-memory mock; configureResources for a real backend.
  return <div className="h-dvh w-full"><ResourcesAdmin /></div>;
}`,
  },
  {
    slug: "profile",
    title: "Profile — CV + identity card",
    category: "os",
    kind: "ui",
    version: "1.1.0",
    tagline: "One owner's identity in two renderings — a formal one-column CV (resume) and a compact avatar + links + FAQ card (card).",
    description:
      "One owner identity in two renderings over one framework-neutral configured-data seam. React/Next remains the default with printable Resume + AboutProfile/appshelly descriptors; Svelte 5/SvelteKit adds native resume/card surfaces over the exact same ResumeProfile/AboutProfile models, placeholder data, configure/read seams, initials, links, FAQ, and Print/PDF behavior.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/profile",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "scroll-area", "avatar"],
    env: [],
    peers: [],
    variants: [
      { title: "resume", desc: "npx rr add profile resume — one-column printable CV (Resume + configureResume)." },
      { title: "card", desc: "npx rr add profile card — compact avatar + links + FAQ identity card (AboutProfile + configureAbout)." },
    ],
    tags: ["resume", "cv", "profile", "portfolio", "about", "identity", "bio", "card", "links", "faq", "print", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/profile",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. Two identity renderers driven by injected data. Fully client-side; no backend required.

STEP 1 — Install. \`npx rr add profile\` for both, or \`npx rr add profile resume\` / \`card\` for one. Ensure \`@/features/profile\` resolves and Tailwind scans the slice folder.

STEP 2 — Deps. npm: \`lucide-react\`. shadcn: \`npx shadcn@latest add button scroll-area avatar\`.

STEP 3 — Mount. \`<Resume />\` (CV) or \`<AboutProfile />\` (card) in a height-bearing box — unwired each renders a generic placeholder. Or register \`resumeApp\` / \`aboutProfileApp\` in an appshell manifest.

STEP 4 — Real data. \`configureResume(profile)\` with a ResumeProfile { name, roles[], location, summary, contacts[], skills[], experience[], projects[] }, and/or \`configureAbout(card)\` with { name, roles[], description, links[], faq[] }, once at boot from Convex / a CMS / a JSON file. Resume's "Print / PDF" button calls window.print() against a print-friendly layout.`,
    exampleCode: `"use client";
import { Resume, AboutProfile } from "@/features/profile";

export default function ProfileDemo() {
  // Unwired -> generic placeholders; configureResume(cv) / configureAbout(card) for real data.
  return (
    <div className="grid h-dvh grid-cols-2 gap-4">
      <Resume />
      <AboutProfile />
    </div>
  );
}`,
  },
  {
    slug: "start-here",
    title: "Start Here — guided OS onboarding tour",
    category: "os",
    kind: "ui",
    version: "1.0.0",
    tagline: "Lays the OS out as a guided path of stages — reads the LIVE app catalog (drift-proof), every tile opens the real app.",
    description:
      "A guided 'Start Here' tour that lays the OS out as a path of stages, each stage opening real apps from the LIVE registry — drift-proof, it reads the injected app catalog instead of a hardcoded list, so adding an app surfaces it automatically (in a stage if listed, else a final 'Everything else' bucket). The catalog, the open(id) callback, and the stage journey are INJECTED via a small StartHereAdapter (apps / open / stages): point configureStartHere at your live app registry + window opener, or keep the bundled in-memory mock (a few generic apps + 3 stages) so the welcome tour renders fully alive with zero host.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/start-here",
    convexPaths: [],
    npm: ["lucide-react"],
    shadcn: ["button", "scroll-area"],
    env: [],
    peers: [],
    tags: ["onboarding", "tour", "welcome", "launcher", "guide", "os", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/start-here",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. A guided onboarding tour that renders your live app catalog as a path of stages. Fully client-side; the catalog is injected.

STEP 1 — Install. \`npx rr add start-here\`. Ensure \`@/features/start-here\` resolves and Tailwind scans the slice folder.

STEP 2 — Deps. npm: \`lucide-react\`. shadcn: \`npx shadcn@latest add button scroll-area\`.

STEP 3 — Mount. \`<StartHere />\` in a height-bearing box — unwired it reads an in-memory mock catalog (generic apps + 3 stages) so the tour is fully alive. Or register \`startHereApp\` in an appshell manifest.

STEP 4 — Real catalog. \`configureStartHere({ mode:"live", apps, open, stages })\` — apps is your live registry as [{ id, title, icon, description? }]; open(id) launches the real app/window; stages is [{ title, blurb, appIds }] (apps not placed fall into a final "Everything else" stage). Drift-proof: read the registry, never hardcode the list.`,
    exampleCode: `"use client";
import { StartHere } from "@/features/start-here";

export default function StartHereDemo() {
  // Unwired -> in-memory mock catalog; configureStartHere for the live registry.
  return <div className="h-dvh w-full"><StartHere /></div>;
}`,
  },
  {
    slug: "os-terminal",
    title: "Terminal — shell emulator with live passthrough + PTY seam",
    category: "os",
    kind: "ui",
    version: "1.3.1",
    tagline: "Native React + Svelte terminal: mock shell, live exec adapter, and host-injected interactive PTY.",
    description:
      "Framework-parity terminal shell: React/Next remains default and explicit SvelteKit gets native Svelte 5 exec + PTY UI over the same command dispatcher, mock filesystem, live TerminalOsApi, SSE PTY transport, and agentic tools. Mock mode needs zero backend; configureTerminal enables real fs/exec/sys and configurePty injects an interactive transport + VT renderer. Both host-wiring seams are observable after mount.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/os-terminal",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["terminal", "shell", "cli", "emulator", "exec", "pty", "svelte", "framework-parity", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell", "file-explorer"] },
    previewPath: "/preview/slices/os-terminal",
    defaultView: "desktop",
    agentRecipe: `Run \`npx rr add os-terminal\` for React/default or \`npx rr add os-terminal --framework sveltekit\` for native Svelte 5. Mount <Terminal /> in a height-bearing box; mock mode is zero-backend. Wire configureTerminal({ mode:"live", fs, exec, sys }) for real host truth. Optionally configurePty({ transport, screen }) for an interactive shell; createSsePtyTransport() ships the os-vps SSE transport shape while the host owns the VT renderer. React-only osTerminalApp remains a convenience descriptor and is not invented for Svelte.`,
    exampleCode: `"use client";
import { Terminal } from "@/features/os-terminal";

export default function TerminalDemo() {
  // Mock mode: 17 built-ins over an in-memory fs. configureTerminal to go live.
  return <div className="h-96 w-full"><Terminal /></div>;
}`,
  },
  {
    slug: "assistant",
    title: "Assistant — agent workspace with streaming chat",
    category: "os",
    kind: "ui",
    version: "1.2.0",
    tagline: "React + Svelte agent workspace with shared streaming/tool loop, local agents/skills/automations, and BYOK model injection.",
    description:
      "Framework-parity agent workspace with streaming chat, tool-calling, and a local library of agents, skills, and ordered automations. React/Next remains default; native Svelte 5/SvelteKit reuses the same observable localStorage store, preset data, persona/history builder, demo stream fallback, global tool registry, shared runAgentLoop function-calling core, static/live tool catalog, and automation semantics. No backend or model key is bundled: configureAgentStream injects the consumer model bridge. Svelte carries no React/Next/shadcn/use-agent-tools runtime.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/assistant",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "input", "textarea", "tabs", "badge", "scroll-area", "dropdown-menu", "dialog", "select", "switch"],
    env: [],
    peers: [],
    tags: ["ai", "assistant", "chat", "agents", "streaming", "automations", "tool-calling", "ui", "svelte", "framework-parity"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell", "ai-workspace"] },
    previewPath: "/preview/slices/assistant",
    defaultView: "desktop",
    agentRecipe: `React/default: run \`npx rr add assistant\`; SvelteKit: append \`--framework sveltekit\`. Mount <Assistant/> in a height-bearing container. Agents, skills and automations persist in localStorage through one shared observable store. Unwired chat uses a typing demo stream. Wire one real backend with configureAgentStream(fn); the same shared runAgentLoop drives every registered slice ToolCollection through registerAssistantTools. The Svelte distribution installs only non-React agentic core files and @lucide/svelte.`,
    exampleCode: `"use client";
import { Assistant } from "@/features/assistant";

export default function AssistantDemo() {
  // Unwired -> typing demo stream. configureAssistantStream for a real LLM.
  return <div className="h-dvh w-full"><Assistant /></div>;
}`,
  },
  {
    slug: "browser",
    title: "Browser — remote headless-browser chrome",
    category: "os",
    kind: "ui",
    version: "1.3.0",
    tagline: "React + Svelte multitab remote-browser chrome over one authenticated host adapter, poll/screencast session core, and tool contract.",
    description:
      "Framework-parity remote-browser chrome. React/Next remains default with Lucide/shadcn chrome, appshell descriptor, inspector seam, and automatic tool registration. Native Svelte 5/SvelteKit adds the same multitab strip, omnibar URL/search, bookmarks/history, remote-frame click/type/key/scroll forwarding, screenshot save, AI activity log, live/poll badge, and mode gate over one shared BrowserAdapter/session/screencast/storage/url/tool core. Unwired, the canvas demo renderer still works offline. Real configureBrowser/configureScreencast routes must be authenticated/authorized like SSH because remote pages can hold logged-in sessions.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/browser",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "input", "badge", "dropdown-menu", "tooltip", "scroll-area"],
    env: [],
    peers: [],
    tags: ["browser", "headless", "playwright", "remote", "omnibar", "bookmarks", "ui", "svelte", "framework-parity"],
    resourceType: "module",
    maturity: "beta",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/browser",
    defaultView: "desktop",
    agentRecipe: `React/default: \`npx rr add browser\`. SvelteKit: \`npx rr add browser --framework sveltekit\`. Both share the same BrowserAdapter, multitab session, demo renderer, screenshot polling/MJPEG stream fallback, URL/storage helpers, and browserTools. Configure a real Playwright/CDP adapter only behind authenticated + authorized server routes; remote browser state can contain private logged-in sessions. React auto-registers tools; Svelte exposes optional registerTools(collection, getCtx).`,
    exampleCode: `"use client";
import { Browser } from "@/features/browser";

export default function BrowserDemo() {
  // Unwired -> offline canvas demo renderer. configureBrowser for Playwright.
  return <div className="h-dvh w-full"><Browser /></div>;
}`,
  },
  {
    slug: "app-store",
    title: "App Store — install, create + toggle apps",
    category: "os",
    kind: "ui",
    version: "1.3.0",
    tagline: "React + Svelte storefront/Create-App over one observable localStorage registry and injected runtime exec seam.",
    description:
      "Framework-parity App Store + Create App. React/Next remains the default storefront with Lucide/shadcn chrome, appshell-style dynamic descriptors, and automatic shared-agent tool registration. Explicit Svelte 5/SvelteKit adds native storefront, built-in app/feature toggles, custom-app authoring, sandboxed HTML runtime apps, and command-console runtime apps over the same observable localStorage app registry, disabled-set store, curated catalog, exec adapter, manifest helpers, and self-contained appStoreTools. New built-ins stay enabled by default because only disabled ids persist; command execution is host-injected and uses a safe demo echo until wired.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/app-store",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "input", "badge", "separator", "scroll-area", "switch", "tooltip"],
    env: [],
    peers: [],
    tags: ["app-store", "registry", "installer", "dynamic-apps", "launcher", "ui", "svelte", "framework-parity"],
    resourceType: "module",
    maturity: "beta",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/app-store",
    defaultView: "desktop",
    agentRecipe: `React/default: \`npx rr add app-store\`. SvelteKit: \`npx rr add app-store --framework sveltekit\`. Both share the same localStorage app registry, disabled-id store, catalogs, tool contract, and configureAppStoreExec seam. React additionally exports appshell AppDescriptor hooks; Svelte carries no React/Lucide/shadcn/agent runtime and can optionally register appStoreTools through its registerTools(collection, getCtx) prop. Authenticate any live exec endpoint like SSH.`,
    exampleCode: `"use client";
import { AppStore } from "@/features/app-store";

export default function StoreDemo() {
  // Install/uninstall + Create-App write one localStorage registry.
  return <div className="h-dvh w-full"><AppStore /></div>;
}`,
  },
  {
    slug: "file-explorer",
    title: "File Explorer — Tree + CRUD + Preview + Properties",
    category: "os",
    kind: "full",
    version: "1.7.0",
    tagline: "React + Svelte file manager over one injectable filesystem adapter — CRUD, history, upload, preview, properties, and tools.",
    description:
      "Framework-parity backend-neutral file explorer. React/Next remains default; native Svelte 5/SvelteKit covers location sidebar, back/forward + breadcrumbs, grid/list sorting, multi-select, create/rename/move/copy/cut/paste/trash/delete, drag/drop upload, image/audio/video/PDF/text preview, editable body + metadata properties, storage usage, and optional function-calling tools over the same FileExplorerAdapter. Bundled mock/live/structural-Convex adapters are shared; Svelte carries no React/Next/Lucide React/shadcn/FilePicker/agent runtime.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/file-explorer",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "input", "scroll-area", "separator", "dropdown-menu", "sheet", "dialog"],
    env: [],
    peers: [],
    tags: ["files", "file-manager", "explorer", "tree", "breadcrumb", "crud", "sidebar", "ui", "svelte", "framework-parity"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/file-explorer",
    defaultView: "desktop",
    agentRecipe: `React/default: \`npx rr add file-explorer\`. SvelteKit: \`npx rr add file-explorer --framework sveltekit\`. Both share the FileExplorerAdapter, writable mock/live/Convex adapter factories, history/operations/file-kind cores, preview/property semantics, and fileExplorerTools. React keeps shadcn/Lucide and auto-registers tools through the narrow agent hook; Svelte installs only svelte@^5 plus portable adapter/core files and can optionally register tools via its registerTools prop. Inject a real filesystem adapter for production and keep authorization/server path bounds in that backend — UI mode/read-only checks are convenience, not a security boundary.`,
    exampleCode: `"use client";
import { FileExplorer } from "@/features/file-explorer";

export default function FileExplorerDemo() {
  // No adapter prop → uses the backend from lib/backend.ts (mock by default):
  // a writable in-memory tree, so create/rename/delete/move/upload all work with
  // no backend. Flip FILE_EXPLORER_BACKEND to "live"/"convex" in that one file to
  // go real — nothing here changes. Pass adapter={…} to override per-instance.
  return (
    <div className="h-dvh w-full">
      <FileExplorer
        rootLabel="Files"
        onOpenFile={(path, entry) => console.log("open file", entry.name, path)}
      />
    </div>
  );
}`,
  },
  {
    slug: "appshell",
    title: "AppShell — Desktop + Mobile OS Shell",
    category: "os",
    kind: "full",
    version: "1.6.0",
    tagline: "Manifest-driven macOS-style window manager + iOS-style mobile surface in one slice.",
    description:
      "Generic, brand-free OS-style shell framework. One <AppShell manifest> wrapper provider gives a project a macOS-style window manager (drag/snap/maximize, dock, menu bar, Spotlight) AND an iOS-style mobile surface (home pager, app library, control center, widgets), driven entirely by a manifest: brand, apps, features, surface regions, capabilities, persistence, keymap. Five shell features (search, inspector, notifications, control-center, widgets) are bundled as defineFeature() contributions inside the slice and mount via named <Slot>s. Responsiveness is a single ResponsiveProvider + 4 DRY primitives (AppFrame, MasterDetail, ResponsiveToolbar, TouchList). Imports nothing project-specific — the consumer injects data/auth/AI through manifest.capabilities. Lifted from os-vps (Topside).",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/appshell",
    convexPaths: [],
    npm: ["lucide-react", "class-variance-authority", "clsx", "tailwind-merge", "vaul"],
    shadcn: ["button", "tooltip", "scroll-area", "sheet", "drawer", "dialog", "alert-dialog", "dropdown-menu"],
    env: [],
    peers: [],
    tags: ["shell", "window-manager", "desktop", "mobile", "responsive", "framework", "ui"],
    resourceType: "module",
    maturity: "stable",
    previewPath: "/preview/slices/appshell",
    defaultView: "desktop",
    agentRecipe: `Stack required: Next 16 (App Router) + React 19 + Tailwind 4 + shadcn/ui. The slice is self-contained — it imports only @/components/ui/* + @/lib/utils (cn); everything project-specific arrives via the manifest. Follow ALL steps; the ⚠ ones are where installs break.

STEP 1 — Install. \`npx rr add appshell\` (alias \`npx rahman-resources add appshell\`). It copies to your slices dir. Ensure \`@/features/appshell\` resolves in tsconfig paths (point it at that dir), and that Tailwind's content globs SCAN the slice folder (else the shell renders unstyled).

STEP 2 — shadcn + npm deps. Add any missing shadcn primitives: \`npx shadcn@latest add button tooltip scroll-area sheet drawer dialog alert-dialog dropdown-menu\`. npm: lucide-react class-variance-authority clsx tailwind-merge vaul.

STEP 3 — ⚠ Theme. Import the slice's tokens ONCE in the root layout: \`import "@/features/appshell/appshell.css"\`. These are the glass/dock/window/wallpaper CSS variables the shell needs — they are NOT shadcn defaults, so skipping this = an unstyled, broken-looking shell. It pairs with your shadcn tokens (--background etc.). Dark mode = toggle the \`.dark\` class on <html> (appshell.css ships light + dark).

STEP 4 — Mount full-bleed. Render <AppShell manifest={manifest} /> from a CLIENT component that owns one full viewport (the page is h-dvh w-screen / the root). AppShell auto-picks the macOS desktop on wide viewports and the iOS surface on narrow — you write nothing extra for mobile.

STEP 5 — Build the ShellManifest:
• brand: { name, logo (string or ReactNode), idleAppName?, wallpaper?: "aurora"|"dusk"|"mist"|"noir" }.
• apps: AppDescriptor[] — { id, title, icon (a lucide-react icon component), gradient (a CSS gradient string for the glossy icon), load: async () => ({ default: YourAppComponent }), slug?, defaultSize?: {w,h}, multi?: true (spawn a new window per open, e.g. a file manager), noDock?: true }. Your app component receives props { payload }.
• features: the fastest path is \`features: DEFAULT_FEATURES\` — the bundled default system-feature set (all five, generic + brand-free) exported from "@/features/appshell". Or import individually and list only what you want: searchFeature (⌘K Spotlight), inspectorFeature (⌘I AI/context panel), notificationsFeature (toasts + iOS dynamic island), controlCenterFeature (iOS control center), widgetsFeature (iOS Today widgets). The surfaces are slot-driven, so spreading/trimming DEFAULT_FEATURES just mounts/omits a feature — \`features: [...DEFAULT_FEATURES.filter(f => f.id !== "widgets")]\`.
• capabilities: ShellCapabilities — your data/auth/AI injection seam. useAppearance() and useCpuPercent() are REQUIRED; useSearch/useSystemStats/useChat/useServerToggle are optional (defaults degrade gracefully). ⚠ CRITICAL: every capability hook MUST return a REFERENTIALLY STABLE value — a module-level const, or useMemo/useCallback. Returning a fresh object/closure each render makes Spotlight's search effect re-fire forever ("Maximum update depth exceeded"). e.g. define APPEARANCE once at module scope and \`useAppearance: () => APPEARANCE\`.
• persistKey?: localStorage namespace for the saved window layout (default "appshell:layout").
• routing?: defaults TRUE — it mirrors the focused app to the URL via the History API (window.history, NOT router.push). ⚠ If true you MUST add a catch-all route \`app/[[...slug]]/page.tsx\` that renders the mount AND calls notFound() for reserved paths (slug[0] === "_next"), or missing chunks return wrong-MIME 200s. SIMPLEST first install: set \`routing: false\` to skip the catch-all entirely.

Extending: add an app = one manifest entry; add a shell feature = a new defineFeature({id, slots}) listed in features[]. No surface edits ever (open/closed). exampleCode ships BOTH variants: Variant A = routing:false mount in app/page.tsx (simplest); Variant B = catch-all app/[[...slug]]/page.tsx with routing on + app slugs for addressable, deep-linkable URLs (the catch-all MUST notFound() "_next").`,
    exampleCode: `// ════════ VARIANT A — simplest: no URL sync (app/page.tsx) ════════
// Mount AppShell full-bleed. Verified-working shape.
"use client";

import { FileText } from "lucide-react";
import {
  AppShell,
  searchFeature,
  inspectorFeature,
  notificationsFeature,
  controlCenterFeature,
  widgetsFeature,
  type ShellManifest,
} from "@/features/appshell";
import "@/features/appshell/appshell.css"; // REQUIRED — the shell's theme tokens

// Your app. It receives { payload } (whatever opened the window).
function NotesApp({ payload }: { payload?: unknown }) {
  return (
    <div className="h-full bg-background p-4 text-sm">
      Your app UI here. payload: {String(payload ?? "—")}
    </div>
  );
}

// ⚠ Capability hooks MUST return STABLE references (module-level / useMemo),
// or Spotlight's search effect loops forever. Define once, return the same ref.
const NOOP = () => {};
const APPEARANCE = {
  theme: "light" as const,
  setTheme: NOOP, // wire to your theme store; also toggle \`.dark\` on <html>
  device: "auto" as const,
  wallpaper: "aurora",
};

const manifest: ShellManifest = {
  brand: { name: "My OS", logo: "▲", idleAppName: "Finder" },
  apps: [
    {
      id: "notes",
      title: "Notes",
      icon: FileText,
      gradient: "linear-gradient(160deg,#ffd34d,#ff9a3d)",
      defaultSize: { w: 560, h: 380 },
      multi: true, // several Notes windows at once
      load: async () => ({ default: NotesApp }),
    },
    // add more apps = add more entries (each lazy-loads its own bundle)
  ],
  features: [
    searchFeature,
    inspectorFeature,
    notificationsFeature,
    controlCenterFeature,
    widgetsFeature,
  ],
  routing: false, // set true ONLY if you add app/[[...slug]]/page.tsx (notFound _next)
  capabilities: {
    useAppearance: () => APPEARANCE,
    useCpuPercent: () => null,
    // optional, all must be stable refs:
    // useSearch: () => myStableSearchFn,   // (q) => Promise<SearchHit[]>
    // useSystemStats: () => myStatsOrNull,
    // useChat: () => myStableChatFn,
    // useServerToggle: () => myToggleOrNull,
  },
};

export default function Page() {
  return <AppShell manifest={manifest} />;
}

// ════════ VARIANT B — addressable URLs (deep-link /notes, back/forward) ════════
// Same manifest as A, but: DROP \`routing: false\` (default is ON) and give each
// app a \`slug\`. Mount from a CATCH-ALL route instead of app/page.tsx. The dock
// uses History-API URL sync (window.history, NOT router.push) — handled inside
// the slice; you only provide the catch-all route below.

// 1) components/shell.tsx — the client mount (apps carry slugs, routing left ON)
"use client";
import { FileText } from "lucide-react";
import {
  AppShell, searchFeature, inspectorFeature, notificationsFeature,
  controlCenterFeature, widgetsFeature, type ShellManifest,
} from "@/features/appshell";
import "@/features/appshell/appshell.css";

function NotesApp({ payload }: { payload?: unknown }) {
  return <div className="h-full bg-background p-4 text-sm">Notes · {String(payload ?? "—")}</div>;
}
const NOOP = () => {};
const APPEARANCE = { theme: "light" as const, setTheme: NOOP, device: "auto" as const, wallpaper: "aurora" };

const manifest: ShellManifest = {
  brand: { name: "My OS", logo: "▲", idleAppName: "Finder" },
  apps: [
    {
      id: "notes",
      slug: "notes", // deep-link: /notes focuses (or opens) this app
      title: "Notes",
      icon: FileText,
      gradient: "linear-gradient(160deg,#ffd34d,#ff9a3d)",
      defaultSize: { w: 560, h: 380 },
      multi: true,
      load: async () => ({ default: NotesApp }),
    },
  ],
  features: [searchFeature, inspectorFeature, notificationsFeature, controlCenterFeature, widgetsFeature],
  // routing omitted => defaults TRUE => focused app + launch path mirror to the URL
  capabilities: { useAppearance: () => APPEARANCE, useCpuPercent: () => null },
};

export function Shell() {
  return <AppShell manifest={manifest} />;
}

// 2) app/[[...slug]]/page.tsx — ONE optional catch-all (server). No per-app pages;
//    the window manager stays client-side, only the URL is mirrored.
import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return { title: slug?.[0] ? \`\${slug[0]} — My OS\` : "My OS" };
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  // ⚠ MUST notFound() reserved paths: a missing /_next/* chunk has to 404 — else
  // this catch-all returns the app HTML with 200 (wrong MIME, no client recovery).
  if (slug?.[0] === "_next") notFound();
  return <Shell />;
}`,
  },
  {
    slug: "convex-auth",
    title: "Convex Auth — Multi-Provider Sign-in",
    category: "auth",
    kind: "backend",
    version: "0.4.0",
    tagline: "@convex-dev/auth: props-driven AuthCard (google · github · magic-link · password · phone OTP). No Clerk.",
    description: "@convex-dev/auth with Password (PBKDF2-SHA256 100k, self-hosted-friendly), Anonymous (guest), Google OAuth, and Resend magic-link. Ships a production SignInPage plus a presentational, props-driven AuthCard (v0.3) — choose `methods` (google, github, magic-link, password signin/signup tabs, phone OTP, anonymous) and render the card anywhere with different props; handlers default to a mock so it's interactive with zero wiring. i18n via labels. No Clerk.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://labs.convex.dev/auth",
    install: "npm i @convex-dev/auth @auth/core resend",
    slicePath: "frontend/slices/convex-auth",
    convexPaths: ["convex/features/auth"],
    npm: ["@convex-dev/auth@^0.0.92", "@auth/core@^0.37.4", "resend@^4.0.0"],
    shadcn: ["button", "card", "input", "label", "tabs", "alert", "input-otp"],
    env: [
      { name: "AUTH_RESEND_KEY", scope: "convex" },
      { name: "JWT_PRIVATE_KEY", scope: "convex" },
      { name: "JWKS", scope: "convex" },
      { name: "SITE_URL", scope: "convex" },
      { name: "AUTH_GOOGLE_ID", scope: "convex" },
      { name: "AUTH_GOOGLE_SECRET", scope: "convex" },
    ],
    peers: [],
    tags: ["auth", "convex", "password", "magic-link", "google", "anonymous", "no-clerk", "pbkdf2"],
    usedBy: ["personal-brand-os", "wirausaha-os", "konsultan-os"],
    agentRecipe: "Run `rr add convex-auth`. Then create convex/auth.ts using the kitab pattern (Resend provider). Set env via `npx convex env set` for self-hosted.",
    previewPath: "/preview/slices/convex-auth",
    defaultView: "mobile",
    defaultZoom: 1,
    compat: {
      templates: {
        "personal-brand-os": { status: "native" },
        "agency-studio-os": { status: "native" },
        "konsultan-os": { status: "native" },
        "wirausaha-os": { status: "native" },
        "kreator-studio-os": { status: "native" },
        "riset-kit": { status: "native" },
        "saas-marketing-os": { status: "recommended" },
        "cms-public-storefront": { status: "recommended" },
      },
      enhances: ["payment", "resend-newsletter", "ai-router"],
    },
    exampleCode: `// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@convex-dev/auth/providers/Resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Resend({ from: "auth@yourdomain.com" })],
});

// app/proxy.ts (Next 16 — NOT middleware.ts)
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
export default convexAuthNextjsMiddleware();`,
  },
  {
    slug: "payment",
    title: "Payment — Indonesia PSP (DOKU · Midtrans)",
    category: "integrations",
    kind: "full",
    version: "0.5.0",
    description: "Framework-parity Indonesia payment providers behind one slug and one provider-discriminated Convex data model. React/Next remains default; Svelte 5/SvelteKit adds native DOKU hosted/direct/status/instructions and Midtrans checkout/orders surfaces over shared contracts/tools. CLI 1.18 scopes provider runtime deps + backend actions: doku installs no provider npm SDK and only DOKU env/action; midtrans adds midtrans-client + Midtrans env/action; add-all receives the union. HMAC/signature verification, webhook idempotency, amount validation, and provider secrets stay server-side.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sandbox.doku.com/integration",
    install: "",
    slicePath: "frontend/slices/payment",
    convexPaths: ["convex/features/payment"],
    npm: ["midtrans-client@^1.4.2"],
    shadcn: ["badge", "button", "card", "dialog", "input", "label", "select", "skeleton"],
    env: [
      { name: "DOKU_CLIENT_ID", scope: "convex" },
      { name: "DOKU_SECRET_KEY", scope: "convex" },
      { name: "DOKU_IS_PRODUCTION", scope: "convex" },
      { name: "MIDTRANS_SERVER_KEY", scope: "convex" },
      { name: "MIDTRANS_CLIENT_KEY", scope: "next-public" },
      { name: "MIDTRANS_IS_PRODUCTION", scope: "convex" },
    ],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Order ownership requires authenticated user (guest checkout works without)." }],
    providers: ["doku", "midtrans"],
    variants: [
      { title: "doku", desc: "npx rr add payment doku — Hosted Checkout + Direct channel picker, HMAC REST, dependency-free." },
      { title: "midtrans", desc: "npx rr add payment midtrans — Snap hosted-modal button + orders (needs midtrans-client + next-public key)." },
    ],
    tags: ["payment", "checkout", "indonesia", "doku", "midtrans", "snap", "qris", "virtual-account", "ewallet", "psp", "svelte", "framework-parity"],
    usedBy: ["personal-brand-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "riset-kit", "agency-studio-os", "cms-public-storefront"],
    agentRecipe: "Install one provider with rr add payment doku|midtrans, or both with rr add payment; append --framework sveltekit for native Svelte. CLI 1.18 gates provider action/npm/env while retaining shared payment schema/query/mutation/webhook support. DOKU injects checkout/direct actions and keeps HMAC secrets server-side. Midtrans injects createTransaction + optional Snap onPay bridge; only the client key is browser-visible.",
    previewPath: "/preview/slices/payment",
    wiring: `// app/checkout/page.tsx
export { default } from "@/features/payment/components/checkout-page";

// convex/http.ts
import { dokuWebhook } from "./features/payment/http";
http.route({ path: "/webhooks/doku", method: "POST", handler: dokuWebhook });`,
    defaultView: "mobile",
    defaultZoom: 1,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Pairs with services/digital-product flow. Mount checkout-page at /checkout." },
        "agency-studio-os": { status: "recommended", note: "Invoice payment via VA — Direct mode fits B2B flow." },
        "saas-marketing-os": { status: "warn", note: "SaaS biasanya butuh recurring billing — DOKU best untuk one-time. Pakai Stripe untuk subscription." },
        "konsultan-os": { status: "recommended", note: "Pembayaran sesi konsultasi — Checkout mode untuk paket bundling." },
        "wirausaha-os": { status: "recommended", note: "Multi-channel commerce — VA + QRIS + e-Wallet untuk customer pilih sendiri." },
        "kreator-studio-os": { status: "recommended", note: "Digital product / coaching purchase — Checkout mode redirect to DOKU page." },
        "riset-kit": { status: "recommended", note: "Paid research bundle — one-time Checkout flow." },
        "cms-public-storefront": { status: "recommended", note: "Cart checkout — Direct mode untuk control UI atau Checkout untuk quick wins." },
      },
      conflicts: ["stripe-payment"],
      enhances: ["convex-auth", "ai-router"],
    },
  },
  {
    slug: "resend-newsletter",
    title: "Resend — Transactional & Newsletter",
    category: "integrations",
    kind: "full",
    version: "0.3.1",
    description: "Truthful single-opt-in newsletter slice with adapter-backed React/Next and native Svelte 5 subscribe forms, a self-contained Convex subscriber/issue backend, public unsubscribe, host-authorized list/send adapters, and internal Resend campaign workers. The public preview stays unconfigured so it cannot mutate data or send email.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://resend.com/docs",
    install: "npm i resend",
    slicePath: "frontend/slices/resend-newsletter",
    convexPaths: ["convex/features/newsletter"],
    npm: ["resend@^6.12.4"],
    shadcn: ["button", "card", "input", "label"],
    env: [
      { name: "RESEND_API_KEY", scope: "convex", required: true },
      { name: "RESEND_FROM", scope: "convex", required: true },
    ],
    peers: [],
    tags: ["email", "newsletter", "resend", "broadcast", "svelte"],
    usedBy: ["personal-brand-os", "kreator-studio-os", "wirausaha-os"],
    agentRecipe: "Run `npx rr add resend-newsletter` for React/default or `npx rr add resend-newsletter --framework sveltekit`. Configure the public subscribe adapter before rendering. The bundled Convex backend is single opt-in: subscribe activates immediately and unsubscribe is public/idempotent. List/send remain host-authorized adapters; after host authz call the internal sendCampaign worker. RESEND_API_KEY/RESEND_FROM stay server-side.",
    previewPath: "/preview/slices/resend-newsletter",
    wiring: `// App startup — both React and Svelte use the same public adapter contract
configureResendNewsletter({
  subscribe: ({ email, website }) => newsletterSubscribeMutation({ email, website }),
});

// Bundled Convex endpoints
// mutation.subscribe / mutation.unsubscribe
// listSubscribers/sendBroadcast: host-authenticated adapters
// internal.actions.send.sendCampaign → scheduled internal Resend worker`,
    defaultView: "tablet",
    defaultZoom: 0.8,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Public subscribe plus a host-authorized campaign seam are bundled." },
        "agency-studio-os": { status: "recommended", note: "Host-authorized campaign adapters pair with lead/content workflows." },
        "saas-marketing-os": { status: "recommended" },
      },
    },
  },
  // ─────────────────────────────────────────────────────────────
  // AI features. chat/studio/agents consolidated 2026-07-04 into the
  // ai-workspace variant slice; ai-admin + ai-router stay separate.
  //
  // Ordering follows the user mental model:
  //   1. ai-workspace — talk to / make with / delegate to the model
  //                     (chat · studio · agents variants)
  //   2. ai-admin  — operator console (instructions / skills / tools /
  //                  agents / providers / budgets / audit)
  //   3. ai-router — backend infra (provider proxy + cost guard)
  //
  // Tag taxonomy:
  //   "ai"            — umbrella (every entry)
  //   "ai:<arch>"     — chat | studio | agents | admin | backend
  //   capability tags — streaming, multimodal, tool-calls, rag,
  //                     agent-mode, citations, branching, history,
  //                     image-gen, voice
  // ─────────────────────────────────────────────────────────────
  {
    slug: "ai-workspace",
    title: "AI Workspace — chat · studio · agents",
    category: "ai",
    kind: "full",
    version: "0.3.0",
    tagline: "Three AI surfaces behind one slug — chat FAB, generation studio, agent runner. Install one variant or all.",
    description: "Three AI surfaces as shadcn-style variants — `npx rr add ai-workspace <variant>` for one, or `npx rr add ai-workspace` for all + a switcher. Only the chat variant pulls a Convex backend (per-variant convex gating).\n\n  • chat — floating <AiChatFab /> + createAgenticChatSend: real function-calling over any ToolHost (@/shared/agentic), key-guarded, over convex/features/aiChat.\n  • studio — <AiStudioPage /> single-prompt generation canvas (variation grid + version tree, Suno / Midjourney / Lovable pattern) + aiStudioTools so a shared agent can drive generations.\n  • agents — <AiAgentsPage /> autonomous-worker run dashboard + createAgentRunner(host) which drives the shared function-calling loop and records each tool_use as a RunStep trace.\n\nUse cases: support chatbot in a marketing site, AI generation product (image / code / text / audio), background workers (nightly audits, scheduled crawls, moderation). studio + agents are frontend-only — wire your own persistence.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sdk.vercel.ai/docs",
    install: "npm i ai @ai-sdk/anthropic @ai-sdk/openai",
    slicePath: "frontend/slices/ai-workspace",
    convexPaths: ["convex/features/aiChat"],
    npm: ["ai@^4.0.0", "@ai-sdk/anthropic@^0.0.50", "@ai-sdk/openai@^0.0.60"],
    shadcn: ["avatar", "badge", "button", "card", "progress", "scroll-area", "select", "separator", "slider", "switch", "table", "tabs", "textarea", "tooltip"],
    env: [
      { name: "ANTHROPIC_API_KEY", scope: "convex", required: false },
      { name: "OPENAI_API_KEY", scope: "convex", required: false },
      { name: "GOOGLE_GENERATIVE_AI_API_KEY", scope: "convex", required: false },
    ],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "chat/studio/agents ownership requires an authenticated user." },
      { slug: "ai-router", range: "^0.1", reason: "Routes provider calls through the tiered proxy." },
      { slug: "ai-admin", range: "^0.1", reason: "Reads instructions / skills / tools / models / agent defs from the ai-admin registry." },
      { slug: "vector-search", range: "^0.1", reason: "Optional — chat RAG mode pulls workspace embeddings." },
    ],
    tags: ["ai", "ai:chatbot", "ai:studio", "ai:agent", "agent-mode", "tool-calls", "streaming", "generation", "async", "traces", "multimodal"],
    usedBy: [],
    variants: [
      { title: "chat", desc: "Floating assistant FAB with real function-calling over any ToolHost (convex/features/aiChat)." },
      { title: "studio", desc: "Single-prompt generation canvas + agentic generate tool. Frontend-only." },
      { title: "agents", desc: "Autonomous-worker run dashboard + createAgentRunner loop. Frontend-only." },
    ],
    agentRecipe: "Run `npx rr add ai-workspace <chat|studio|agents>` for one surface, or `npx rr add ai-workspace` for all. chat: mount <AiChatFab chat={useAction(api.features.aiChat.action.chat)} />. studio: mount <AiStudioPage /> + drive via aiStudioTools. agents: mount <AiAgentsPage /> + trigger via createAgentRunner(host).",
    previewPath: "/preview/slices/ai-workspace",
    defaultSurface: "public",
    defaultView: "desktop",
    defaultZoom: 0.55,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Support chat + post-draft studio + scheduled agent audits." },
        "kreator-studio-os": { status: "recommended", note: "Content ideation (chat) + creator-output studio + background batch runs." },
        "saas-marketing-os": { status: "warn", note: "Mainly chat search mode fits marketing sites." },
      },
      enhances: ["ai-router", "ai-admin", "vector-search", "audit-log"],
    },
  },
  {
    slug: "ai-admin",
    title: "AI Admin — Contract",
    category: "ai",
    kind: "backend",
    version: "0.4.0",
    description: "Framework-neutral compile-time contract for a future AI administration surface. Ships provider/model/skill/tool/agent/budget/audit types plus tab, icon-name, and permission taxonomy; intentionally no renderer, persistence backend, or runtime framework dependency.",
    source: "rahmanef63/resource-site",
    install: "npx rr add ai-admin",
    slicePath: "frontend/slices/ai-admin",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["ai", "admin", "contract", "types", "taxonomy", "headless"],
    usedBy: [],
    agentRecipe: "Install ai-admin for the default contract or pass --framework sveltekit. Both copy the same framework-neutral TypeScript source. Use the exported types and taxonomy as host inputs; build any renderer, persistence, and authorization in the consuming app.",
  },
  {
    slug: "ai-router",
    title: "AI Router — OpenRouter Tier Proxy",
    category: "ai",
    kind: "full",
    version: "0.6.0",
    description: "Authenticated tier-routed LLM access through one Convex action and OpenRouter. Ships a transport-injected ChatFab: React/Next remains default and SvelteKit gets native Svelte 5 UI over the same request/result core and the same aiUsage backend. Unconfigured hosts return an explicit notice instead of a fake reply.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sdk.vercel.ai/docs",
    install: "npx rr add ai-router",
    slicePath: "frontend/slices/ai-router",
    convexPaths: ["convex/features/ai"],
    npm: ["convex@^1.17", "ai@^4.0.0", "@openrouter/ai-sdk-provider@^0.0.5", "lucide-react@^0.400.0"],
    shadcn: ["button", "card", "input"],
    env: [{ name: "OPENROUTER_API_KEY", scope: "convex", required: true }],
    peers: [],
    tags: ["ai", "llm", "openrouter", "tier-routing", "chat"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add ai-router` or add `--framework sveltekit`. Bind ChatFab.route to api.features.ai.action.callModel. The action requires auth, keeps the provider key server-only, returns a notice when unavailable, and logs successful usage to aiUsage.",
    previewPath: "/preview/slices/ai-router",
    wiring: `// consumer adapter
const route = (request) => client.action(api.features.ai.action.callModel, request);
<ChatFab route={route} tier="mid" feature="support-chat" />`,
    defaultView: "desktop",
    defaultZoom: 0.7,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended" },
        "kreator-studio-os": { status: "recommended" },
        "saas-marketing-os": { status: "warn", note: "Only needed when the product exposes an authenticated AI surface." },
      },
      enhances: ["ai-workspace", "ai-admin"],
    },
  },
  {
    slug: "vector-search",
    title: "Vector Search — Adapter Contract",
    category: "data",
    kind: "backend",
    version: "0.3.0",
    description: "Framework-neutral semantic-search adapter contract. The host injects VectorSearchCtx for query/index/reindex and owns the actual vector backend, embeddings, credentials, persistence, authorization, and reindex policy; RR ships no renderer or Convex schema for this slice.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/vector-search",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["search", "vector", "embeddings", "adapter", "headless", "portable"],
    usedBy: ["personal-brand-os", "riset-kit"],
    agentRecipe: "Run `npx rr add vector-search` (React/default) or `npx rr add vector-search --framework sveltekit`. Bind VectorSearchCtx.search/index/reindex to your own authorized vector backend. The slice intentionally does not invent a Convex schema, embedding provider, renderer, or credential requirement.",
    wiring: `import { vectorSearchTools, type VectorSearchCtx } from "@/features/vector-search";

const vectorSearch: VectorSearchCtx = {
  search: (query, topK) => hostVectorIndex.search(query, topK),
  index: (text, title) => guardedIndexDocument({ text, title }),
  reindex: () => guardedReindex(),
};

// Register vectorSearchTools with vectorSearch in your tool host.`,
  },
  {
    slug: "cal-com-booking",
    title: "Cal.com Booking",
    category: "data",
    kind: "full",
    version: "0.3.0",
    description: "Cal.com inline booking UI with a real Convex webhook mirror. React/Next stays default via @calcom/embed-react; SvelteKit uses native Svelte 5 over the shared vanilla embed loader. The bundled backend mirrors webhook events into the real bookings table; list/cancel/reschedule remain host-injected tool adapters.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://cal.com/embed",
    install: "npm i @calcom/embed-react",
    slicePath: "frontend/slices/cal-com-booking",
    convexPaths: ["convex/features/bookings"],
    npm: ["@calcom/embed-react@^1.5.3"],
    shadcn: [],
    env: [
      { name: "CALCOM_WEBHOOK_SECRET", scope: "convex", required: true },
    ],
    peers: [],
    tags: ["data", "scheduling", "cal-com", "bookings", "webhook", "svelte"],
    usedBy: ["personal-brand-os", "konsultan-os"],
    agentRecipe: "Run `npx rr add cal-com-booking` for React/default or `npx rr add cal-com-booking --framework sveltekit`. Pass an explicit calLink and optional calOrigin. Wire the bundled webhook mirror to the real bookings table; bind list/cancel/reschedule tools separately to host APIs.",
    previewPath: "/preview/slices/cal-com-booking",
    wiring: `// React / Next
import { CalEmbed } from "@/features/cal-com-booking";
<CalEmbed calLink="team/event-type" />

// SvelteKit uses the same public CalEmbed component name.
// The bundled Convex feature is a signed webhook mirror only.`,
    defaultView: "mobile",
    defaultZoom: 1,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Services slice has a booking placeholder slot." },
        "agency-studio-os": { status: "recommended", note: "Project intake form pairs with Cal.com." },
        "saas-marketing-os": { status: "recommended", note: "Demo-request form can swap to Cal.com." },
        "konsultan-os": { status: "recommended", note: "Konsultasi booking wajib — Cal.com embed di services page." },
      },
    },
  },
  {
    slug: "command-menu",
    title: "Command Menu",
    category: "ui",
    kind: "ui",
    version: "0.4.0",
    tagline: "Notion-style ⌘K palette + search modal. Consumer supplies groups; slice owns dialog + MRU.",
    description: "Portable command palette + generic search modal. React/Next remains the default cmdk/shadcn UI while Svelte 5/SvelteKit adds native palette/search surfaces over the same framework-neutral group, hotkey, MRU history, filtering, selection, label, and search-state core.",
    source: "notion-page-clone (consumerVersion 0.3.0) + earlier superspace facade",
    docsUrl: "https://cmdk.paco.me",
    install: "npm i cmdk",
    slicePath: "frontend/slices/command-menu",
    convexPaths: [],
    npm: ["cmdk@^1.0.0", "lucide-react@^0.400.0"],
    shadcn: ["button", "command", "dialog"],
    env: [],
    peers: [],
    tags: ["ui", "palette", "cmd-k", "navigation", "keyboard", "search", "notion-like"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "saas-marketing-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Run `npx rr add command-menu`. Wire <CommandPalette groups={...} onHistorySelect={...} labels={...} /> at the dashboard shell. Build groups from your feature registry; each item.onSelect handles navigation. Use <SearchModal bindings={{ pages, databases, recents, isLoading, onQueryChange, onSelectPage, onSelectDatabase }} /> for the search dialog — see slice README.md for adapter shapes.",
    previewPath: "/preview/slices/command-menu",
    wiring: `import { CommandPalette } from "@/features/command-menu";

<CommandPalette groups={groups} onHistorySelect={rerunRecent} labels={labels} />`,
    defaultView: "mobile",
    defaultZoom: 1,
  },
  {
    slug: "motion-primitives",
    title: "Motion Primitives (8)",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "Eight ready-to-style motion components: marquee, kinetic-heading, magnetic, cursor-spotlight, stat-counter, reading-progress, grain, lightbox. Framer-Motion-powered, tree-shakeable. Facade slice — pulls from template-base/frontend/slices/motion-primitives.",
    source: "rahmanef.com",
    docsUrl: "",
    install: "npm i framer-motion",
    slicePath: "template-base/frontend/slices/motion-primitives",
    convexPaths: [],
    npm: ["framer-motion@^11.0.0"],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["ui", "motion", "animation", "marquee", "framer-motion"],
    usedBy: ["personal-brand-os", "agency-studio-os", "kreator-studio-os", "saas-marketing-os"],
    agentRecipe: "Run `npx rr add motion-primitives`. Each primitive is independently importable from @/features/motion-primitives. Use marquee for logo strips, kinetic-heading for hero text, magnetic for CTA buttons, cursor-spotlight for hover-reveal panels, stat-counter for animated numbers, reading-progress for blog top bar, grain for film texture, lightbox for image gallery.",
    previewPath: "/preview/slices/motion-primitives",
    wiring: `import { Marquee, KineticHeading, Magnetic } from "@/features/motion-primitives";

<KineticHeading>Membangun masa depan</KineticHeading>
<Marquee items={logos} durationSec={40} />
<Magnetic><button>Click me</button></Magnetic>`,
    defaultView: "desktop",
    defaultZoom: 0.6,
  },
  {
    slug: "responsive-dialog",
    title: "Responsive Dialog (Sheet ↔ Modal)",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "ResponsiveDialog — auto-switches between bottom Sheet (mobile) and centered Dialog (desktop) at the md breakpoint. Same API as shadcn Dialog. Kitab forbids raw <dialog>; use this everywhere. Facade slice — pulls from template-base/frontend/slices/responsive-dialog.",
    source: "superspace",
    docsUrl: "",
    install: "",
    slicePath: "template-base/frontend/slices/responsive-dialog",
    convexPaths: [],
    npm: [],
    shadcn: ["dialog", "sheet"],
    env: [],
    peers: [],
    tags: ["ui", "dialog", "modal", "sheet", "responsive", "primitive"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "saas-marketing-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Run `npx rr add responsive-dialog`. Drop-in for shadcn Dialog. Use <ResponsiveDialog><ResponsiveDialogTrigger>…</ResponsiveDialogTrigger><ResponsiveDialogContent>…</ResponsiveDialogContent></ResponsiveDialog>. On mobile renders as Sheet sliding from bottom; on desktop as centered Dialog. Threshold via useMediaQuery('(min-width: 768px)').",
    previewPath: "/preview/slices/responsive-dialog",
    defaultView: "tablet",
    defaultZoom: 0.85,
    variants: [
      { title: "modal", desc: "Standard centered dialog with backdrop." },
      { title: "panel", desc: "Edge-anchored sheet on both viewports — for settings, filters." },
      { title: "alert", desc: "Tighter, destructive-confirm flavor. Disable backdrop dismiss." },
    ],
    wiring: `import {
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/features/responsive-dialog";

<ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
  <ResponsiveDialogHeader>
    <ResponsiveDialogTitle>Konfirmasi</ResponsiveDialogTitle>
  </ResponsiveDialogHeader>
  <ResponsiveDialogBody>…</ResponsiveDialogBody>
  <ResponsiveDialogFooter>
    <Button onClick={onSubmit}>Lanjut</Button>
  </ResponsiveDialogFooter>
</ResponsiveDialog>`,
  },
  {
    slug: "dashboard-shell",
    title: "Dashboard Shell — one responsive shell + mobile dock",
    category: "ui",
    kind: "ui",
    version: "1.2.0",
    description:
      "THE dashboard chrome — one shell, three faces. Desktop: collapsible rail (shadcn Sidebar, ⌘B, cookie-persisted) + topbar. Mobile: NO sidebar at all — a bottom dock plus a thumbnail-tile menu drawer (drill-down one level for sub-items). Every face renders from ONE `nav` prop (groups → items → one level of sub-items), so the dock is derived, not a second nav to keep in sync — flag `dock: true` on the items you want down there, or let it take the first few. Slots for everything project-specific: sidebarHeader (workspace switcher), sidebarFooter (user menu), actions (search/notifications), topbar (full replace), secondary (narrow contextual column = the old three-column 'advanced' archetype). The dock is CSS (`md:hidden`); the rail + trigger read `isMobile` from shadcn's own useSidebar() — one breakpoint source, no second media query. Zero backend: `activePath` drives it from state, otherwise it reads usePathname(). Merged 2026-08-03 from the superspace facade + appshell's cockpit shell + the template `_shared` admin chrome.",
    source: "superspace",
    docsUrl: "",
    install: "",
    slicePath: "frontend/slices/dashboard-shell",
    convexPaths: [],
    npm: ["lucide-react"],
    shadcn: ["sidebar", "button", "separator", "sheet", "tooltip"],
    env: [],
    peers: [],
    tags: ["ui", "layout", "dashboard", "sidebar", "dock", "responsive", "shell"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "riset-kit", "cms-public-storefront"],
    agentRecipe:
      "Run `npx rr add dashboard-shell` (needs shadcn `sidebar` + `drawer` installed). Wrap app/(dashboard)/layout.tsx in <DashboardShell brand nav>. `nav` is the SSOT: [{ id, label?, items: [{ id, label, href|onSelect, icon?, badge?, exact?, dock?, items? }] }]. Mobile dock derives from it (dock:true items, else the first `dockMax` — a Menu button opening the tile drawer is appended; the rail is never rendered under md). Slots: sidebarHeader (workspace-shell switcher), sidebarFooter (user menu), actions (topbar right side, e.g. FullWidthToggle), topbar (full replace / null), secondary (contextual column). Pass activePath to drive it from state instead of the router. Helpers exported: isActive / deriveDock / activeItem / activeTitle / flattenNav.",
    previewPath: "/preview/slices/dashboard-shell",
    defaultView: "desktop",
    defaultZoom: 0.6,
    wiring: `import { DashboardShell } from "@/features/dashboard-shell";
import { FullWidthToggle } from "@/features/full-width-toggle";
import { FileText, Home, Settings } from "lucide-react";

const nav = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: Home, href: "/app", exact: true, dock: true },
      { id: "posts", label: "Posts", icon: FileText, href: "/app/posts", dock: true },
    ],
  },
  { id: "system", items: [{ id: "settings", label: "Settings", icon: Settings, href: "/app/settings" }] },
];

<DashboardShell brand={{ name: "Acme" }} nav={nav} actions={<FullWidthToggle />}>
  {children}
</DashboardShell>`,
  },
  {
    slug: "full-width-toggle",
    title: "Full Width Toggle",
    category: "ui",
    kind: "ui",
    version: "0.2.0",
    description:
      "Page-container width preference with contained, wide, and full modes. Persists per device in localStorage, synchronizes same-tab and cross-tab changes, and ships a toggle plus container wrapper. React/Next remains the default distribution; Svelte 5 / SvelteKit is available explicitly with --framework sveltekit.",
    source: "rr original",
    docsUrl: "",
    install: "npx rr add full-width-toggle",
    slicePath: "frontend/slices/full-width-toggle",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["ui", "layout", "preference", "localstorage", "dashboard"],
    agentRecipe:
      "Run `npx rr add full-width-toggle` for the React/Next default, or `npx rr add full-width-toggle --framework sveltekit` for Svelte 5/SvelteKit. Place <FullWidthToggle variant=\"icon|button|segment\" /> in an app-shell action slot and wrap page content in <WidthContainer as=\"main\">. Storage key is `layout:widthMode`; modes are contained, wide, and full, with same-tab plus cross-tab sync.",
    previewPath: "/preview/slices/full-width-toggle",
    defaultView: "desktop",
    defaultZoom: 0.7,
    wiring: `import { FullWidthToggle, WidthContainer } from "@/features/full-width-toggle";

<header className="flex justify-end">
  <FullWidthToggle variant="segment" />
</header>

<WidthContainer as="main">
  {children}
</WidthContainer>`,
  },
  {
    slug: "three-column",
    title: "Three-Column Layout — Sidebar/Content/Inspector",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "ThreeColumnLayoutAdvanced — collapsible left/right + resizable widths + responsive breakpoints + PanelSection compound (Header/Items/Footer) + per-panel footer slots. Models shadcn sidebar API for the panel interior. Pair with PanelGroup/PanelMenu/PanelSeparator primitives. Trigger ≠ header (V-wave separation rule).",
    source: "superspace",
    docsUrl: "",
    install: "",
    slicePath: "template-base/frontend/slices/three-column",
    convexPaths: [],
    npm: [],
    shadcn: ["sheet", "scroll-area", "separator", "tooltip"],
    env: [],
    peers: [],
    tags: ["ui", "layout", "three-column", "sidebar", "inspector", "panel-section", "responsive", "resizable"],
    usedBy: [],
    agentRecipe: "Run `npx rr add three-column`. <ThreeColumnLayoutAdvanced preset=\"feature\" storageKey persistState left={…PanelSection…} center={…PanelSection unstyled…} right={…PanelSection…} leftFooter centerFooter rightFooter />. Center column SHOULD pass `unstyled` to drop sidebar tokens — body is content surface. `storageKey` MUST differ per slice or persisted widths collide.",
    previewPath: "/preview/three-column-trio",
    defaultView: "desktop",
    defaultZoom: 0.7,
  },
  {
    slug: "broadcast-channel-sync",
    title: "BroadcastChannel — Cross-tab Sync",
    category: "data",
    kind: "ui",
    version: "0.3.0",
    description: "Same-origin cross-tab + cross-iframe state sync via BroadcastChannel API. Tiny, no backend, no install.",
    source: "Web Platform — BroadcastChannel API",
    docsUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API",
    install: "// no install — Web Platform API",
    slicePath: "frontend/slices/broadcast-channel-sync",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["realtime", "cross-tab", "broadcast-channel", "demo-pattern"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add broadcast-channel-sync` for React/Next or add `--framework sveltekit` for the Svelte store adapter. Use this for same-origin tab/iframe mirroring, not durable server data; production persistence still belongs in Convex or another backend.",
    previewPath: "/preview/slices/broadcast-channel-sync",
    wiring: `// React: useBroadcastSync("rr:counter", 0)
// Svelte: createBroadcastSyncStore("rr:counter", 0)
// BroadcastChannel is preferred; same-origin storage events are the fallback.`,
    defaultView: "tablet",
    defaultZoom: 0.8,
    compat: {
      templates: {
        "personal-brand-os": { status: "native", note: "Public ↔ Admin live sync wired in StoreProvider." },
        "agency-studio-os": { status: "warn", note: "Demo-only; not used by agency template by default." },
      },
    },
  },
  // ------------------------------------------------------------------
  // Promoted from recipes.ts (Phase 3 of docs/REFACTOR-PLAN.md, 2026-05-12).
  // All paths point to existing template-base content. Foundation slices —
  // depend on template-base/{shared,convex/lib} internals, slicePath rooted
  // at template-base/.
  // ------------------------------------------------------------------
  {
    slug: "rbac-roles",
    title: "RBAC — Roles & Permissions",
    category: "auth",
    kind: "full",
    version: "0.4.0",
    tagline: "RBAC engine: 6 role presets + wildcard permissions + <PermissionGate>. Props-driven. No Clerk.",
    description: "RBAC engine ported from superspace. 6 system role presets (owner/admin/manager/staff/client/guest with levels), dot-namespaced permissions with `*` / `feature.*` wildcard matching, and pure check helpers (resolvePermissions / hasPermission / roleHasPermission). Props-driven UI primitives: <PermissionGate>, usePermissions, <RoleBadge>, <PermissionMatrix>. Convex template ships a tenant-scoped rbac_roles table + checkPermission / requirePermission helpers + idempotent seedSystemRoles, with a PLATFORM_ADMIN_EMAILS superadmin bypass. Pair with `user-management` for the members / invites / roles-admin UI. @convex-dev/auth aware — no Clerk.",
    source: "superspace",
    slicePath: "frontend/slices/rbac-roles",
    convexPaths: ["convex/features/rbac_roles"],
    npm: [],
    shadcn: ["badge", "checkbox", "label"],
    env: [{ name: "PLATFORM_ADMIN_EMAILS", scope: "convex", description: "Comma-separated emails granted cross-tenant superadmin (`*`)." }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "RBAC checks resolve the authed user via getAuthUserId." }],
    tags: ["rbac", "auth", "permissions", "roles", "authorization", "no-clerk", "convex"],
    usedBy: ["personal-brand-os", "konsultan-os", "wirausaha-os"],
    agentRecipe: "Run `npx rr add rbac-roles`. Frontend: import { PermissionGate, usePermissions, RoleBadge, PermissionMatrix, resolvePermissions, ROLE_PRESETS } from \"@/features/rbac-roles\". Feed usePermissions/PermissionGate the actor's resolved permission list (from your membership query or resolvePermissions(roleSlug)). Convex: spread rbacRolesTables into your schema, call seedSystemRoles({tenantId}) once, gate privileged fns with requirePermission(ctx, tenantId, \"members.manage\"). Set PLATFORM_ADMIN_EMAILS for superadmins. Add the user-management slice for the members/invites UI (provides um_members).",
    previewPath: "/preview/slices/rbac-roles",
    defaultView: "desktop",
    defaultZoom: 0.7,
  },
  {
    slug: "user-management",
    title: "User Management",
    category: "auth",
    kind: "full",
    version: "0.7.0",
    tagline: "Members · invites · roles · teams · hierarchy · access matrix — tabbed, permission-gated. Props-driven.",
    description: "Full superspace-parity user management, props-driven + RBAC-agnostic. <UserManagementPanel> tabs Members + Roles + Teams + Access: member table (search / filter / sort, inline role dropdown, soft-remove), InviteDialog (with an optional 'propagate to sub-workspaces' toggle — same / step-down role strategy) + PendingInvites, a RolesPanel (custom roles via permission matrix; system roles read-only), a TeamsPanel (named user groups), and an AccessMatrix (users × tenants grid with inline role assignment). All permission-gated. You pass `roles` + `currentPerms` + the permission catalog (resolved from rbac-roles) + callbacks; the slice imports no other slice's frontend. Convex ships um_members + um_invites + um_teams + um_team_members + um_tenant_links + member / invite / team / hierarchy endpoints + getAccessMatrix (gated via rbac-roles' requirePermission); roles CRUD reuses rbac-roles'. The hierarchy is a generic edge tree — rr never owns the tenant entities. P0–P4c: the complete user-management epic.",
    source: "superspace",
    slicePath: "frontend/slices/user-management",
    convexPaths: ["convex/features/user_management"],
    npm: [],
    shadcn: ["avatar", "badge", "button", "checkbox", "dialog", "dropdown-menu", "input", "label", "select", "switch", "table", "tabs", "textarea"],
    env: [],
    peers: [
      { slug: "rbac-roles", range: "^0.2", reason: "Roles + resolved permissions + convex permission helpers (requirePermission, getActorPermissions)." },
      { slug: "convex-auth", range: "^0.1", reason: "Member identity (name/email/avatar) joined from the users table." },
    ],
    tags: ["user-management", "members", "rbac", "auth", "team", "admin", "convex", "no-clerk"],
    usedBy: [],
    agentRecipe: "Run `npx rr add user-management` (pulls rbac-roles + convex-auth). Frontend: <MembersPanel members={useQuery(api[\"features/user_management/query\"].listMembers,{tenantId})} roles={ROLE_PRESETS.map(r=>({slug:r.slug,name:r.name,color:r.color}))} currentPerms={actorPerms} onUpdateRole={useMutation(...updateMemberRole)} onRemove={useMutation(...removeMember)} onInvite={openInvite} />. Wire roles + currentPerms from rbac-roles at the app level — the slice itself imports no other slice. Convex: spread userManagementTables; listMembers/mutations gate via rbac-roles requirePermission.",
    previewPath: "/preview/slices/user-management",
    defaultView: "desktop",
    defaultZoom: 0.8,
  },
  {
    slug: "admin-panel",
    title: "Admin Panel — Unified Product Admin",
    category: "infra",
    kind: "full",
    version: "0.1.0",
    description: "17-section admin surface (events, funnels, attribution, users, A/B, flags, pricing, CMS, email, audit, ...) gated by RBAC. Auto-filters sidebar by tier (solo/influencer/organization) and user permissions. Single backend resolver (getMyAdminAccess) mirrors frontend gate so UI can never leak.",
    source: "superspace + spec",
    slicePath: "template-base/frontend/slices/admin-panel",
    convexPaths: ["template-base/convex/features/admin-panel"],
    npm: [],
    shadcn: ["card", "badge", "button"],
    env: [],
    peers: [
      { slug: "rbac-roles", range: "^0.1", reason: "Admin sections require RBAC perms — must seed roles first." },
      { slug: "dashboard-shell", range: "^0.1", reason: "AdminShell is the INNER section nav — mount AdminPage inside the dashboard-shell app chrome." },
    ],
    tags: ["admin", "owner", "platform", "rbac", "instrumentation", "panel"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add admin-panel`. Wrap pages with <AdminPage workspaceId tier>. AccessGate hides UI for non-admins, AdminShell renders 2-col layout with sidebar filtered by tier+perms. ADMIN_SECTIONS in config.ts is SSOT (17 entries). Personal-brand-os = tier 'solo' = owner sees everything.",
    previewPath: "/preview/slices/admin-panel",
    defaultView: "desktop",
    defaultZoom: 0.65,
  },
  {
    slug: "event-tracking",
    title: "Analytics",
    category: "data",
    kind: "backend",
    version: "0.2.0",
    description: "Framework-neutral analytics instrumentation contract. The host injects an EventTrackingCtx transport for event emit, guarded event queries, and funnel reads; the canonical slice ships no renderer or storage backend.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/event-tracking",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["events", "analytics", "instrumentation", "portable", "headless"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add event-tracking` (React/default) or `npx rr add event-tracking --framework sveltekit`. Bind EventTrackingCtx.track/query/funnel to your analytics transport; enforce authorization on query/funnel at the server boundary. The slice intentionally does not invent a UI or persistence backend.",
    wiring: `import { eventTrackingTools, type EventTrackingCtx } from "@/features/event-tracking";

const analytics: EventTrackingCtx = {
  track: (name, props) => hostAnalytics.track(name, props),
  query: (filters) => guardedAnalyticsQuery(filters),
  funnel: (steps) => guardedFunnelQuery(steps),
};

// Register eventTrackingTools with analytics in your tool host.`,
  },
  {
    slug: "icon-picker",
    title: "Icon Picker",
    category: "ui",
    kind: "ui",
    version: "0.6.0",
    tagline: "React + Svelte emoji/Lucide/Phosphor picker with shared search, tint, recents, and smart positioning.",
    description: "Framework-parity emoji + Lucide + Phosphor picker. React/Next remains default; native Svelte 5/SvelteKit keeps the same stored-value contract, curated catalogs, search, 10-color tint, recents, Twemoji/native preference, random/clear, keyboard grid navigation, and smart popover-to-dialog fallback over shared framework-neutral stores/handlers. React uses lucide-react + @phosphor-icons/react/shadcn; Svelte uses @lucide/svelte + phosphor-svelte and carries no React/Next/shadcn/agent runtime.",
    source: "open-silong",
    slicePath: "frontend/slices/icon-picker",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0", "@phosphor-icons/react@^2.1.10"],
    shadcn: ["popover", "dialog", "button", "input", "scroll-area", "tabs"],
    env: [],
    peers: [],
    tags: ["icon", "emoji", "lucide", "phosphor", "picker", "twemoji", "notion", "responsive", "svelte", "framework-parity"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "React/default: `npx rr add icon-picker`. SvelteKit: append `--framework sveltekit`. Store raw emoji, `lucide:Name`, or `phosphor:Name` with optional `?c=hex`; parse/build helpers are shared. Both renderers share recents/style/search/handler/tool cores. Use IconPicker/IconPickerPopover for smart floating UI, IconPickerInline for an existing sheet/dialog, and DynamicIcon for rendering stored values.",
    previewPath: "/preview/slices/icon-picker",
    defaultView: "tablet",
    defaultZoom: 0.9,
  },
  {
    slug: "activity",
    title: "Activity — public productivity log",
    category: "data",
    kind: "full",
    version: "0.4.0",
    description: "Public-facing weekly activity log. Lists user-facing activities grouped by ISO week with schema.org-friendly markup, designed to maximise SEO so the question 'what is <person> working on this week?' lands here. Convex-backed (schema + queries + unauthenticated mutations); MCP-friendly so AI workflows (Claude / GPT / custom agents) can append entries directly. All user-facing copy + per-category labels + date/time locale are prop-driven (English defaults). Lifted 2026-05-27 from rahmanef.com; 225-LOC view split into view + 2 sub-components + 4 lib helpers for the 200-LOC cap; Indonesian strings + custom primitives stripped; cross-slice auth import dropped (consumer wraps mutations).",
    source: "rahmanef.com",
    slicePath: "frontend/slices/activity",
    convexPaths: ["convex/features/activity"],
    npm: ["convex@^1.17", "lucide-react@^0.400.0", "next@^15", "react@^18"],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["activity", "productivity", "log", "now-page", "feed", "mcp", "seo", "personal-brand"],
    usedBy: ["rahmanef.com"],
    agentRecipe: "Run `npx rr add activity`. Spread `activityTables` into your root Convex schema. Wrap the unauthenticated `create`/`update`/`remove` `internalMutation`s with your auth model (see README Install section). Render `<ActivityFeed rows={await fetchQuery(api.activity.listPublic)} stats={await fetchQuery(api.activity.statsThisWeek)} />`. Override `copy`, `categoryLabels`, `locale` per consumer. MCP integration: map `activity_create` tool → your wrapped `create` mutation.",
    previewPath: undefined,
    defaultView: "desktop",
    defaultZoom: 0.85,
  },
  {
    slug: "rate-limit",
    title: "Rate Limit",
    category: "infra",
    kind: "backend",
    version: "0.4.0",
    description: "Backend-only Convex per-key request counter with atomic consume, server-owned namespace policy, optional server-key gate, and bounded cron pruning. The copied runtime/config/tool source is framework-neutral TypeScript: React/Next remains the default contract while explicit Svelte/SvelteKit installs reuse the same source with no duplicate UI or framework runtime dependency.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/rate-limit",
    convexPaths: ["convex/features/rate_limit"],
    npm: ["convex@^1.16.0"],
    shadcn: [],
    env: [{ name: "RATE_LIMIT_SERVER_KEY", scope: "convex", required: false, description: "Optional shared secret for server-only consume calls; recommended for user-facing or security-sensitive namespaces." }],
    peers: [],
    tags: ["infra", "rate-limit", "convex", "backend", "throttle"],
    usedBy: [],
    agentRecipe: "Run `npx rr add rate-limit` (or `--framework sveltekit`; both copy the same framework-neutral source). Compose `rateLimitTables` from `convex/features/rate_limit/_schema` into `convex/schema.ts`, add the namespace to the server-owned POLICY map, call `api.features.rate_limit.mutation.consume({ key, serverKey })` from server handlers, and wire `internal.features.rate_limit.mutation._pruneExpired` into `convex/crons.ts`. Set RATE_LIMIT_SERVER_KEY for sensitive namespaces and choose fail-open versus fail-closed behavior explicitly in the host wrapper.",
    previewPath: undefined,
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "testimonials",
    title: "Testimonials",
    category: "content",
    kind: "backend",
    version: "0.2.0",
    description: "Framework-neutral testimonials backend: bounded public list/get, server-authorized admin CRUD, and internal seed. React/Next remains the default distribution contract; explicit Svelte/SvelteKit installs reuse the same TypeScript + Convex source without invented UI.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/testimonials",
    convexPaths: ["convex/features/testimonials"],
    npm: ["convex@^1.16.0"],
    shadcn: [],
    env: [{ name: "SUPER_ADMIN_EMAIL", scope: "convex", required: false }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "requireAdmin uses getAuthUserId from @convex-dev/auth." }],
    tags: ["content", "testimonials", "convex", "backend", "marketing"],
    usedBy: [],
    agentRecipe: "Run `npx rr add testimonials` (or `--framework sveltekit`). Compose `testimonialsTables` into the root schema. Read from `api.features.testimonials.query.listAll` / `get` through the host Convex client; call `create` / `update` / `remove` only through authenticated admin flows because authorization is enforced server-side by `requireAdmin`.",
    previewPath: "/preview/slices/testimonials",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "services",
    title: "Services",
    category: "content",
    kind: "backend",
    version: "0.2.0",
    description: "Framework-neutral service-offerings backend: bounded public list/get, server-authorized admin CRUD, and internal seed. React/Next remains the default distribution contract; explicit Svelte/SvelteKit installs reuse the same TypeScript + Convex source without invented UI.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/services",
    convexPaths: ["convex/features/services"],
    npm: ["convex@^1.16.0"],
    shadcn: [],
    env: [{ name: "SUPER_ADMIN_EMAIL", scope: "convex", required: false }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "requireAdmin uses getAuthUserId from @convex-dev/auth." }],
    tags: ["content", "services", "convex", "backend", "marketing", "agency"],
    usedBy: [],
    agentRecipe: "Run `npx rr add services` (or `--framework sveltekit`). Compose `servicesTables` into the root schema. Read from `api.features.services.query.listAll` / `get` through the host Convex client; call `create` / `update` / `remove` only through authenticated admin flows because authorization is enforced server-side by `requireAdmin`.",
    previewPath: "/preview/slices/services",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "create-your-mcp",
    title: "Create Your MCP",
    category: "ai",
    kind: "full",
    version: "0.4.1",
    description: "Framework-parity MCP/OAuth integration: React/Next remains the default admin UI and adapter, while explicit SvelteKit installs native Svelte 5 admin UI plus SvelteKit handler factories over the same OAuth 2.1 + PKCE, JSON-RPC, Convex token backend, scope enforcement, and static MCP_API_KEY fallback. Shared HTTP behavior uses Web Request/Response primitives; host adapters stay thin.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/create-your-mcp",
    convexPaths: ["convex/features/create_your_mcp"],
    npm: ["convex@^1.16.0", "class-variance-authority@^0.7.1"],
    shadcn: ["button"],
    env: [
      { name: "MCP_API_KEY", scope: "server", required: false, description: "Static bearer for service-account / CI access. Min 32 chars. Must match Convex env." },
      { name: "MCP_OAUTH_ALLOWED_HOSTS", scope: "convex", required: false, description: "CSV vendor domains for redirect_uri (chatgpt.com,claude.ai,cursor.sh)." },
      { name: "MCP_OAUTH_ALLOWED_PATH_PREFIXES", scope: "convex", required: false, description: "CSV path prefixes under allowed hosts (/aip/,/connector/,/oauth/)." },
      { name: "NEXT_PUBLIC_SITE_URL", scope: "next-public", required: true, description: "Public site origin for OAuth/MCP discovery and setup UI; route handlers can fall back to request origin." },
    ],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "requireAdmin uses getAuthUserId from @convex-dev/auth." }],
    tags: ["ai", "mcp", "oauth", "pkce", "chatgpt", "claude", "cursor", "convex", "integration", "svelte", "framework-parity"],
    usedBy: [],
    agentRecipe: "Run `npx rr add create-your-mcp` for React/Next or add `--framework sveltekit` for native Svelte 5. Compose `createYourMcpTables` from `convex/features/create_your_mcp/_schema`. Next: move the two route adapters into `app/api`. SvelteKit: create `+server.ts` endpoints from `createSvelteKitMcpHandlers` and `createSvelteKitOauthTokenHandlers`. Mount the framework-native `McpAdminView`, wire adminList/revokeToken through your authenticated Convex client, and set MCP_OAUTH_ALLOWED_HOSTS for remote OAuth redirects.",
    previewPath: "/preview/slices/create-your-mcp",
    defaultView: "desktop",
    defaultZoom: 0.75,
  },
  {
    slug: "contact-form-resend",
    title: "Contact Form + Resend",
    category: "integrations",
    kind: "full",
    version: "0.1.0",
    description: "Contact form posting to Resend email API. Server Action + Zod input validation. Convex mutation for storage + Resend send.",
    source: "cescadesigns",
    slicePath: "template-base/frontend/slices/contact-form-resend",
    convexPaths: [],
    npm: ["resend@^4.0.0", "framer-motion@^11.0.0"],
    shadcn: ["card", "button", "input", "label", "textarea"],
    env: [{ name: "RESEND_API_KEY", scope: "convex", required: true }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Optional — anonymous submission works without auth." }],
    tags: ["form", "email", "resend", "convex"],
    usedBy: [],
    agentRecipe: "Run `npx rr add contact-form-resend`. Wire contactMessages.send mutation in convex/. Server emails via Resend from form@yourdomain.com. Always validate inputs with Zod or v.* server-side. Anonymous allowed.",
    previewPath: "/preview/slices/contact-form-resend",
    defaultView: "mobile",
    defaultZoom: 1,
  },
  {
    slug: "admin",
    title: "Admin — generic shell + composed console",
    category: "infra",
    kind: "full",
    version: "0.4.0",
    tagline: "React + Svelte admin parity in 2 variants — generic shell or composed 26-section console, with exact per-variant Convex boundaries.",
    description: "Framework-parity access-gated admin surfaces behind one slug. React/Next remains default; native Svelte 5/SvelteKit provides shell + console over the same access rules, 26-section catalog, mock contracts, ?section= deep-link semantics, registry stats core, and Convex backends. shell is the generic AdminPage + buildAdminStats surface over convex/features/admin. console is the composed 26-section AdminConsole with five owned sections and host-injected peer panels over convex/features/admin_console. Svelte injects provider panels as snippets and imports no React/Lucide/shadcn. Variant installs keep backend and env gating exact.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/admin",
    convexPaths: ["convex/features/admin", "convex/features/admin_console"],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["badge", "button", "card", "input", "progress", "scroll-area", "select", "sheet", "table", "textarea"],
    env: [
      { name: "SUPER_ADMIN_EMAIL", scope: "convex", required: false, description: "shell variant — single super-admin gate." },
      { name: "PLATFORM_ADMIN_EMAILS", scope: "convex", required: false, description: "console variant — comma-separated platform-admin allowlist." },
    ],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "requireAdmin gate uses convex-auth identity." },
      { slug: "rbac-roles", range: "^0.1", reason: "console section gates are permission tokens resolved by rbac-roles." },
    ],
    variants: [
      { title: "shell", desc: "React: npx rr add admin shell. Svelte: add --framework sveltekit. Generic AdminPage + buildAdminStats; convex/features/admin only." },
      { title: "console", desc: "React: npx rr add admin console. Svelte: add --framework sveltekit. Composed 26-section console; convex/features/admin_console only." },
    ],
    tags: ["infra", "admin", "console", "shell", "dashboard", "composition", "rbac", "access-gate", "registry", "svelte", "framework-parity"],
    usedBy: [],
    agentRecipe: "React/default: `npx rr add admin shell|console`. SvelteKit: append `--framework sveltekit`. shell reuses resolveAdminLabels/buildAdminStats and pulls only convex/features/admin. console reuses the same access/catalog/URL core, includes five owned panels, and receives provider panels through React components or Svelte snippets; it pulls only convex/features/admin_console. Keep remote/admin routes server-gated; UI access filters are not an authorization boundary.",
    previewPath: "/preview/slices/admin",
    defaultView: "desktop",
    defaultZoom: 0.62,
  },
  {
    slug: "platform-admin",
    title: "Platform Admin — Control Plane Contract",
    category: "infra",
    kind: "backend",
    version: "0.3.0",
    description: "Framework-neutral privileged control-plane tool contract. The host injects metrics, feature-flag, and tenant-tier operations through PlatformAdminCtx and owns auth, authorization, tenancy, persistence, and audit enforcement; the canonical slice ships no renderer or Convex schema.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/platform-admin",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["infra", "admin", "control-plane", "headless", "portable"],
    usedBy: [],
    agentRecipe: "Run `npx rr add platform-admin` (React/default) or `npx rr add platform-admin --framework sveltekit`. Bind PlatformAdminCtx.metrics/setFeatureFlag/setTier to server-authorized host operations. The slice intentionally does not invent tenant tables, KPI dashboards, routes, or a renderer.",
  },
  {
    slug: "audit-log",
    title: "Audit Log — Workspace Events",
    category: "infra",
    kind: "backend",
    version: "0.4.0",
    description: "Backend-only audit event recorder with framework-neutral TypeScript. createAuditLogger injects tenant/actor identity and preserves action/entity/diff/metadata/IP/user-agent evidence through host bindings; read-only query/export tools remain server-gated. React/Next stays the default contract while explicit Svelte/SvelteKit installs reuse the same source with no duplicate UI or framework runtime dependency.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/audit-log",
    convexPaths: ["convex/features/audit-log"],
    npm: [],
    shadcn: [],
    env: [],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Event actor resolved via authenticated user." }],
    tags: ["infra", "audit", "compliance", "logging"],
    usedBy: [],
    agentRecipe: "Run `npx rr add audit-log` (or `--framework sveltekit`; both copy the same framework-neutral source). Create a logger with `createAuditLogger(tenantAdapter, bindings)` and call it inside server-checked mutations/actions with `{ action, entityType, entityId, diff?, metadata?, ipAddress?, userAgent? }`. TenantAdapter resolves tenant + actor; the consumer binding enforces `audit.write`. Agent tools `audit-log.query` and `audit-log.export` are read-only and the supplied list binding must enforce `audit.read` server-side.",
    previewPath: "/preview/slices/audit-log",
    defaultView: "desktop",
    defaultZoom: 0.7,
  },
  {
    slug: "comments",
    title: "Comments — Threaded",
    category: "content",
    kind: "full",
    version: "0.4.0",
    description: "Polymorphic-target threaded comments. Consumer picks `TargetRef = { kind, id, subId? }` (e.g. page+block, blog+slug, task+id). Reply nesting is real: `parentId` end-to-end + `buildThread(flat) → CommentNode[]` tree (oldest-first, orphan-safe). Renderless <CommentsThread> + <CommentsAnchor> wrappers; useComments(bindings, opts) returns items + `tree` + openCount + CRUD + forbiddenWords guard. Adapter pattern — see contract-negotiations §1.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/comments",
    convexPaths: ["convex/features/comments"],
    npm: [],
    shadcn: ["button", "textarea", "avatar"],
    env: [],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Comment author identity from convex-auth." }],
    tags: ["content", "social", "comments", "threaded", "annotations"],
    usedBy: [],
    agentRecipe: "Run `rr add comments`. Wire Convex bindings ({ list, create, update, resolve, remove }) then use <CommentsThread target={{ kind, id, subId? }} bindings={bindings} forbiddenWords={[...]}>{render-prop}</CommentsThread> OR <CommentsAnchor target=... bindings=... pathMap={(t)=>...}>. v0.2.0 polymorphic — pick `kind` literal per host domain.",
    previewPath: "/preview/slices/comments",
    defaultView: "mobile",
    defaultZoom: 1,
  },
  {
    slug: "seo",
    title: "SEO — AI Metadata Generator",
    category: "content",
    kind: "full",
    version: "0.3.0",
    description: "Service slice for SEO metadata generation — Anthropic-backed action with per-user 24h cost guard + portable persona prop. No public route. Backend exposes generate + generateAndApply mutations gated by requireAdmin; consumers inject brand voice via the personaContext arg (or buildSeoSystemPrompt factory).",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/seo",
    convexPaths: ["convex/features/seo"],
    npm: [],
    shadcn: [],
    env: [{ name: "ANTHROPIC_API_KEY", scope: "server", required: true }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Cost guard + requireAdmin gates use convex-auth user identity." }],
    tags: ["content", "seo", "ai", "anthropic", "metadata-generator"],
    usedBy: [],
    agentRecipe: "Run `rr add seo`. Call seo.generate from server actions or admin mutations with `personaContext` describing your brand voice (or rely on the generic default). Cost guard rate-limits per-user within 24h via callsInWindow query.",
    previewPath: "/preview/slices/seo",
    defaultView: "tablet",
    defaultZoom: 0.8,
  },
  {
    slug: "publisher-clean-html",
    title: "Publisher — clean HTML",
    category: "content",
    kind: "ui",
    version: "0.2.0",
    tagline: "Render a node tree to standalone, framework-runtime-free HTML with one deduped CSS bundle + layered sanitization (HTML/CSS/CSP + injectable DOMPurify). Zero deps, no Convex.",
    description: "A framework-neutral clean-HTML engine with schema-typed escaping/sanitization, CSS deduplication, inline-style guards and deterministic CSP planning. React/Next remains the default preview distribution; Svelte/SvelteKit adds a native sandboxed preview while reusing all 16 canonical TypeScript core files through verified sharedFiles, so the renderer and security spine are not forked. Richtext/SVG sanitization remains injectable and fail-closed without a configured DOMPurify runtime. Stateless, env-free, no Convex.",
    source: "rahman-resources",
    slicePath: "frontend/slices/publisher-clean-html",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["content", "publisher", "html", "static-export", "sanitization", "csp", "css-dedup", "render"],
    usedBy: [],
    agentRecipe: "Run `npx rr add publisher-clean-html` for React/Next or add `--framework sveltekit` for the Svelte preview. Build a ModuleRegistry, call publishPage(tree, registry, options), and preview the resulting full HTML document with PublishPreview. Both framework adapters share the exact same renderer/sanitizer/CSP core. Enable rich HTML/SVG by configuring DOMPurify once; without it those paths stay fail-closed.",
    previewPath: "/preview/slices/publisher-clean-html",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "content-loops",
    title: "Content Loops",
    category: "content",
    kind: "ui",
    version: "0.2.0",
    tagline: "Data-source-driven repeater: register pluggable sources, render one component per item, round-robin across variants, none/infinite pagination — no backend required.",
    description: "A data-source-driven repeater harvested from the Instatic CMS base.loop engine, decoupled from its publisher / page-tree / entryStack machinery into a plain React slice. Register pluggable LoopEntitySource backends (each declares display fields + an async fetch returning { items, totalItems }); drop <ContentLoop source|sourceId filters orderBy variants={[A, B]} /> to render one component per item, round-robining items across variants so alternating / featured layouts need no per-item branching. Ships a namespaced source registry (ids must be 'ns.name', so consumer sources can't shadow each other), createMockLoopSource for env-free previews + tests, and none/infinite pagination via useLoopPagination (a shadcn Load more button accumulates pageSize chunks). LoopItem.fields is a generic resolved-value bag — variants read item.fields.title directly, no second lookup. UI-only: no Convex tables shipped; point a source's fetch at Convex/REST when you have a backend. First slice of the feature-harvest ULTRAPLAN (docs/feature-harvest) and a dependency of the planned site-templates-engine + visual-page-canvas.",
    source: "rahman-resources",
    slicePath: "frontend/slices/content-loops",
    convexPaths: [],
    npm: [],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["content", "loop", "repeater", "list", "data-source", "pagination", "variants"],
    usedBy: [],
    agentRecipe: "Run `npx rr add content-loops`. Env-free demo: createMockLoopSource() then <ContentLoop source={s} pagination='infinite' pageSize={6} variants={[CardA, CardB]} /> — variants round-robin (item i -> variants[i % n]). Real source: implement LoopEntitySource { id: 'blog.posts' (namespaced 'ns.name'), fields, async fetch({ filters, orderBy, direction, limit, offset }) returns { items, totalItems } }, call loopSourceRegistry.registerOrReplace(source), then <ContentLoop sourceId='blog.posts' variants={[...]} />. item.fields holds RESOLVED values — resolve media/author inside fetch.",
    previewPath: "/preview/slices/content-loops",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "markdown",
    title: "Markdown — page container with CRUD tabs + diagrams",
    category: "content",
    kind: "ui",
    version: "0.4.0",
    tagline: "Framework-parity Markdown: Read / Write / Review, shared grammar/comments, Mermaid + KaTeX, React Recharts or native Svelte SVG charts.",
    description: "Framework-parity Markdown page container with Read / Write / Review surfaces over one shared parser, inline tokenizer, comment model, tab model, snippet registry, list grouping and chart-spec parser. React keeps the existing shadcn/Lucide UI, lazy Mermaid/KaTeX and lazy Recharts canvas. Svelte 5/SvelteKit ships native controls and native SVG bar/line/area/pie charts, so it needs only svelte + katex + mermaid and never pulls React/Lucide/shadcn/Recharts. Both render headings, lists/todos, GitHub-style callouts, fenced code, Mermaid, chart fences, KaTeX, tables, images, toggles and inline marks. Same grammar as the notion blocksToMarkdown / markdownToBlocks bridge; no store or Convex required.",
    source: "rahman-resources",
    slicePath: "frontend/slices/markdown",
    convexPaths: [],
    npm: ["katex@^0.16", "mermaid@^11", "recharts@^3", "lucide-react@^0.400.0"],
    shadcn: ["button", "tabs", "textarea"],
    env: [],
    peers: [],
    tags: ["content", "markdown", "reader", "editor", "review", "comments", "mermaid", "chart", "rich-text", "docs", "notion-sync"],
    usedBy: [],
    agentRecipe: "Run `npx rr add markdown` for React/default or `npx rr add markdown --framework sveltekit`. Read-only: MarkdownReader. Full surface: MarkdownPage with read/write/review plus optional content/comment callbacks; omit callbacks for standalone local state. Mermaid and KaTeX lazy-load in both; chart fences use lazy Recharts in React and native SVG in Svelte. The notion blocksToMarkdown/markdownToBlocks bridge speaks the same grammar.",
    previewPath: "/preview/slices/markdown",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "notion-app",
    title: "Notion App — Block Editor",
    category: "content",
    kind: "full",
    version: "1.1.1",
    tagline: "The notion-page-clone block editor as a portable slice: slash menu, markdown triggers, drag, per-block toolbar — host capabilities invert through an EditorAdapter seam.",
    description: "Nested vertical slice (slice-of-slices) housing the full notion-page-clone block editor. Mount <PageEditor pageId/> inside <EditorAdapterProvider adapter/> — with `{}` it is a working plain-text/markdown block editor (slash menu, markdown triggers `# - > [] etc.`, dnd-kit drag with column layouts, per-block toolbar with turn-into/color/duplicate, per-block undo, paste-markdown import); host capabilities light up per optional adapter: data (block+page CRUD), selection (multi-select), comments (per-block popover), ai (Ask-AI panel), database (render + picker), mention (@-typeahead), page (nav/uploads/covers). Cluster-private shared layer under @notion/* — vendored block/page/database model, uid, inline markdown, page→md/html export. Pure convex block helpers (_blocks/_blockOps, unit-tested) ship in convex/features/notion. Same markdown grammar as the standalone `markdown` slice (blocksToMarkdown/markdownToBlocks bridge).",
    source: "notion-page-clone",
    slicePath: "frontend/slices/notion-app",
    convexPaths: ["convex/features/notion"],
    npm: ["sonner@^2", "@dnd-kit/core@^6", "@dnd-kit/sortable@^10", "@dnd-kit/utilities@^3", "katex@^0.16"],
    shadcn: ["button", "dropdown-menu", "popover", "separator", "checkbox", "input", "switch", "skeleton"],
    env: [],
    peers: [],
    tags: ["content", "notion", "editor", "block-editor", "rich-text", "slash-menu", "drag-drop", "adapter-seam"],
    usedBy: [],
    agentRecipe: "Run `npx rr add notion-app`. Wire the `@notion/*` path alias to `./slices/notion-app/*` in tsconfig. Minimal mount: `<EditorAdapterProvider adapter={{ data }}><PageEditor pageId={id}/></EditorAdapterProvider>` where `data` implements EditorDataAdapter (block+page CRUD over your store — see lib/dataAdapter.ts; a localStorage reference impl lives in the rr preview). Add capabilities incrementally: `selection` for multi-select, `comments` for per-block threads, `database.renderDatabase` to mount your database renderer inside database blocks, `mention.search` for @-typeahead, `page.navigateToPage`/`uploadFile` for nav + media. Convex hosts: copy convex/features/notion (_blocks/_blockOps are pure, unit-tested array ops) and keep handlers thin.",
  },
  {
    slug: "sections",
    title: "Sections — composable marketing/landing sections",
    category: "content",
    kind: "ui",
    version: "0.5.0",
    tagline: "Framework-parity landing composition: admin CRUD + config-driven stats/testimonials/pricing/FAQ/newsletter/custom renderers.",
    description: "Canonical landing composition with one framework-neutral reducer, LandingStore adapter, ordering helpers, editor field schema, types, seed factory, and safe config parser. React/Next remains the default distribution and is now self-contained (local CRUD/motion/section-head; no template-shared or Next Link dependency). Explicit Svelte 5/SvelteKit installs native LandingProvider, LandingView, LandingEditorView, LandingSectionShell, StatsSection, TestimonialsSection, FaqSection, PricingSection, NewsletterSection, and CustomSection over the same core. v0.5.0 also fixes the previously broken installer source path from frontend/slices/landing-sections to frontend/slices/sections.",
    source: "rahman-resources (lifted from _templates fleet)",
    slicePath: "frontend/slices/sections",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0", "embla-carousel-autoplay@^8.6.0"],
    shadcn: ["accordion", "badge", "button", "card", "carousel", "dialog", "input", "switch", "table", "textarea"],
    env: [],
    peers: [],
    tags: ["admin", "landing", "cms", "sections", "crud", "renderer", "svelte", "framework-parity"],
    usedBy: ["saas-marketing-os", "personal-brand", "agency-studio", "konsultan-os", "kreator-studio", "wirausaha-os", "riset-kit"],
    agentRecipe: "Run `npx rr add sections` for React/default or `npx rr add sections --framework sveltekit`. Wire a LandingStore adapter ({items, publicBase, adminBase, create, update, remove}), then mount LandingView/LandingEditorView directly or through LandingProvider. Fold landingReducer into your host store and seed with defaultLandingSections(). Public pages map enabled LandingSection rows to the shipped stats/testimonials/pricing/faq/newsletter/custom renderers (or host renderers for hero/features/blog/etc.) inside LandingSectionShell. Both frameworks share the reducer, ordering, field schema, types and config parser. React is self-contained apart from declared npm/shadcn primitives; Svelte needs only svelte@^5.",
  },
  {
    slug: "motion-kit",
    title: "Motion Kit — scroll reveals, carousel, accordion, micro-interactions",
    category: "ui",
    kind: "ui",
    version: "0.2.0",
    tagline: "One motion vocabulary across React and Svelte: shared reveal/easing/CSS core + native carousel and accordion surfaces.",
    description: "Framework-parity motion primitives over one shared observer/easing/CSS core. React/Next remains the default distribution with Embla React + Radix; Svelte 5/SvelteKit adds native Reveal, Stagger, CountUp, Marquee, Embla-core Carousel, and accessible Accordion without React/Lucide/Radix runtime leakage. Reveal/count/marquee/accordion motion is reduced-motion aware, the Svelte carousel explicitly destroys its Embla instance on unmount, and globals-motion.css stays the single style contract.",
    source: "rahman-resources (lifted from _templates fleet)",
    slicePath: "frontend/slices/motion-kit",
    convexPaths: [],
    npm: ["embla-carousel-react@^8.6.0", "embla-carousel-autoplay@^8.6.0", "radix-ui@^1.4.3", "lucide-react@^0.400.0"],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["ui", "motion", "animation", "scroll", "reveal", "carousel", "accordion", "marquee", "countup", "embla", "svelte"],
    usedBy: ["saas-marketing-os", "personal-brand", "agency-studio", "konsultan-os", "kreator-studio", "wirausaha-os", "riset-kit", "notion-page-clone"],
    agentRecipe: "Run `npx rr add motion-kit` for React/default or `npx rr add motion-kit --framework sveltekit`. Append the copied `globals-motion.css` to the host global stylesheet. Both frameworks expose Reveal/Stagger/CountUp/Marquee + Carousel/Accordion; Svelte uses native Svelte 5 and Embla core with lifecycle cleanup, while React keeps Embla React + Radix. Optional autoplay comes from embla-carousel-autoplay.",
    previewPath: "/preview/slices/motion-kit",
    defaultView: "desktop",
  },
  {
    slug: "storefront-checkout",
    title: "Storefront Checkout — guest cart + checkout composition",
    category: "content",
    kind: "ui",
    version: "0.3.0",
    tagline: "Keranjang guest (localStorage) + sheet + ringkasan checkout. Host re-prices server-side; pasangkan dengan doku-payment untuk step bayar.",
    description: "Guest-friendly persisted cart with one framework-neutral cart store. React/Next keeps CartProvider + shadcn/Lucide CartWidget/CheckoutSummary; Svelte/SvelteKit ships a native store, cart sheet, and checkout summary over the same quantity, localStorage, count/subtotal, IDR-format and agent-tool semantics. Client prices remain display-only: the host MUST re-price every line server-side before creating payment. Optional payment peer owns the actual payment step.",
    source: "wirausaha-os guest-checkout build-out 2026-06-10",
    slicePath: "frontend/slices/storefront-checkout",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["badge", "button", "card", "separator", "sheet"],
    env: [],
    peers: [
      {
        slug: "payment",
        range: "^0.4",
        reason: "Optional payment step — checkout page composes DokuDirectForm + DokuPaymentInstructions (or swap midtrans-payment).",
      },
    ],
    tags: ["ecommerce", "cart", "checkout", "guest", "storefront", "payment", "localStorage", "sheet"],
    usedBy: ["wirausaha-os"],
    agentRecipe: "Run `npx rr add storefront-checkout` (or `--framework sveltekit`). Wrap your public layout once with `<CartProvider storageKey=\"my-shop-cart\">` and mount `<CartWidget checkoutHref=\"/checkout\" />` in the header extras. On product surfaces call `useCart().add({ slug, name, price, priceLabel, emoji })` with a host-resolved NUMERIC price. Build a /checkout route composing `<CheckoutSummary />` + a payment form (doku-payment's DokuDirectForm): its onSubmit calls YOUR Convex place-order action which re-prices each {slug, qty} from your catalog table server-side, generates an unguessable orderId, calls api.features.payment.actions.doku.createDirectPayment, records your domain order row, and returns { ok, orderId, instructions, expiresAt } ({ ok:false, notice } when DOKU creds are unset — surface it in the form and offer a contact fallback). After success render DokuPaymentInstructions + reactive status via api.features.payment.query.getOrderByOrderId. Reference: template-wirausaha-os convex/checkout.ts + slices/checkout/CheckoutPage.tsx.",
    previewPath: "/preview/slices/storefront-checkout",
    defaultView: "desktop",
    defaultZoom: 0.9,
  },
  {
    slug: "theme-presets",
    title: "Theme Presets — unified switcher with bundled tweakcn registry",
    category: "ui",
    kind: "ui",
    version: "0.5.0",
    tagline: "ONE switcher: light/dark/system + ~30 color presets in one Popover. Registry ships inside the slice — no public/ setup.",
    description: "Runtime tweakcn color presets with React/Next kept as the default distribution and native Svelte 5/SvelteKit provider, switcher, site-default-save, display-mode, and theme-color adapters over one shared preset engine. Visitor choice resolves above site default above host default; registry-data.json stays bundled and lazy-loaded; grouping, swatches, CSS injection, persistence, preview/restore, and agent tools remain one framework-neutral source. React display mode uses next-themes; Svelte uses a browser-native light/dark/system adapter.",
    source: "CareerPack + notion-page-clone",
    slicePath: "frontend/slices/theme-presets",
    convexPaths: [],
    npm: ["next-themes@^0.4.6", "lucide-react@^0.400.0"],
    shadcn: ["button", "popover"],
    env: [],
    peers: [],
    tags: ["ui", "theme", "tweakcn", "color", "preset", "switcher", "popover", "next-themes", "svelte", "sveltekit"],
    usedBy: [],
    agentRecipe: "React/Next: `npx rr add theme-presets`, mount `<ThemeProviders>` or `<ThemePresetProvider>` inside next-themes and use `<ThemePresetSwitcher />`. SvelteKit: `npx rr add theme-presets --framework sveltekit`; mount `<ThemeProviders>` for preset + light/dark/system context, then `<ThemePresetSwitcher />`, optional `<ThemeColorSync />`, and `<SaveSiteDefaultButton onSave={...} />`. Both distributions share visitor > site > host default resolution, registry-data.json, CSS injection, grouping/swatches, preview/restore and agent tools. Tailwind 4 globals must map `--color-*` directly from runtime variables (see README/HOST-SETUP).",
    previewPath: "/preview/slices/theme-presets",
    defaultView: "desktop",
    defaultZoom: 0.9,
  },
  {
    slug: "site-setup-wizard",
    title: "Site Setup Wizard — first-run site setup",
    category: "ui",
    kind: "ui",
    version: "0.3.0",
    tagline: "Post-claim setup wizard: identitas, branding + theme preset live-preview, seed konten — semua props-driven, zero backend lock-in.",
    description: "Post-claim onboarding wizard for clone-to-own templates. React/Next remains the default UI while Svelte 5/SvelteKit gets a native Identitas / Branding / Konten / Selesai flow over one framework-neutral step, field, preset, validation, save-payload and agent-tool core. Host callbacks still own save, seed, upload and theme-preview behavior; no backend is invented. Branding keeps grouped preset swatches, live preview, brand color/mode, optional logo/favicon upload and Analytics ID.",
    source: "personal-brand-os",
    slicePath: "frontend/slices/site-setup-wizard",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "card", "input", "label", "progress", "select"],
    env: [],
    peers: [],
    tags: ["ui", "onboarding", "wizard", "setup", "first-run", "branding", "theme", "clone-to-own", "templates"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add site-setup-wizard`. Show from your admin gate when `setup.status().onboarded === false`: `<OnboardingWizard onDone={...} save={(f) => settingsUpsert(f)} seedSample={() => seedSample({})} seeded={status?.seeded} ImageField={ImageField} presetOptions={presets} onPresetPreview={(n) => preview(n)} />`. `save` receives Partial<OnboardingFields> + `markOnboarded: true` — back it with a `settings.upsert` mutation that patches only provided fields. Theme bridge (optional): with the theme-presets slice installed build `presetOptions` from `groupTweakcnPresets(registry.items)` + `tweakcnSwatches(p)` and pass `useThemePreset().preview` as `onPresetPreview` — the picker then live-previews while the user browses and `Lewati setup` reverts via `onPresetPreview(null)`. Omit `presetOptions` to hide the picker entirely; omit `ImageField` to hide logo/favicon upload. Full wiring recipe in the slice's HOST-SETUP.md.",
    previewPath: "/preview/slices/site-setup-wizard",
    defaultView: "desktop",
    defaultZoom: 0.9,
  },
  {
    slug: "file-upload",
    title: "File Upload — pluggable upload + URL resolver with storage-adapter contract",
    category: "data",
    kind: "ui",
    version: "0.4.0",
    tagline: "Upload + URL resolver behind a storage adapter. localStorage demo, swap to Convex/S3.",
    description: "Host-pluggable file upload + URL resolution with React/Next kept as the default distribution and an additive Svelte 5/SvelteKit implementation. Both preserve FileRef parsing, upload/remove behavior, file chips, upload controls, demo localStorage storage, and bounded file tools. React adapters keep useUrl(); Svelte adapters use resolveUrl() plus optional subscribeUrl() so framework hook semantics stay isolated.",
    source: "notion-page-clone",
    slicePath: "frontend/slices/file-upload",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["data", "upload", "files", "storage", "adapter", "portable", "notion-like"],
    usedBy: [],
    agentRecipe: "Default React/Next: run `npx rr add file-upload`, wrap with `<FilesAdapterProvider adapter={...}>`, then use `<FileUploadButton>` / `<FileChip>` and the React hooks. Svelte/SvelteKit: run `npx rr add file-upload --framework sveltekit`, wrap with the Svelte `<FilesAdapterProvider>`, and implement `FilesAdapter` with upload + remove + resolveUrl plus optional subscribeUrl for live invalidation. The bundled localStorage adapter is demo-only; production hosts can target Convex/S3/GCS/R2. The dangerous `files.remove` tool remains server-checked and requires confirmation.",
    previewPath: "/preview/slices/file-upload",
    defaultView: "desktop",
    defaultZoom: 0.9,
  },
  {
    slug: "selection",
    title: "Selection — marquee multi-select + bulk actions",
    category: "ui",
    kind: "ui",
    version: "0.3.0",
    tagline: "Marquee rubber-band multi-select for any list. Drag-right encloses, drag-left crosses, bulk delete.",
    description: "Framework-agnostic multi-selection for any vertical list (Notion-style blocks, table rows, cards). Hold-and-drag on empty space draws a rubber-band rectangle — AutoCAD-style: drag RIGHT selects only fully-enclosed items (solid ring), drag LEFT selects anything the rectangle touches (dashed green ring). Click an item's edge to select (Shift = range, Cmd/Ctrl = toggle). Selecting activates items with a ring + data-block-selected attribute. Backspace/Delete bulk-deletes, Escape and click-outside clear, and a floating count toolbar offers Delete/Clear. SelectionProvider owns only the id set — the host owns the data via onBulkDelete(ids). Pairs with notion-shell (the notion-clone template wires it onto the editor); lifted from notion-page-clone's block-selection slice.",
    source: "notion-page-clone",
    slicePath: "frontend/slices/selection",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["ui", "selection", "marquee", "rubber-band", "multi-select", "bulk", "notion", "blocks", "list"],
    usedBy: ["notion-page-clone-os"],
    agentRecipe: "Run `npx rr add selection`. Zero deps (react-dom only). Wrap your list area in `<SelectionProvider onBulkDelete={(ids) => removeMany(ids)}>`, give the surface a `position: relative` div with a ref, drop `<SelectionMarquee containerRef={ref} />` inside it, and wrap each item in `<SelectableBlock id={item.id} orderedIds={allIds}>…</SelectableBlock>`. Hold-drag on empty space to rubber-band: drag RIGHT = window (only fully-enclosed, solid ring), drag LEFT = crossing (anything touched, dashed green). Edge-click an item to pick it (Shift = range, Cmd/Ctrl = toggle). Backspace/Delete bulk-deletes (focus outside a contentEditable), Escape + click-outside clear, floating `N selected · Delete · Clear` toolbar. Read state anywhere via `useSelection()`. The slice owns ONLY the id set — you own the data + the delete. Works on table rows / cards too, not just notion blocks.",
    previewPath: "/preview/slices/selection",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "notion-ui",
    title: "Notion UI — page editor · database · sidebar primitives",
    category: "ui",
    kind: "ui",
    version: "0.24.0",
    maturity: "beta",
    tagline: "Pure Notion-clone primitives in 3 variants — page editor · 11-view database · tree sidebar — over one shared domain-type model. Not the full app (that's `notion`).",
    description: "The pure, props-driven Notion-clone primitives suite behind one slug, over one shared domain-type model (Block / Page / Property / Database / DbView …). page: the page + block editor (NotionPage / NotionHeader / NotionBlock, SlashMenu, block renderers, inline-markdown decorator, built-in code (highlight.js) + equation (KaTeX)). database: a drop-in 11-view database (table/board/list/gallery/calendar/feed/chart/dashboard/form/map/timeline, 18 property/cell types, per-type column config, filter/sort/group/calculate, row peek + multi-select, cell drag-fill, formula engine, CSV/JSON import-export). sidebar: a standalone tree-nav sidebar (dnd reorder + reparent with depth projection, inline rename, per-row icon picker). All stateless + callback-CRUD — the host owns the data. Install one surface with `npx rr add notion-ui page|database|sidebar`, or all with `npx rr add notion-ui`; the shared/ domain type model is copied for every variant. NOT the full Notion app — that's the separate `notion` slice (adapter + Convex backed).",
    source: "notion-page-clone",
    slicePath: "frontend/slices/notion-ui",
    convexPaths: [],
    npm: ["@dnd-kit/core@^6", "@dnd-kit/sortable", "@dnd-kit/utilities", "katex@^0.16.45", "highlight.js@^11.11.1", "recharts@^3", "lucide-react"],
    shadcn: ["button", "checkbox", "dialog", "dropdown-menu", "input", "popover", "select", "separator", "sheet", "switch", "toggle-group", "tooltip"],
    env: [],
    variants: [
      { title: "page", desc: "npx rr add notion-ui page — page + block editor (NotionPage/NotionBlock, SlashMenu, renderers)." },
      { title: "database", desc: "npx rr add notion-ui database — 11-view database (NotionDatabase, filter/sort/group, formula, CSV/JSON)." },
      { title: "sidebar", desc: "npx rr add notion-ui sidebar — tree-nav sidebar (NotionSidebar, dnd reorder/reparent)." },
    ],
    peers: [],
    tags: ["ui", "notion", "notion-like", "database", "table", "board", "list", "gallery", "calendar", "feed", "chart", "dashboard", "form", "map", "timeline", "gantt", "kanban", "views", "filter", "sort", "property", "files", "person", "formula", "timestamp", "unique-id", "csv", "json", "import", "export", "template", "data", "backup", "primitive", "optional", "embeddable"],
    usedBy: ["notion-page-clone-os"],
    agentRecipe: "**Controlled component.** `<NotionDatabase />` renders the whole surface — 11 views (table, board, list, gallery, calendar, feed, chart, dashboard, form, map, timeline), 18 cell types, filter / sort / group / calculate, row peek + multi-select, table cell drag-fill, CSV / JSON import-export. It is 100% props-driven: it owns NO data state — you hold `db` + `rows` and persist every change callback. The view tab strip scrolls horizontally and the card clips to its border, so it stays inside any container width.\n\n**1. Install** — `npx rr add notion-ui database`. Cascades the `notion-shell` peer (the domain types live there). Components import from `@/features/notion-ui`; types from `@/features/notion-ui`.\n\n**2. Minimal wire-up** — keep `db: Database` + `rows: Page[]` in your store (a Convex query result or `useState`) and pass change handlers:\n```tsx\nimport { NotionDatabase } from '@/features/notion-ui';\n\n<NotionDatabase\n  db={db}\n  rows={rows}\n  onRowAdd={addRow}\n  onRowUpdate={(rowId, propId, value) => setValue(rowId, propId, value)}\n  onRowRemove={removeRow}\n  onPropertyAdd={addProperty}\n  onViewActivate={setActiveView}\n  onViewAdd={addView}\n  onViewConfigChange={(viewId, patch) => patchView(viewId, patch)}\n/>\n```\nOmit any callback and that affordance goes read-only; pass `readOnly` to freeze everything at once.\n\n**3. Data shape** — `Database = { id, name, properties: Property[], views: DatabaseViewConfig[], activeViewId }`; each row `Page = { id, title, rowProps: Record<propId, PropertyValue> }`. For `relation` / `rollup` cells also pass `pages` + `databases`; for `person` / `created_by` cells pass `userLookup(id)`.\n\n**4. Import / export** — mount `<DatabaseIOActions db={db} rows={rows} onImport={handleImport} />` in your toolbar: CSV/JSON in (with schema-diff), CSV/JSON + live-schema templates out. New columns arrive with a `tempId` — map it to your real backend id before writing their `rowProps`.\n\n**5. Backend (optional)** — the UI is store-agnostic. For Convex persistence copy `template-base/database-silong/convex/` (handlers → `convex/`, schema fragment merges into `convex/schema.ts`). Pick `_shared/minimal/` (single-user, noop authz) or `_shared/full/` (`@convex-dev/auth` + workspaces). See CONVEX-BACKEND.md.\n\n**Just one view?** Import it directly — `import { TableView } from '@/features/notion-ui'` — and feed it `rows` + `renderCell` + `renderColumnHeader`.",
    previewPath: "/preview/slices/notion-ui",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "image-picker",
    title: "Image Picker — one-button image/wallpaper chooser (gallery · upload · link · Unsplash · reposition)",
    category: "ui",
    kind: "ui",
    version: "0.4.0",
    maturity: "beta",
    tagline: "ONE button opens a dialog: gallery (colours/gradients/textures), upload, paste URL, Unsplash search. Set any image — wallpaper, cover, profile header. Props-driven, no backend lock-in.",
    description: "Generic image/wallpaper picker — not coupled to Notion. The headline API is ONE button (ImagePickerButton) that opens a dialog with 4 tabs: Gallery (12 colours + 8 gradients + Notion textures), Upload (drag/click, ≤8MB), Link (paste any https image URL), Unsplash (bundled curated landscapes + live search). On pick, onChange fires with an ImageValue ({ type, value, positionY?, metadata? }). ImageBanner is the optional reposition-able band — render an ImageValue as a full-width cover / profile header / card hero with hover controls: Change (opens the dialog), Reposition (drag the vertical focal point), Remove. The slice imports NO other slice and NO backend — the upload backend and Unsplash search are INJECTED as props (onUpload + searchUnsplash), so it drops into any app: wire onUpload to the `files` slice and searchUnsplash to a server route via unsplashSearchVia('/api/unsplash') that holds UNSPLASH_ACCESS_KEY server-side (never NEXT_PUBLIC). Ships a curated Unsplash fallback + gallery so it works with zero config. parseImage normalizes legacy raw-string values; imageStyle builds the focal-point CSS. Wired into the notion-page-clone template as the page cover via NotionPage's coverSlot. React/Next remains the default renderer; native Svelte 5/SvelteKit ships the same picker/dialog/banner behavior over shared portable image semantics.",
    source: "notion-page-clone",
    slicePath: "frontend/slices/image-picker",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["dialog", "button", "input"],
    env: [{ name: "UNSPLASH_ACCESS_KEY", scope: "server", required: false, description: "Server-side only (e.g. on the /api/unsplash route). Without it the Unsplash tab falls back to the curated set." }],
    peers: [],
    tags: ["ui", "image", "picker", "wallpaper", "cover", "upload", "unsplash", "gallery", "reposition", "files", "primitive", "portable", "dialog"],
    usedBy: ["notion-page-clone-os"],
    agentRecipe: "Run `npx rr add image-picker` for React/Next or `npx rr add image-picker --framework sveltekit` for native Svelte 5. The headline component is `<ImagePickerButton label=\"Change image\" onChange={(img)=>save(img)} onUpload={…} searchUnsplash={…} />` — ONE button that opens the 4-tab dialog (gallery / upload / link / Unsplash). For a reposition-able cover/hero band use `<ImageBanner image={value} onChange={save} resolvedUrl={…} onUpload={…} searchUnsplash={…} />` (also passable to notion-shell's `<NotionPage coverSlot={…} />`). Inject the backend: `onUpload` = the `files` slice's useFileUpload().upload (returns a FileRef); resolve upload images for display with `resolvedUrl` = files useFileUrl(parseFileRef(imageRef(parseImage(value))).storageId). `searchUnsplash` = `unsplashSearchVia('/api/unsplash')` — add a server route that proxies api.unsplash.com with UNSPLASH_ACCESS_KEY (never expose the key client-side). Ships a curated Unsplash + gallery fallback so it works with zero wiring. ImageValue = { type, value, positionY?, metadata? }; parseImage handles legacy string values.",
    previewPath: "/preview/slices/image-picker",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "workspace-shell",
    title: "Workspace Shell — atomic (workspace × menuSet) NavContext",
    category: "ui",
    kind: "full",
    version: "1.0.0",
    description: "Unified workspace + menu navigation primitive. NavContext = (workspaceId, menuSetId) atomic pair. 2-tier dropdown switcher (workspace radio + menuSet picker), ContextBadge header chip, full editor with tabs (menus / workspace tree / settings), tiered RBAC (admin menus.manage, user menus.fork). Replaces silo'd menu-store + workspace-store slices in superspace. Resolver chain: user nav-context cache > user assignment > workspace default > system. Source: superspace.",
    source: "superspace",
    docsUrl: "",
    install: "",
    slicePath: "template-base/frontend/slices/workspace-shell",
    convexPaths: ["template-base/convex/features/workspaceShell"],
    npm: [],
    shadcn: ["dropdown-menu", "popover", "command", "tabs", "switch"],
    env: [],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "User session required for menuSet assignment + nav-context cache." },
    ],
    tags: ["ui", "navigation", "workspace", "menu", "shell", "convex", "rbac"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "saas-marketing-os"],
    agentRecipe: "Run `npx rr add workspace-shell`. Tables prefixed `workspaceShell_*` (menuSets, menuItems, itemComponents, wsAssignments, userAssignments, rolePerms, navContext). Mount `<NavContextProvider workspaceId={wsId}>` inside your auth provider; use `useNavContext(wsId)` to read `{workspace, menuSet, source, effectiveMenuItems, setMenuSet, forkMenuSet}`. Drop-in `<WorkspaceSwitcher canFork />` in sidebar header. Tiered RBAC: `menus.manage` for workspace-default editing, `menus.fork` for user-personal copy. Resolver chain: user cache → user assignment → workspace default → none. Pair with audit-log slice for context-switch / fork events (graceful try/catch if absent). Effective items query applies role filter via workspaceShell_rolePerms (no rolePerms → show all, pre-RBAC compat).",
    previewPath: "/preview/slices/workspace-shell",
    defaultView: "desktop",
    defaultZoom: 0.85,
  },
  {
    slug: "library",
    title: "Library — resource hub (prompts · visuals · snippets · links)",
    category: "data",
    kind: "full",
    version: "0.3.0",
    description: "Grab-bag resource hub. One polymorphic `libraryItems` table holds six kinds — prompt, image, video, link, download, snippet — with per-kind payload fields switched on `kind` (no joins). Attribution-first: every item carries optional source/license/tools so re-shares stay correct. Collections group items. Convex-backed (schema + queries + unauthenticated mutations); SEO override fields reused from the `seo` peer slice so the surface matches blog/projects rows. Public view = filterable card grid + per-item detail with copy-to-clipboard for prompts/snippets and an opt-in upvote control. React/Next remains default; native Svelte 5/SvelteKit renders the same model/default/tool semantics against the same Convex backend. Lifted 2026-05-28 from rahmanef.com; 432-LOC mutations + 330-LOC detail split for the 200-LOC cap; Indonesian copy + custom primitives stripped (prop-driven English defaults); cross-slice auth + comments-votes coupling dropped (consumer wraps mutations + supplies the upvote handler).",
    source: "rahmanef.com",
    slicePath: "frontend/slices/library",
    convexPaths: ["convex/features/library"],
    npm: ["convex@^1.17", "next@^15", "react@^18"],
    shadcn: [],
    env: [],
    peers: [{ slug: "seo", range: "^0.2", reason: "Library item SEO override fields reuse the seo slice's metadata shape so the surface matches blog/projects rows." }],
    tags: ["library", "resources", "prompts", "snippets", "moodboard", "downloads", "attribution", "seo", "personal-brand"],
    usedBy: [],
    agentRecipe: "Run `npx rr add seo` (peer) then `npx rr add library` for React/Next or `npx rr add library --framework sveltekit` for native Svelte 5. Spread `seoTables` + `libraryTables` into your root Convex schema. Wrap the unauthenticated CRUD `internalMutation`s with your auth model (see README Install). Render `<LibraryIndex items={await fetchQuery(api.library.listPublic)} />` and `<LibraryDetail item={await fetchQuery(api.library.getBySlug, { slug })} />`. Pass `onUpvote` to enable voting (consumer-owned backend); override `copy` + `kindLabels` per consumer.",
    previewPath: "/preview/slices/library",
    defaultView: "desktop",
    defaultZoom: 0.85,
  },
  // ── UX wave U6 (2026-06-06): basic building blocks ──────────────────────
  {
    slug: "data-table",
    title: "Data Table — TanStack",
    category: "data",
    kind: "ui",
    version: "0.3.0",
    tagline: "Sortable/filterable/paginated table with native React and Svelte renderers.",
    description: "Framework-parity DataTable: React/Next stays on TanStack React Table v8 + shadcn, while SvelteKit uses the official Svelte 5 TanStack Table v9 adapter with native semantic controls. Both expose sorting, column-bound filtering, pagination, row selection, column visibility, compact/comfortable density, and shared labels/summary semantics. Pure UI — consumers own data fetching and persistence.",
    source: "rr original (shadcn data-table pattern)",
    docsUrl: "https://tanstack.com/table/latest",
    slicePath: "frontend/slices/data-table",
    convexPaths: [],
    npm: ["@tanstack/react-table@^8.21.3", "lucide-react@^0.400.0"],
    shadcn: ["table", "button", "input", "checkbox", "dropdown-menu"],
    env: [],
    peers: [],
    tags: ["data", "table", "datagrid", "tanstack", "sorting", "pagination", "svelte", "framework-parity"],
    usedBy: [],
    agentRecipe: "Run `npx rr add data-table` for React/default (TanStack React Table v8 + shadcn) or `npx rr add data-table --framework sveltekit` for native Svelte 5 + @tanstack/svelte-table v9. Each framework owns its column-definition type; both expose sorting, column search, pagination, selection, visibility, density, and shared label/summary semantics.",
    previewPath: "/preview/slices/data-table",
    defaultView: "desktop",
    defaultZoom: 0.75,
  },
  {
    slug: "pages-cms",
    title: "Pages CMS — block-composed multi-page editor",
    category: "content",
    kind: "ui",
    version: "0.2.0",
    tagline: "Multi-page CMS: list/create/edit/publish pages built from 11 block kinds — localStorage or your own backend.",
    description: "Framework-parity multi-page CMS over one shared reducer/types/core. React keeps shadcn + Lucide admin surfaces but is now clean-install portable without Next-only imports or repo-only helpers. Svelte 5/SvelteKit adds native PagesView, PageEditorView, all 11 block editors, public renderers, provider and localStorage adapter with no React/Lucide/shadcn leakage. Draft block reordering stays local until Save so unsaved edits are preserved.",
    source: "rr original (generalized from saas-marketing pages engine)",
    slicePath: "frontend/slices/pages-cms",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["badge", "button", "table", "input", "textarea", "label", "select", "switch", "card", "dialog"],
    env: [],
    peers: [],
    tags: ["content", "cms", "pages", "blocks", "editor", "builder", "basics"],
    usedBy: [],
    agentRecipe: "Run `npx rr add pages-cms` for React/default or `npx rr add pages-cms --framework sveltekit`. Wrap the surface in LocalPagesProvider for zero-backend localStorage or PagesProvider with your own PagesStore. Mount PagesView for the list, PageEditorView for the editor route, and BlocksRenderer for public pages. Both frameworks share PageBlock, pagesReducer, defaultPages, blank/duplicate helpers and nav derivation.",
    previewPath: "/preview/slices/pages-cms",
    defaultView: "desktop",
    defaultZoom: 0.6,
  },
  {
    slug: "feedback-states",
    title: "Feedback States — loading skeletons + empty/error states",
    category: "ui",
    kind: "ui",
    version: "0.2.1",
    tagline: "The \"no real content yet\" family — skeletons + spinners and 404/500/403 + zero-data, in two installable variants.",
    description: "Two co-located placeholder surfaces behind one slug. loading: a configurable LoadingSkeleton over the shadcn Skeleton (kind presets text / card / list / table / form / page / block, overridable count + columns) plus a spinner LoadingState (inline / block / overlay) for in-flight work. empty: a configurable EmptyState over the shadcn Empty (404 / 500 / 403 / no-results / empty-list / first-use, overridable icon/title/copy/actions) plus an ErrorPage full-page wrapper for app/not-found.tsx and app/error.tsx. Install one surface with `npx rr add feedback-states loading|empty`, or both with `npx rr add feedback-states`. Replaces ad-hoc animate-pulse divs, hand-rolled Loader2 spans, and one-off error pages.",
    source: "rr original",
    slicePath: "frontend/slices/feedback-states",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["skeleton", "spinner", "empty", "button"],
    env: [],
    peers: [],
    variants: [
      { title: "loading", desc: "npx rr add feedback-states loading — LoadingSkeleton (7 kinds) + LoadingState (inline/block/overlay)." },
      { title: "empty", desc: "npx rr add feedback-states empty — EmptyState (6 kinds) + ErrorPage full-page wrapper." },
    ],
    tags: ["loading", "skeleton", "spinner", "empty-state", "404", "500", "403", "error-page", "fallback", "placeholder", "basics"],
    usedBy: [],
    agentRecipe: "Run `npx rr add feedback-states` for both, or `npx rr add feedback-states loading` / `empty` for one surface. loading: <LoadingSkeleton kind=\"table\" count={8} /> mirrors streamed content, kind=\"page\" drops into route loading.tsx, <LoadingState variant=\"inline|block|overlay\" /> for in-flight work. empty: <EmptyState kind=\"no-results\" /> in zero-data spots, <ErrorPage kind=\"404\" /> in app/not-found.tsx and kind=\"500\" in app/error.tsx. Every preset overridable per use.",
    previewPath: "/preview/slices/feedback-states",
    defaultView: "tablet",
    defaultZoom: 0.8,
  },
  {
    slug: "marketing-chrome",
    title: "Marketing Chrome — Header + Footer",
    category: "ui",
    kind: "ui",
    version: "0.3.0",
    tagline: "Config-driven marketing navbar + footer — the chrome every template hand-rolled, now one slice.",
    description: "MarketingHeader (split | centered | minimal layouts, sticky option, mobile sheet menu) + MarketingFooter (columns | slim layouts, link columns, social icons, legal bar). Brand / nav / CTA / columns all props — no hardcoded content. Lucide stand-ins for brand glyphs; swap a brand icon set post-copy (README).",
    source: "rr original (extracted from template duplication)",
    slicePath: "frontend/slices/marketing-chrome",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "sheet", "separator"],
    env: [],
    peers: [],
    tags: ["header", "footer", "navbar", "marketing", "navigation", "chrome", "basics"],
    usedBy: [],
    agentRecipe: "Run `npx rr add marketing-chrome`. Feed MarketingHeader { brand, nav[], cta, layout } and MarketingFooter { brand, columns[], social[], legal[], layout }. Header layout split is the default marketing pattern; footer columns for full sites, slim for single-pagers.",
    previewPath: "/preview/slices/marketing-chrome",
    defaultView: "desktop",
    defaultZoom: 0.7,
  },
  {
    slug: "settings",
    title: "Settings — account + appearance shells",
    category: "ui",
    kind: "ui",
    version: "1.2.0",
    tagline: "Two adapter-driven settings shells — account (async load+save) and appearance (sync per-setting) — the slice owns no data.",
    description: "Two settings surfaces behind one slug, each adapter-driven so the slice owns no data. account: SettingsShell two-column surface (nav collapses to a Select on mobile) — Profile (avatar/name/email/bio), Preferences (theme/language/density), Notifications (switch rows), Danger zone (AlertDialog-confirmed delete) over an ASYNC SettingsAdapter { load, save(patch) } with optimistic save + rollback; createMemoryAdapter ships for demos. appearance: AppearancePanel (style/mode/accent/wallpaper/reduce-transparency/display) over a SYNC per-setting AppearanceAdapter, plus the generic SettingsSection / SettingsRow / Segmented / AccentSwatches primitives you compose custom panels from. Install one surface with `npx rr add settings account|appearance`, or both with `npx rr add settings`.",
    source: "rr original",
    slicePath: "frontend/slices/settings",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["alert-dialog", "avatar", "button", "card", "input", "label", "select", "separator", "skeleton", "switch", "textarea", "toggle-group"],
    env: [],
    peers: [],
    variants: [
      { title: "account", desc: "npx rr add settings account — SettingsShell over an async load+save adapter (profile/preferences/notifications/danger-zone), or feed the sections to your app sidebar with settingsSectionsToNav + <SettingsShell nav={false}>." },
      { title: "appearance", desc: "npx rr add settings appearance — AppearancePanel over a sync per-setting adapter + Section/Row/Segmented primitives." },
    ],
    tags: ["settings", "preferences", "account", "appearance", "theme", "adapter", "shell", "primitives", "ui", "basics"],
    usedBy: [],
    agentRecipe: "Run `npx rr add settings` for both, or `npx rr add settings account` / `appearance` for one. account: implement SettingsAdapter { load, save } over your backend (Convex query + mutation), pass to <SettingsShell adapter>; save gets per-section partial patches (shallow-merge server-side); onDeleteAccount wires the danger zone. Already have a dashboard sidebar? Feed it settingsSectionsToNav(setSection, { activeId }) and render <SettingsShell nav={false} active onNavigate> so there is ONE nav, not two. appearance: build an AppearanceAdapter (per-setting SegSetting values) from your appearance store, pass to <AppearancePanel appearance>; or compose custom panels from <SettingsSection>/<SettingsRow>/<Segmented>/<AccentSwatches>.",
    previewPath: "/preview/slices/settings",
    defaultView: "desktop",
    defaultZoom: 0.75,
  },
  {
    slug: "notifications-center",
    title: "Notifications Center — bell + inbox",
    category: "ui",
    kind: "ui",
    version: "0.3.0",
    tagline: "Bell with unread badge + popover/sheet inbox — adapter-driven, host supplies the feed.",
    description: "Adapter-driven notification inbox with one shared newest-first snapshot/filter/action core. React/Next keeps the shadcn + Lucide bell/list/item UI; Svelte/SvelteKit ships native bell/list/item UI and a Svelte-readable adapter over the same NotificationsAdapter, relative-time, unread, mutation, and agent-tool semantics.",
    source: "rr original (appshell toast-log pattern, standalone)",
    slicePath: "frontend/slices/notifications-center",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "popover", "sheet", "badge", "scroll-area", "separator", "tabs", "avatar"],
    env: [],
    peers: [],
    tags: ["notifications", "inbox", "bell", "unread", "toast", "basics"],
    usedBy: [],
    agentRecipe: "Run `npx rr add notifications-center` (or `--framework sveltekit`). Bind your host feed through NotificationsAdapter, or start with createMemoryNotificationsAdapter(seed). The shared state core sorts newest-first and exposes unread + mark/dismiss/clear semantics; use surface=\"sheet\" for mobile-heavy apps.",
    previewPath: "/preview/slices/notifications-center",
    defaultView: "desktop",
    defaultZoom: 0.8,
    compat: {
      enhances: ["appshell", "dashboard-shell"],
    },
  },
  {
    slug: "design-studio",
    title: "Design Studio — photo / social design canvas",
    category: "os",
    kind: "ui",
    version: "1.1.0",
    tagline: "React + Svelte layered design studio over one observable canvas/document core — fully offline until a host adapter is wired.",
    description:
      "Framework-parity layered photo/social editor. React/Next remains default; native Svelte 5/SvelteKit covers the same canvas workflow over shared framework-neutral model/document, observable undo/redo, scene, filter/mask, safe-area, serialization, sample-media, and host-adapter cores. Both renderers support image/text/shape/sticker/HTML layers, transforms, masks/custom CSS, presets, keyboard shortcuts, JSON/HTML import-export, and optional host persistence through configureMediaStudio.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/design-studio",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["button", "dialog", "badge", "tooltip", "scroll-area"],
    env: [],
    peers: [],
    tags: ["canvas", "editor", "layers", "filters", "export", "design", "ui", "svelte", "framework-parity"],
    resourceType: "module",
    maturity: "beta",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/design-studio",
    defaultView: "desktop",
    agentRecipe: `React/default: \`npx rr add design-studio\`. SvelteKit: \`npx rr add design-studio --framework sveltekit\`. Both share the same layer/document model, observable undo/redo + scene stores, filters/masks/safe-area data, JSON/HTML serialization, bundled image samples, and configureMediaStudio host adapter. React keeps Lucide/shadcn chrome; Svelte installs only svelte@^5 plus portable core files.`,
    exampleCode: `"use client";
import { MediaStudio } from "@/features/design-studio";

export default function StudioDemo() {
  return <div className="h-dvh w-full"><MediaStudio /></div>;
}`,
  },
  {
    slug: "quicklinks",
    title: "Quicklinks — website shortcuts with favicons",
    category: "os",
    kind: "ui",
    version: "1.1.0",
    tagline: "Add/remove website shortcuts with favicons; localStorage by default, injectable store for any host.",
    description:
      "A website-shortcut grid: add/remove links with auto favicons (Google s2) and new-tab open. State lives behind an injectable QuicklinksStore — createLocalStore persists to localStorage (SSR-safe hydrate), createMemoryStore suits previews/tests, configureQuicklinks swaps in a host store. Pairs with appshell: the useQuickLinks capability + QuicklinkIcon surface the same links in the dock/Launchpad/mobile grid.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/quicklinks",
    convexPaths: [],
    npm: ["lucide-react"],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["shortcuts", "bookmarks", "favicons", "launcher", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/quicklinks",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. Website shortcut grid. Fully client-side; no backend required.

STEP 1 — Install. \`npx rr add quicklinks\`. Ensure \`@/features/quicklinks\` resolves and Tailwind scans the slice folder.

STEP 2 — Deps. npm: \`lucide-react\`. shadcn: button.

STEP 3 — Mount. \`<Quicklinks />\` — unwired it persists to localStorage ("rr:quicklinks") with 4 demo seeds. Or register \`quicklinksApp\` in an appshell manifest.

STEP 4 — Host store. \`configureQuicklinks(store)\` with { get, subscribe, add, remove, hydrate? } — or feed appshell's useQuickLinks capability from the same store so dock shortcuts stay in sync.`,
    exampleCode: `"use client";
import { Quicklinks } from "@/features/quicklinks";

export default function LinksDemo() {
  return <div className="h-dvh w-full"><Quicklinks /></div>;
}`,
  },
];

export function getSlice(slug: string): SliceEntry | null {
  return slices.find((s) => s.slug === slug) ?? null;
}
