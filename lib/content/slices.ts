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
 *                 Examples: doku-payment, midtrans-payment, mdx-blog.
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
    slug: "image-editor",
    title: "Image Editor — Photoshop-style canvas (Konva)",
    category: "ui",
    kind: "full",
    version: "1.0.0",
    tagline: "Layered raster editor: layers, transform, paint, filters, layer styles, 1-click background removal, export.",
    description:
      "A Photoshop-style raster image editor built on Konva. Layers panel (reorder, opacity, visibility, lock, 16 blend modes), free transform (move/scale/rotate/flip via a Transformer), image + text + shape + paint layers, brush & eraser with size/opacity/hardness, non-destructive adjustments + filters (brightness/contrast/hue/saturation/blur/grayscale/invert/sepia, applied via Konva.Filters), canvas resize/aspect presets, and Photoshop-style LAYER STYLES: stroke, drop shadow (angle/distance/size/opacity), outer glow, clipping mask (clip to layer below), per-layer blend mode. One-click BACKGROUND REMOVAL runs fully in-browser via @imgly/background-removal (free, MIT, no API key, no server — downloads a small ONNX model to the browser cache on first use) and drops the cutout back as a transparent layer. Undo/redo, zoom/pan, keyboard shortcuts, and PNG/JPG/WebP export at 1×/2×/3×. Self-contained: image I/O is via props (initialImage / onSave) so it drops into any app with zero backend.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/image-editor",
    convexPaths: [],
    npm: ["konva", "react-konva", "@imgly/background-removal", "lucide-react"],
    shadcn: ["button", "input", "slider", "select", "tabs", "scroll-area", "separator", "tooltip", "label", "switch", "popover", "resizable"],
    env: [],
    peers: [],
    tags: ["image-editor", "photoshop", "canvas", "konva", "layers", "filters", "background-removal", "paint", "crop", "ui"],
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
    slug: "file-explorer",
    title: "File Explorer — Tree + CRUD + Breadcrumb",
    category: "ui",
    kind: "full",
    version: "1.0.0",
    tagline: "Backend-agnostic file manager: directory tree sidebar, breadcrumb nav, grid/list views, full CRUD.",
    description:
      "A complete, portable file-directory explorer: a collapsible folder TREE sidebar (lazy-loaded per dir), a responsive BREADCRUMB that auto-collapses to a dropdown, grid + list views with sort, multi-select, a right-click context menu, drag-and-drop (internal move + external file/folder upload), inline rename, and full CRUD (new folder, rename, cut/copy/paste, move, delete/trash, empty trash). The filesystem backend is INJECTED via a small FileExplorerAdapter (list/mkdir/remove/move/copy/upload/usage/rawUrl) — point it at a real API or use the bundled createMockAdapter() (a writable in-memory tree) so it works with zero backend. Opening a file fires an onOpenFile(path, entry) callback you wire to your own viewer/editor. Self-contained: imports only @/components/ui/* + @/lib/utils. Ported from os-vps (Topside) files manager. Pairs with appshell as the file-dir counterpart to a notion-style sidebar.",
    source: "rahmanef63/os-vps",
    slicePath: "frontend/slices/file-explorer",
    convexPaths: [],
    npm: ["lucide-react"],
    shadcn: ["button", "input", "scroll-area", "separator", "dropdown-menu", "sheet"],
    env: [],
    peers: [],
    tags: ["files", "file-manager", "explorer", "tree", "breadcrumb", "crud", "sidebar", "ui"],
    resourceType: "module",
    maturity: "stable",
    compat: { enhances: ["appshell"] },
    previewPath: "/preview/slices/file-explorer",
    defaultView: "desktop",
    agentRecipe: `Stack: Next 16 + React 19 + Tailwind 4 + shadcn/ui. The slice is self-contained — imports only @/components/ui/* + @/lib/utils (cn). The filesystem backend is injected; nothing is hardcoded.

STEP 1 — Install. \`npx rr add file-explorer\`. Ensure \`@/features/file-explorer\` resolves in tsconfig paths and Tailwind's content globs scan the slice folder.

STEP 2 — shadcn + npm. \`npx shadcn@latest add button input scroll-area separator dropdown-menu sheet\`. npm: lucide-react.

STEP 3 — Mount it. Drop it in with NO adapter prop — it falls back to the backend configured in lib/backend.ts (the writable in-memory mock by default), so it works out of the box with realistic seed data and full CRUD:
\`\`\`tsx
"use client";
import { FileExplorer } from "@/features/file-explorer";
export default function Page() {
  return (
    <div className="h-dvh">
      <FileExplorer rootLabel="Files" onOpenFile={(path) => console.log("open", path)} />
    </div>
  );
}
\`\`\`

STEP 4 — The backend switch (ONE file). Go to a real filesystem without touching any component: edit \`slices/file-explorer/lib/backend.ts\` and set \`FILE_EXPLORER_BACKEND = "mock" | "live" | "convex"\` (or set env \`NEXT_PUBLIC_FILE_EXPLORER_BACKEND\`). "live" = REST host fs (os-vps /api/v1/fs shape, base via NEXT_PUBLIC_FILES_API_URL — see adapter/live.ts). "convex" = self-hosted Convex fs functions, PREPARED but inert until you wire your generated client + api in the switch (see adapter/convex.ts; the slice imports nothing from @convex so the build stays green even without Convex). You can still pass \`adapter={…}\` to override per-instance.

STEP 5 — Custom adapter. Implement FileExplorerAdapter: { mode: "live"|"mock"|"readonly", list(path), mkdir(path), remove(path), move(from,to), copy(from,to), upload(dest,files), usage(), rawUrl(path), write?(path,content) }. \`list\` returns { path, entries:[{name,kind,size,ext?}], roots?, parent? }. Set mode:"readonly" to show an inline notice instead of mutating. \`rawUrl(path)\` returns a bytes URL for image thumbnails (return "" to fall back to icons).

The container owns the box — render <FileExplorer> inside something with a height (h-dvh / h-full). It self-provides its adapter context; no extra provider needed.`,
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
    category: "ui",
    kind: "full",
    version: "1.0.0",
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
    version: "0.3.0",
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
      enhances: ["midtrans-payment", "doku-payment", "resend-newsletter", "ai-router"],
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
    slug: "doku-payment",
    title: "DOKU — Indonesia Payment",
    category: "payment",
    kind: "full",
    version: "0.1.1",
    description: "Pembayaran lokal Indonesia via DOKU — Checkout (hosted) + Direct (VA / QRIS / e-Wallet / PayLater / Minimarket / Kartu). HMAC-signed REST + signature-verified webhook + idempotent retries. Sibling slice to midtrans-payment dengan paymentOrders schema yang dishare.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sandbox.doku.com/integration",
    install: "",
    slicePath: "frontend/slices/doku-payment",
    convexPaths: ["convex/features/payment"],
    npm: [],
    shadcn: ["card", "button", "dialog", "input", "label", "select", "badge", "skeleton"],
    env: [
      { name: "DOKU_CLIENT_ID", scope: "convex", required: true },
      { name: "DOKU_SECRET_KEY", scope: "convex", required: true },
      { name: "DOKU_IS_PRODUCTION", scope: "convex" },
      { name: "DOKU_NOTIFY_PATH", scope: "convex" },
    ],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Order ownership requires authenticated user." }],
    providers: ["doku"],
    tags: ["payment", "doku", "indonesia", "qris", "virtual-account", "ewallet", "checkout"],
    usedBy: ["personal-brand-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "riset-kit", "agency-studio-os", "cms-public-storefront"],
    agentRecipe: "Run `npx rr add doku-payment`. DOKU dual-mode: Checkout (hosted, all channels) atau Direct (single channel, returns VA/QRIS/deeplink). Webhook di /webhooks/doku verify HMAC-SHA256 (canonical: Client-Id + Request-Id + Request-Timestamp + Request-Target + Digest). Idempotency by request_id index. Server-only — no NEXT_PUBLIC_*. Sandbox default (api-sandbox.doku.com); flip DOKU_IS_PRODUCTION=true for live.",
    previewPath: "/preview/slices/doku-payment",
    wiring: `// app/checkout/page.tsx
export { default } from "@/features/doku-payment/components/checkout-page";

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
      conflicts: ["midtrans-payment", "stripe-payment"],
      enhances: ["convex-auth", "ai-router"],
    },
  },
  {
    slug: "midtrans-payment",
    title: "Midtrans — Indonesia Payment",
    category: "payment",
    kind: "full",
    version: "0.1.1",
    description: "Pembayaran lokal Indonesia via Midtrans Snap (BCA, Mandiri, BRI, e-wallet GoPay/OVO/Dana, QRIS). Webhook untuk konfirmasi. Provider-isolated under components/providers/midtrans + actions/midtrans so Doku/Stripe land as siblings.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://docs.midtrans.com",
    install: "npm i midtrans-client",
    slicePath: "frontend/slices/midtrans-payment",
    convexPaths: ["convex/features/payment"],
    npm: ["midtrans-client@^1.4.2"],
    shadcn: ["card", "button", "dialog", "input", "label"],
    env: [
      { name: "MIDTRANS_SERVER_KEY", scope: "convex", required: true },
      { name: "MIDTRANS_CLIENT_KEY", scope: "next-public", required: true },
      { name: "MIDTRANS_IS_PRODUCTION", scope: "convex" },
    ],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Order ownership requires authenticated user." }],
    providers: ["midtrans"],
    tags: ["payment", "midtrans", "indonesia", "qris", "snap"],
    usedBy: ["wirausaha-os", "konsultan-os", "kreator-studio-os"],
    agentRecipe: "Run `npx rr add midtrans-payment`. Midtrans Snap untuk pembayaran instant. Webhook ke Convex HTTP action /api/midtrans-callback untuk update order status. Ingat: PPN 11% sudah included di amount, jangan double-count.",
    previewPath: "/preview/slices/midtrans-payment",
    wiring: `// app/checkout/page.tsx
export { default } from "@/features/midtrans-payment/components/checkout-page";

// app/layout.tsx
<Script src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />

// convex/http.ts
http.route({ path: "/webhooks/midtrans", method: "POST", handler: midtransWebhook });`,
    defaultView: "mobile",
    defaultZoom: 1,
    compat: {
      templates: {
        "personal-brand-os": { status: "warn", note: "Personal-brand has no checkout slice; you'll add one manually." },
        "agency-studio-os": { status: "warn", note: "B2B template; payment slice not included." },
        "saas-marketing-os": { status: "warn", note: "SaaS biasanya butuh recurring billing — Midtrans Snap untuk one-time only." },
        "konsultan-os": { status: "recommended", note: "Alternative Indonesian gateway." },
        "wirausaha-os": { status: "recommended", note: "Alternative Indonesian gateway." },
        "kreator-studio-os": { status: "recommended", note: "Alternative Indonesian gateway." },
        "cms-public-storefront": { status: "recommended", note: "Alternative Indonesian gateway." },
      },
      conflicts: ["stripe-payment", "doku-payment"],
      enhances: ["convex-auth"],
    },
  },
  {
    slug: "resend-newsletter",
    title: "Resend — Transactional & Newsletter",
    category: "email",
    kind: "backend",
    version: "0.1.3",
    description: "Transactional email + newsletter blast via Resend. Double opt-in flow + audience segmentation. Magic-link delivery for Convex Auth. Bundles the subscribers list backend (subscribe / confirm / unsubscribe / count) — formerly the standalone `subscribers` slice, merged here in v0.1.3.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://resend.com/docs",
    install: "npm i resend react-email @react-email/components",
    slicePath: "frontend/slices/resend-newsletter",
    convexPaths: ["convex/features/newsletter", "convex/features/subscribers"],
    npm: ["resend@^4.0.0"],
    shadcn: ["button", "card", "input", "label", "textarea"],
    env: [
      { name: "RESEND_API_KEY", scope: "convex", required: true },
      { name: "RESEND_FROM", scope: "convex", required: true },
    ],
    peers: [],
    tags: ["email", "newsletter", "resend"],
    usedBy: ["personal-brand-os", "kreator-studio-os", "wirausaha-os"],
    agentRecipe: "Run `npx rr add resend-newsletter`. Use Resend Audiences API for newsletter — store subscriber emails in Convex too for segmentation. Double opt-in: subscriber.create with status 'pending' → click link → status 'confirmed'.",
    previewPath: "/preview/slices/resend-newsletter",
    wiring: `// convex/features/newsletter/subscribe.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const token = crypto.randomUUID();
    await ctx.db.insert("subscribers", { email, status: "pending", token, createdAt: Date.now() });
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM!, to: email,
      subject: "Konfirmasi langganan",
      html: \`<a href="\${process.env.SITE_URL}/newsletter/confirm?token=\${token}">Konfirmasi</a>\`,
    });
  },
});`,
    defaultView: "tablet",
    defaultZoom: 0.8,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Newsletter slice already calls Resend Audiences API." },
        "agency-studio-os": { status: "recommended", note: "Leads → broadcast wired through admin." },
        "saas-marketing-os": { status: "recommended" },
      },
      enhances: ["mdx-blog"],
    },
  },
  // ─────────────────────────────────────────────────────────────
  // AI features (consolidated 2026-05-16 — was 7 entries, merged into
  // 3 consumer archetypes + 1 admin + 1 backend).
  //
  // Ordering follows the user mental model:
  //   1. ai-chat   — talk to the model (chatbot / copilot / search)
  //   2. ai-studio — make stuff with the model (generation canvas)
  //   3. ai-agents — let the model work asynchronously (workers)
  //   4. ai-admin  — operator console (instructions / skills / tools /
  //                  agents / providers / budgets / audit)
  //   5. ai-router — backend infra (provider proxy + cost guard)
  //
  // Tag taxonomy:
  //   "ai"            — umbrella (every entry)
  //   "ai:<arch>"     — chat | studio | agents | admin | backend
  //   capability tags — streaming, multimodal, tool-calls, rag,
  //                     agent-mode, citations, branching, history,
  //                     image-gen, voice
  // ─────────────────────────────────────────────────────────────
  {
    slug: "ai-chat",
    title: "AI Chat — Workbench / Sidebar / Search",
    category: "ai",
    kind: "full",
    version: "0.1.0",
    tagline: "One AI chat backend, 3 surfaces: ChatGPT-style workbench, sidebar copilot, or search.",
    description: "One conversational AI feature, three render modes. Same Convex backend (threads + streaming + tool calls + RAG), pick the surface via prop:\n\n  • workbench — Claude.ai / ChatGPT three-column page (default)\n  • sidebar — collapsible copilot panel inside another CRUD app\n  • search — single-question + answer + citations (Perplexity)\n\nUse cases:\n  – Customer-support chatbot embedded in your marketing site\n  – Developer copilot in your PR/docs admin\n  – Knowledge-base search over your blog + docs corpus\n  – Internal AI assistant in your dashboard\n\nWhat it ships: multi-provider (Anthropic / OpenAI / Google / Mistral / Ollama), multimodal (text + image + PDF + audio), typed tool calls with inline inspector, agent mode (plan→execute→reflect), branching threads, RAG citations, resumable streams, usage telemetry. Public surface = consumer chat; admin surface = persona, fallback, guardrails per-bot.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sdk.vercel.ai/docs",
    install: "npm i ai @ai-sdk/anthropic @ai-sdk/openai",
    slicePath: "frontend/slices/ai-chat",
    convexPaths: ["convex/features/ai"],
    npm: ["ai@^4.0.0", "@ai-sdk/anthropic@^0.0.50", "@ai-sdk/openai@^0.0.60"],
    shadcn: ["button", "card", "badge", "avatar", "scroll-area", "select", "separator", "slider", "switch", "textarea", "tabs", "command", "sheet"],
    env: [
      { name: "ANTHROPIC_API_KEY", scope: "convex", required: false },
      { name: "OPENAI_API_KEY", scope: "convex", required: false },
      { name: "GOOGLE_GENERATIVE_AI_API_KEY", scope: "convex", required: false },
    ],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "Thread ownership requires authenticated user." },
      { slug: "ai-router", range: "^0.1", reason: "Routes provider calls through tiered proxy." },
      { slug: "ai-admin", range: "^0.1", reason: "Reads instructions / skills / tools / models from ai-admin registry." },
      { slug: "vector-search", range: "^0.1", reason: "Optional — RAG / search modes pull workspace embeddings." },
    ],
    tags: ["ai", "ai:chat", "streaming", "multimodal", "tool-calls", "agent-mode", "rag", "citations", "branching", "history"],
    usedBy: [],
    agentRecipe: "Run `npx rr add ai-chat`. Pick `mode=\"workbench\" | \"sidebar\" | \"search\"` on `<AIChat />` (or use the convenience exports `<AIChatWorkbench />`, `<AIChatSidebar />`, `<AIChatSearch />`). Same backend tables + streaming action for all three.",
    previewPath: "/preview/slices/ai-chat",
    adminPreviewPath: "/preview/slices/ai-chat/admin",
    defaultSurface: "public",
    defaultView: "desktop",
    defaultZoom: 0.55,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Customer support (workbench) + author copilot (sidebar)." },
        "kreator-studio-os": { status: "recommended", note: "Default content-ideation surface (workbench mode)." },
        "saas-marketing-os": { status: "warn", note: "Only the search mode is a natural fit for marketing sites." },
      },
      enhances: ["ai-router", "ai-admin", "vector-search"],
    },
  },
  {
    slug: "ai-studio",
    title: "AI Studio — Generation Canvas",
    category: "ai",
    kind: "full",
    version: "0.1.0",
    description: "AI is the primary UI — single big prompt input → live-streaming output → variation grid → version tree. Suno / Midjourney / Lovable / v0 pattern. Output kinds: text, code, image, audio (configurable per template).\n\nUse cases:\n  – AI image generation product (creative output)\n  – AI logo / banner / social-post studio\n  – AI code-snippet generator (component scaffolder)\n  – AI music / voiceover producer\n  – AI blog-draft factory (text)\n\nFeatures: prompt history, branch + compare outputs, like + favorite, share-to-link, templates from ai-admin.",
    source: "rahmanef63/resource-site",
    install: "",
    slicePath: "frontend/slices/ai-studio",
    convexPaths: ["convex/features/ai"],
    npm: ["ai@^4.0.0"],
    shadcn: ["button", "card", "badge", "textarea", "tabs", "tooltip", "scroll-area", "select"],
    env: [],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "Generation history per user." },
      { slug: "ai-router", range: "^0.1", reason: "All generation calls flow through router." },
      { slug: "ai-admin", range: "^0.1", reason: "Templates + few-shot library + moderation rules live in ai-admin." },
    ],
    tags: ["ai", "ai:studio", "generation", "streaming", "history", "branching", "image-gen"],
    usedBy: [],
    agentRecipe: "Run `npx rr add ai-studio`. Mount `<GeneratorCanvas />` at /. Use case: prompt → output IS the entire product. Wire your output renderer (text/image/code/audio) via the OutputSlot adapter. Templates loaded from ai-admin.studio.templates.",
    previewPath: "/preview/slices/ai-studio",
    adminPreviewPath: "/preview/slices/ai-studio/admin",
    defaultSurface: "public",
    defaultView: "desktop",
    defaultZoom: 0.6,
    compat: {
      templates: {
        "kreator-studio-os": { status: "recommended", note: "Native fit for creator-output products." },
        "personal-brand-os": { status: "recommended", note: "Post-draft factory + cover-image studio." },
      },
      enhances: ["ai-router", "ai-admin"],
    },
  },
  {
    slug: "ai-agents",
    title: "AI Agents — Autonomous Workers",
    category: "ai",
    kind: "full",
    version: "0.1.0",
    description: "Background AI workers. Define an agent (skill × model × tools × max-iter), trigger it on-demand or on a cron schedule, watch the step-by-step trace as it runs. Devin / Replit-Agent / Manus pattern.\n\nUse cases:\n  – Nightly audit-bp on the codebase (PR-reviewer style)\n  – Weekly SEO crawl + content suggestions\n  – Auto-moderate comment queue\n  – Scheduled data ingestion + summarization\n  – Long-form research task with multi-source citations\n\nFeatures: queue + live trace, per-step retry policy, hard cost cap, shareable trace URLs, full audit-log integration.",
    source: "rahmanef63/resource-site",
    install: "",
    slicePath: "frontend/slices/ai-agents",
    convexPaths: ["convex/features/ai"],
    npm: ["ai@^4.0.0"],
    shadcn: ["button", "card", "badge", "table", "tabs", "scroll-area", "progress"],
    env: [],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "Per-user agent run ownership." },
      { slug: "ai-router", range: "^0.1", reason: "Step calls flow through router." },
      { slug: "ai-admin", range: "^0.1", reason: "Agent definitions live in ai-admin → Agents." },
      { slug: "audit-log", range: "^0.1", reason: "Every step logged." },
    ],
    tags: ["ai", "ai:agents", "agent-mode", "tool-calls", "async", "queue", "traces"],
    usedBy: [],
    agentRecipe: "Run `npx rr add ai-agents`. Mount `<RunnerDashboard />` at /agents. Trigger runs via `runAgent({agentSlug, input, scheduleAt?})`. Cron scheduler via Convex cron — wire if you need scheduled runs. Agent definitions managed in ai-admin.",
    previewPath: "/preview/slices/ai-agents",
    adminPreviewPath: "/preview/slices/ai-agents/admin",
    defaultSurface: "public",
    defaultView: "desktop",
    defaultZoom: 0.6,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Schedule SEO audits, comment moderation, weekly digests." },
        "kreator-studio-os": { status: "recommended", note: "Background batch generations." },
      },
      enhances: ["ai-router", "ai-admin", "audit-log"],
    },
  },
  {
    slug: "ai-admin",
    title: "AI Admin — Console (Instructions · Skills · Tools · Agents · Providers)",
    category: "ai",
    kind: "full",
    version: "0.2.0",
    description: "Central operator console for the whole AI stack. Every other ai-* feature reads its registries from here. Tabs ordered to match the build-flow:\n\n  1. Providers   — register Anthropic / OpenAI / Google / Mistral / Ollama (API keys AES-encrypted at rest)\n  2. Models      — per-provider catalog (capabilities, context window, pricing)\n  3. Instructions — custom system-prompt library (Claude Projects-style)\n  4. Skills      — named instruction + model default + tool defaults (consumed by chat + studio)\n  5. Tools       — JSON-schema function specs + impl (http / convex / shell) + sandbox flag\n  6. Agents      — skill × model × tools × max-iter (consumed by ai-agents)\n  7. Budgets     — per-workspace cost caps + alerts + hard kill\n  8. Audit       — every AI call: actor / agent / tokens / cost / latency / outcome\n\nIncludes Create-Agent / Create-Skill / Create-Tool / Create-Instruction wizards.",
    source: "rahmanef63/resource-site",
    install: "",
    slicePath: "frontend/slices/ai-admin",
    convexPaths: ["convex/features/ai"],
    npm: [],
    shadcn: ["card", "button", "badge", "tabs", "table", "dialog", "input", "label", "select", "textarea", "switch", "command"],
    env: [{ name: "AI_ADMIN_ENCRYPTION_KEY", scope: "convex", required: true, description: "Encrypts stored provider API keys at rest." }],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "requireAdmin gate." },
      { slug: "rbac-roles", range: "^0.1", reason: "Section gated by ai.* permissions (manage_providers, manage_skills, etc)." },
      { slug: "admin-panel", range: "^0.1", reason: "Lives as a registered admin section." },
      { slug: "audit-log", range: "^0.1", reason: "Every config change + AI call routes through audit-log." },
    ],
    tags: ["ai", "ai:admin", "instructions", "skills", "tools", "agents", "providers", "models", "budgets", "audit"],
    usedBy: [],
    agentRecipe: "Run `npx rr add ai-admin`. Adds an `AI` section to the admin-panel ADMIN_SECTIONS registry. Sub-tabs ordered to match build-flow: Providers → Models → Instructions → Skills → Tools → Agents → Budgets → Audit. Includes Create-* wizards for instructions / skills / tools / agents. API keys AES-encrypted via AI_ADMIN_ENCRYPTION_KEY env. The instruction / skill / tool / agent registries are SSOTs consumed by every ai-* consumer slice (chat + studio + agents).",
    previewPath: "/preview/slices/ai-admin",
    defaultView: "desktop",
    defaultZoom: 0.55,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended", note: "Mounts as admin section — owner manages all AI." },
        "kreator-studio-os": { status: "recommended" },
      },
      enhances: ["ai-chat", "ai-studio", "ai-agents", "ai-router", "audit-log"],
    },
  },
  {
    slug: "ai-router",
    title: "AI Router — Backend Provider Proxy",
    category: "ai",
    kind: "backend",
    version: "0.1.0",
    description: "Backend infrastructure (no UI). Single proxy that every other ai-* feature calls. Tier-routed — nano (Haiku) for classification, mid (Sonnet) for chat, flagship (Opus) for deep reasoning. Per-call usage log + cost guard. Works with direct provider keys or OpenRouter umbrella.\n\nNot something you mount — installed automatically as a peer when you add ai-chat / ai-studio / ai-agents.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://sdk.vercel.ai/docs",
    install: "npm i ai @openrouter/ai-sdk-provider",
    slicePath: "frontend/slices/ai-router",
    convexPaths: ["convex/features/ai"],
    npm: ["ai@^4.0.0", "@openrouter/ai-sdk-provider@^0.0.5"],
    shadcn: ["button"],
    env: [{ name: "OPENROUTER_API_KEY", scope: "convex", required: true }],
    peers: [],
    tags: ["ai", "ai:backend", "tier-routing", "cost-guard"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add ai-router`. Wrap every AI call through ai-router. Tiers: nano = quick classification (spam-flag, headline-suggest), mid = chat / draft, flagship = methodology-review / deep-think. Token usage logs to ai_usage table for the cost dashboard.",
    previewPath: "/preview/slices/ai-router",
    wiring: `// convex/features/ai/router.ts
import { action } from "../../_generated/server";
import { v } from "convex/values";

export const complete = action({
  args: { tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")), messages: v.array(v.any()) },
  handler: async (ctx, { tier, messages }) => {
    const model = { nano: "claude-haiku-4-5", mid: "claude-sonnet-4-6", flagship: "claude-opus-4-7" }[tier];
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: \`Bearer \${process.env.OPENROUTER_API_KEY}\`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages }),
    });
    return res.json();
  },
});`,
    defaultView: "desktop",
    defaultZoom: 0.7,
    compat: {
      templates: {
        "personal-brand-os": { status: "recommended" },
        "kreator-studio-os": { status: "recommended" },
        "saas-marketing-os": { status: "warn", note: "Only needed if site uses ai-chat search mode." },
      },
      enhances: ["ai-chat", "ai-studio", "ai-agents", "ai-admin"],
    },
  },
  {
    slug: "vector-search",
    title: "Convex Vector Search",
    category: "search",
    kind: "full",
    version: "0.1.0",
    description: "Embeddings-based search via Convex's built-in vector index. Embed via OpenAI text-embedding-3-small (1536-dim), query via vectorIndex().",
    source: "rahmanef63/resource-site",
    docsUrl: "https://docs.convex.dev/database/vector-search",
    install: "npm i openai",
    slicePath: "frontend/slices/vector-search",
    convexPaths: ["convex/features/search"],
    npm: ["@convex-dev/vector-search@^0.0.5"],
    shadcn: ["card", "input"],
    env: [{ name: "OPENAI_API_KEY", scope: "convex", required: true }],
    peers: [],
    tags: ["search", "vector", "embeddings", "convex", "rag"],
    usedBy: ["personal-brand-os", "riset-kit"],
    agentRecipe: "Run `npx rr add vector-search`. Add embedding field + vectorIndex per searchable table. Re-embed on upsert via Convex action. Cache embeddings — don't re-call OpenAI on every read.",
    previewPath: "/preview/slices/vector-search",
    wiring: `// convex/features/search/schema.ts
documents: defineTable({ title, body, embedding: v.array(v.number()) })
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536 }),

// convex/features/search/upsert.ts
const emb = await openai.embeddings.create({ model: "text-embedding-3-small", input: body });
await ctx.db.insert("documents", { title, body, embedding: emb.data[0].embedding });

// convex/features/search/query.ts
const queryEmb = await openai.embeddings.create({ model: "text-embedding-3-small", input: q });
const hits = await ctx.vectorSearch("documents", "by_embedding", { vector: queryEmb.data[0].embedding, limit: 10 });`,
    defaultView: "tablet",
    defaultZoom: 0.8,
    compat: {
      templates: {
        "riset-kit": { status: "native", note: "Research kit pakai embedding search untuk konten." },
      },
    },
  },
  {
    slug: "mdx-blog",
    title: "MDX Blog",
    category: "content",
    kind: "ui",
    version: "0.2.0",
    description: "Markdown-with-JSX untuk blog post. File-based MDX content collection. Portable defineMdxBlog(opts) factory dengan 4 config props (basePath, contentDir, labels.list, nav) — defaults preserve legacy /blog + content/blog. Auto-generate ToC, reading-time, syntax highlight, plus embed React components inline.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://github.com/hashicorp/next-mdx-remote",
    install: "npm i next-mdx-remote rehype-pretty-code remark-gfm reading-time",
    slicePath: "frontend/slices/mdx-blog",
    convexPaths: [],
    npm: ["@next/mdx@^16.0.0", "gray-matter@^4.0.3", "rehype-pretty-code@^0.14.0"],
    shadcn: ["card"],
    env: [],
    peers: [],
    tags: ["content", "blog", "mdx", "static"],
    usedBy: ["personal-brand-os", "konsultan-os", "saas-marketing-os"],
    agentRecipe: "Run `npx rr add mdx-blog`. Store post body sebagai markdown di content/blog/*.mdx. Render dengan MDXRemote di [slug]/page.tsx. Auto-extract headings ke ToC via remark plugin custom.",
    previewPath: "/preview/slices/mdx-blog",
    wiring: `// content/blog/setup-convex-dokploy.mdx
---
title: Setup Convex Self-Hosted di Dokploy
date: 2026-05-11
tags: [tutorial, convex, dokploy]
---

import { Callout } from "@/components/Callout";

# Setup Convex …

<Callout>Tip: pakai wildcard DNS.</Callout>

// app/(public)/blog/[slug]/page.tsx
import { MDXRemote } from "next-mdx-remote/rsc";
const file = await fs.readFile(\`content/blog/\${slug}.mdx\`, "utf8");
const { content, data } = matter(file);
return <MDXRemote source={content} />;`,
    defaultView: "tablet",
    defaultZoom: 0.8,
    compat: {
      templates: {
        "saas-marketing-os": { status: "native", note: "Blog + changelog slices both render MDX." },
        "personal-brand-os": { status: "recommended", note: "Blog slice expects MDX bodies in Convex posts table." },
        "konsultan-os": { status: "recommended", note: "Konten ahli sebagai SEO funnel." },
        "agency-studio-os": { status: "warn", note: "Agency template ships no blog slice — bring your own route." },
      },
    },
  },
  {
    slug: "cal-com-booking",
    title: "Cal.com Booking",
    category: "data",
    kind: "full",
    version: "0.1.0",
    description: "Embedded Cal.com booking widget + webhook receiver to mirror bookings into Convex.",
    source: "rahmanef63/resource-site",
    docsUrl: "https://cal.com/docs/integrations/web-app/embed",
    install: "npm i @calcom/embed-react",
    slicePath: "frontend/slices/cal-com-booking",
    convexPaths: ["convex/features/bookings"],
    npm: ["@calcom/embed-react@^1.5.0"],
    shadcn: ["card"],
    env: [
      { name: "NEXT_PUBLIC_CALCOM_USERNAME", scope: "next-public", required: true },
      { name: "CALCOM_WEBHOOK_SECRET", scope: "convex", required: true },
    ],
    peers: [],
    tags: ["data", "scheduling", "cal-com", "bookings"],
    usedBy: ["personal-brand-os", "konsultan-os"],
    agentRecipe: "Run `npx rr add cal-com-booking`. Embed Cal.com via @calcom/embed-react di halaman services. Configure webhook di Cal.com dashboard → POST ke /api/cal-webhook → upsert booking di Convex.",
    previewPath: "/preview/slices/cal-com-booking",
    wiring: `// app/(public)/booking/page.tsx
import { getCalApi } from "@calcom/embed-react";
useEffect(() => {
  (async () => {
    const cal = await getCalApi();
    cal("ui", { theme: "light" });
  })();
}, []);
<Cal calLink={\`\${process.env.NEXT_PUBLIC_CALCOM_USERNAME}/diskusi-30m\`} />

// convex/features/bookings/webhook.ts
export const calComWebhook = httpAction(async (ctx, req) => {
  // verify X-Cal-Signature-256 with CALCOM_WEBHOOK_SECRET
  const { triggerEvent, payload } = await req.json();
  if (triggerEvent === "BOOKING_CREATED") {
    await ctx.runMutation(internal.features.bookings.mutations.create, payload);
  }
});`,
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
    version: "0.2.0",
    tagline: "Notion-style ⌘K palette + search modal. Consumer supplies groups; slice owns dialog + MRU.",
    description: "Renderless ⌘K command palette + generic search modal. Consumer supplies CommandGroup[] + onSelect + label bag; slice owns dialog chrome, ⌘K hotkey, MRU history. Pulled UP from notion-page-clone's command-palette renderless surface (Wave N+3.7) — Nosion adapters dropped at the kitab boundary.",
    source: "notion-page-clone (consumerVersion 0.3.0) + earlier superspace facade",
    docsUrl: "https://cmdk.paco.me",
    install: "npm i cmdk",
    slicePath: "frontend/slices/command-menu",
    convexPaths: [],
    npm: ["cmdk@^1.0.0"],
    shadcn: ["command", "dialog"],
    env: [],
    peers: [],
    tags: ["ui", "palette", "cmd-k", "navigation", "keyboard", "search", "notion-like"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "saas-marketing-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Run `npx rr add command-menu`. Wire <CommandPalette groups={...} onHistorySelect={...} labels={...} /> at the dashboard shell. Build groups from your feature registry; each item.onSelect handles navigation. Use <SearchModal bindings={{ pages, databases, recents, isLoading, onQueryChange, onSelectPage, onSelectDatabase }} /> for the search dialog — see slice README.md for adapter shapes.",
    previewPath: "/preview/slices/command-menu",
    wiring: `import { CommandMenu } from "@/features/command-menu";

const actions = [
  { id: "new-post", label: "New post", icon: "Plus", onSelect: () => router.push("/posts/new") },
];

<CommandMenu actions={actions} />`,
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
    title: "Dashboard Shell — Responsive",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    description: "ResponsiveDashboardShell — desktop sidebar + topbar, mobile dock + sheet sidebar, breakpoint-aware. Ports superspace's layout/dashboard/{Desktop,Mobile,Responsive}DashboardShell + sidebar primary/secondary slots. Facade slice — pulls from template-base/frontend/slices/dashboard-shell.",
    source: "superspace",
    docsUrl: "",
    install: "",
    slicePath: "template-base/frontend/slices/dashboard-shell",
    convexPaths: [],
    npm: [],
    shadcn: ["sheet", "scroll-area", "separator", "tooltip"],
    env: [],
    peers: [],
    tags: ["ui", "layout", "dashboard", "sidebar", "topbar", "responsive"],
    usedBy: ["personal-brand-os", "agency-studio-os", "konsultan-os", "wirausaha-os", "kreator-studio-os", "riset-kit", "cms-public-storefront"],
    agentRecipe: "Run `npx rr add dashboard-shell`. Wraps app/(admin) routes. <ResponsiveDashboardShell sidebar={<AppSidebar />} topbar={<TopBar />}>{children}</ResponsiveDashboardShell>. Mobile: sidebar collapses to <Sheet>. Desktop: persistent sidebar + topbar. Embed FullWidthToggle in topbar for instant container resize.",
    previewPath: "/preview/slices/dashboard-shell",
    defaultView: "desktop",
    defaultZoom: 0.6,
    wiring: `import { ResponsiveDashboardShell } from "@/features/dashboard-shell";
import { FullWidthToggle } from "@/features/full-width-toggle";

<ResponsiveDashboardShell
  mode="authenticated"
  sidebar={<AppSidebar />}
  topbar={<><BreadcrumbSlot /><FullWidthToggle /></>}
>
  {children}
</ResponsiveDashboardShell>`,
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
    category: "realtime",
    kind: "ui",
    version: "0.1.0",
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
    agentRecipe: "Run `npx rr add broadcast-channel-sync`. Use BroadcastChannel only for demo / cross-iframe state mirroring. Production data still goes through Convex realtime. Use the useBroadcastSync(channelName, initial) hook from @/features/broadcast-channel-sync.",
    previewPath: "/preview/slices/broadcast-channel-sync",
    wiring: `import { useBroadcastSync } from "@/features/broadcast-channel-sync";

const [count, setCount] = useBroadcastSync("rr:counter", 0);
<button onClick={() => setCount(count + 1)}>{count}</button>
// Any tab on the same origin sees the change instantly.`,
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
    version: "0.2.0",
    tagline: "RBAC engine: 6 role presets + wildcard permissions + <PermissionGate>. Props-driven. No Clerk.",
    description: "RBAC engine ported from superspace. 6 system role presets (owner/admin/manager/staff/client/guest with levels), dot-namespaced permissions with `*` / `feature.*` wildcard matching, and pure check helpers (resolvePermissions / hasPermission / roleHasPermission). Props-driven UI primitives: <PermissionGate>, usePermissions, <RoleBadge>, <PermissionMatrix>. Convex template ships a tenant-scoped rbac_roles table + checkPermission / requirePermission helpers + idempotent seedSystemRoles, with a PLATFORM_ADMIN_EMAILS superadmin bypass. Pair with `user-management` for the members / invites / roles-admin UI. @convex-dev/auth aware — no Clerk.",
    source: "superspace",
    slicePath: "frontend/slices/rbac-roles",
    convexPaths: ["convex/features/rbac-roles"],
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
    version: "0.6.0",
    tagline: "Members · invites · roles · teams · hierarchy · access matrix — tabbed, permission-gated. Props-driven.",
    description: "Full superspace-parity user management, props-driven + RBAC-agnostic. <UserManagementPanel> tabs Members + Roles + Teams + Access: member table (search / filter / sort, inline role dropdown, soft-remove), InviteDialog (with an optional 'propagate to sub-workspaces' toggle — same / step-down role strategy) + PendingInvites, a RolesPanel (custom roles via permission matrix; system roles read-only), a TeamsPanel (named user groups), and an AccessMatrix (users × tenants grid with inline role assignment). All permission-gated. You pass `roles` + `currentPerms` + the permission catalog (resolved from rbac-roles) + callbacks; the slice imports no other slice's frontend. Convex ships um_members + um_invites + um_teams + um_team_members + um_tenant_links + member / invite / team / hierarchy endpoints + getAccessMatrix (gated via rbac-roles' requirePermission); roles CRUD reuses rbac-roles'. The hierarchy is a generic edge tree — rr never owns the tenant entities. P0–P4c: the complete user-management epic.",
    source: "superspace",
    slicePath: "frontend/slices/user-management",
    convexPaths: ["convex/features/user-management"],
    npm: [],
    shadcn: ["avatar", "badge", "button", "checkbox", "dialog", "dropdown-menu", "input", "label", "select", "switch", "table", "tabs", "textarea"],
    env: [],
    peers: [
      { slug: "rbac-roles", range: "^0.2", reason: "Roles + resolved permissions + convex permission helpers (requirePermission, getActorPermissions)." },
      { slug: "convex-auth", range: "^0.1", reason: "Member identity (name/email/avatar) joined from the users table." },
    ],
    tags: ["user-management", "members", "rbac", "auth", "team", "admin", "convex", "no-clerk"],
    usedBy: [],
    agentRecipe: "Run `npx rr add user-management` (pulls rbac-roles + convex-auth). Frontend: <MembersPanel members={useQuery(api[\"features/user-management/query\"].listMembers,{tenantId})} roles={ROLE_PRESETS.map(r=>({slug:r.slug,name:r.name,color:r.color}))} currentPerms={actorPerms} onUpdateRole={useMutation(...updateMemberRole)} onRemove={useMutation(...removeMember)} onInvite={openInvite} />. Wire roles + currentPerms from rbac-roles at the app level — the slice itself imports no other slice. Convex: spread userManagementTables; listMembers/mutations gate via rbac-roles requirePermission.",
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
    peers: [{ slug: "rbac-roles", range: "^0.1", reason: "Admin sections require RBAC perms — must seed roles first." }],
    tags: ["admin", "owner", "platform", "rbac", "instrumentation", "panel"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add admin-panel`. Wrap pages with <AdminPage workspaceId tier>. AccessGate hides UI for non-admins, AdminShell renders 2-col layout with sidebar filtered by tier+perms. ADMIN_SECTIONS in config.ts is SSOT (17 entries). Personal-brand-os = tier 'solo' = owner sees everything.",
    previewPath: "/preview/slices/admin-panel",
    defaultView: "desktop",
    defaultZoom: 0.65,
  },
  {
    slug: "event-tracking",
    title: "Event Tracking — P0 Instrumentation",
    category: "data",
    kind: "full",
    version: "0.1.0",
    description: "Client SDK + Convex ingestion endpoint for structured product events. Auto-captures page_view/signup/login + UTM/referrer/first-touch attribution. Batched flush via requestIdleCallback. Targets <100ms p99 ingestion.",
    source: "spec + superspace analytics",
    slicePath: "template-base/frontend/slices/admin-panel/slices/events",
    convexPaths: ["template-base/convex/features/admin-panel", "template-base/convex/features/analytics"],
    npm: [],
    shadcn: [],
    env: [],
    peers: [{ slug: "admin-panel", range: "^0.1", reason: "Lives under admin slice events subfolder." }],
    tags: ["events", "analytics", "instrumentation", "attribution", "utm", "p0"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add event-tracking`. Writes to analyticsEvents table (no new schema). Anonymous page_view allowed pre-signup; other events require workspaceId. Session id per tab (sessionStorage), first-touch UTM in localStorage. Flush every ~500ms via requestIdleCallback. Cap retry queue at 500.",
    previewPath: "/preview/slices/event-tracking",
    defaultView: "desktop",
    defaultZoom: 0.7,
  },
  {
    slug: "icon-picker",
    title: "Icon Picker",
    category: "ui",
    kind: "ui",
    version: "0.4.1",
    tagline: "Notion-style emoji + lucide + phosphor picker. Search, 10-color tint, smart positioning.",
    description: "Emoji + lucide (outline) + phosphor (fill) icon picker with search, 10-color palette, Twemoji/native toggle, recents tracking, and smart positioning. Two-tab layout (Emoji | Icon) with sub-variant pills (Native | Twemoji / Lucide | Phosphor fill). One string stores emoji OR lucide:Name OR phosphor:Name OR with ?c=hex tint — backwards-compat with raw-emoji fields. Popover auto-flips on collision (caps to Radix `--radix-popover-content-available-height`) and falls back to centered Dialog when neither side fits. Two variants: Popover (compact trigger) and Inline (full sheet/dialog use). Lifted 2026-05-25 from open-silong.",
    source: "open-silong",
    slicePath: "frontend/slices/icon-picker",
    convexPaths: [],
    npm: ["@phosphor-icons/react@^2.1.10"],
    shadcn: ["popover", "dialog", "button", "input", "scroll-area", "tabs"],
    env: [],
    peers: [],
    tags: ["icon", "emoji", "lucide", "phosphor", "picker", "twemoji", "notion", "notion-like", "responsive"],
    usedBy: ["personal-brand-os"],
    agentRecipe: "Run `npx rr add icon-picker` then `pnpm add @phosphor-icons/react`. parseIconValue() decodes; lucideValue() / phosphorValue() / withColor() build. Storage forms: `lucide:Name?c=hex` (outline) or `phosphor:Name?c=hex` (fill) or raw emoji. Add 'icon: v.string()' to Convex table — no migration needed for existing emoji + lucide fields. <IconPickerPopover> wraps any trigger (auto-flips, falls back to centered Dialog on tight viewports); <IconPickerInline> for sheets/dialogs. <DynamicIcon> renders from parsed value.",
    previewPath: "/preview/slices/icon-picker",
    defaultView: "tablet",
    defaultZoom: 0.9,
  },
  {
    slug: "activity",
    title: "Activity — public productivity log",
    category: "data",
    kind: "full",
    version: "0.1.0",
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
    version: "0.1.0",
    description: "Convex-backed per-key request counter. Atomic check-and-increment via `consume` mutation; expired rows pruned by `_pruneExpired` internalMutation wired to a 5-min cron. Replaces single-replica in-memory Map so multi-replica Next deployments share buckets. Caller chooses key namespace (csp:<ip>, mcp:<ip>, oauth_token:<ip>). Lifted 2026-05-16 from rahmanef.com.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/rate-limit",
    convexPaths: ["convex/features/rate-limit"],
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    tags: ["infra", "rate-limit", "convex", "backend", "throttle"],
    usedBy: [],
    agentRecipe: "Run `npx rr add rate-limit`. Compose `rateLimitTables` into root convex/schema.ts. Wire `internal.features.rate_limit.mutations._pruneExpired` into convex/crons.ts every 5 min. Call `api.features.rate_limit.mutations.consume({ key, limit, windowMs })` from server-side handlers — keep a fail-open wrapper so a Convex outage doesn't 503 the route.",
    previewPath: undefined,
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "testimonials",
    title: "Testimonials",
    category: "content",
    kind: "backend",
    version: "0.1.1",
    description: "Quote/name/role rotator backend. Public `listAll` + `get` (no auth — testimonials are public), admin CRUD via `requireAdmin`, internal `seed` for one-shot bootstrap. Indexed by `order` so carousel/grid keeps stable rotation. Lifted 2026-05-16 from rahmanef.com; token-based admin gate swapped for rr `_shared/auth`.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/testimonials",
    convexPaths: ["convex/features/testimonials"],
    npm: [],
    shadcn: [],
    env: [{ name: "SUPER_ADMIN_EMAIL", scope: "convex", required: false }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "requireAdmin uses getAuthUserId from @convex-dev/auth." }],
    tags: ["content", "testimonials", "convex", "backend", "marketing"],
    usedBy: [],
    agentRecipe: "Run `npx rr add testimonials`. Compose `testimonialsTables` into root schema. Bootstrap via `npx convex run internal.features.testimonials.mutations.seed '{\"items\":[{\"quote\":\"...\",\"name\":\"...\",\"role\":\"...\",\"order\":1}]}'`. Render with `useQuery(api.features.testimonials.queries.listAll)`.",
    previewPath: undefined,
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "services",
    title: "Services",
    category: "content",
    kind: "backend",
    version: "0.1.1",
    description: "Service offerings backend — title + summary + deliverables array + sort order. Public read, admin CRUD, internal seed. Pairs with a frontend services grid/list (consumer-side). Lifted 2026-05-16 from rahmanef.com; token-based admin gate swapped for rr `_shared/auth`.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/services",
    convexPaths: ["convex/features/services"],
    npm: [],
    shadcn: [],
    env: [{ name: "SUPER_ADMIN_EMAIL", scope: "convex", required: false }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "requireAdmin uses getAuthUserId from @convex-dev/auth." }],
    tags: ["content", "services", "convex", "backend", "marketing", "agency"],
    usedBy: [],
    agentRecipe: "Run `npx rr add services`. Compose `servicesTables` into root schema. Use `useQuery(api.features.services.queries.listAll)` from a server component / route to render service cards. CRUD via admin UI calling `create` / `update` / `remove` after `requireAdmin` passes.",
    previewPath: undefined,
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "create-your-mcp",
    title: "Create Your MCP",
    category: "ai",
    kind: "full",
    version: "0.1.1",
    description: "Turn any rr-based app into an MCP server that ChatGPT custom apps, Claude.ai connectors, Cursor MCP, and other AI clients authenticate to. OAuth 2.1 + PKCE flow with code → bearer exchange, env-configured vendor-host allowlist, single-use codes, 1-year bearer tokens, scope-tagged tools, opaque error collapsing, constant-time token compare. Static MCP_API_KEY fallback for service-account / CI scripts. Sanitized 2026-05-16 from rahmanef.com's production MCP integration — vendor literals (chatgpt.com / OpenAI paths) replaced with MCP_OAUTH_ALLOWED_HOSTS + MCP_OAUTH_ALLOWED_PATH_PREFIXES env vars so the slice ships portable.",
    source: "rahmanef.com",
    slicePath: "frontend/slices/create-your-mcp",
    convexPaths: ["convex/features/create-your-mcp"],
    npm: [],
    shadcn: [],
    env: [
      { name: "MCP_API_KEY", scope: "server", required: false, description: "Static bearer for service-account / CI access. Min 32 chars. Must match Convex env." },
      { name: "MCP_OAUTH_ALLOWED_HOSTS", scope: "convex", required: false, description: "CSV vendor domains for redirect_uri (chatgpt.com,claude.ai,cursor.sh)." },
      { name: "MCP_OAUTH_ALLOWED_PATH_PREFIXES", scope: "convex", required: false, description: "CSV path prefixes under allowed hosts (/aip/,/connector/,/oauth/)." },
      { name: "NEXT_PUBLIC_SITE_URL", scope: "next-public", required: true, description: "Public site origin for WWW-Authenticate challenge." },
    ],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "requireAdmin uses getAuthUserId from @convex-dev/auth." }],
    tags: ["ai", "mcp", "oauth", "pkce", "chatgpt", "claude", "cursor", "convex", "integration"],
    usedBy: [],
    agentRecipe: "Run `npx rr add create-your-mcp`. Compose `createYourMcpTables` into root schema. Move `slices/create-your-mcp/routes/mcp.route.ts` → `app/api/mcp/route.ts` and `oauth-token.route.ts` → `app/api/oauth/token/route.ts`. Set MCP_OAUTH_ALLOWED_HOSTS (CSV vendor domains). Mount `<McpAdminView />` at /admin/mcp. Connect ChatGPT/Claude/Cursor via the setup form rendered by the admin view.",
    previewPath: "/preview/slices/create-your-mcp",
    defaultView: "desktop",
    defaultZoom: 0.75,
  },
  {
    slug: "contact-form-resend",
    title: "Contact Form + Resend",
    category: "email",
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
    title: "Admin — Generic Shell",
    category: "infra",
    kind: "full",
    version: "0.2.1",
    description: "Per-instance admin landing scaffold + portable nav-from-registry factory. Consumer supplies a SliceRegistryAdapter (each slice declares its own admin.activity[]) + queryTable reader; the slice's buildAdminStats(opts) emits the { counts, unreadMessages, activity } shape Convex's admin.stats query returns. Pulled UP from rahmanef.com (Wave N+3.1, commit b542389) — domain literals dropped at the kitab boundary. Gated by requireAdmin on Convex side; superadmin email gate via SUPER_ADMIN_EMAIL env.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/admin",
    convexPaths: ["convex/features/admin"],
    npm: [],
    shadcn: ["card", "button"],
    env: [{ name: "SUPER_ADMIN_EMAIL", scope: "convex", required: false }],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "requireAdmin gate uses convex-auth user identity." }],
    tags: ["infra", "admin", "shell", "crud", "nav-from-registry"],
    usedBy: [],
    agentRecipe: "Run `rr add admin`. Wire <AdminPage labels={...} /> at /admin and call buildAdminStats({ sliceRegistry, queryTable }) inside convex/features/admin/query.ts — sliceRegistry.entries flat-maps each feature's admin.activity[] declarations. Set SUPER_ADMIN_EMAIL via `npx convex env set` to lock down /admin to one address.",
    previewPath: "/preview/slices/admin",
    defaultView: "desktop",
    defaultZoom: 0.65,
  },
  {
    slug: "platform-admin",
    title: "Platform Admin — Multi-Tenant Control Plane",
    category: "infra",
    kind: "full",
    version: "0.1.0",
    description: "Multi-tenant SaaS control plane. Workspace lifecycle ops (list/delete/cascade), per-tenant tier presets (gates + quota), KPI dashboard grid. Consumer-domain bits injected via adapter props (tenantTablesAdapter / tierPresets / kpiSources). Contract-only scaffold; canonical implementation lands via /rr-send from superspace. See docs/contract-negotiations-2026-05-15.md §4.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/platform-admin",
    convexPaths: [],
    npm: [],
    shadcn: [],
    env: [{ name: "PLATFORM_ADMIN_EMAILS", scope: "convex", required: true, description: "Comma-separated list of platform admin email addresses." }],
    peers: [
      { slug: "convex-auth", range: "^0.1", reason: "Actor identity for audit + tier-set ops." },
      { slug: "audit-log", range: "^0.2", reason: "padmin_audit table feeds through audit-log TenantAdapter." },
    ],
    tags: ["infra", "admin", "multi-tenant", "saas", "platform"],
    usedBy: [],
    agentRecipe: "Run `npx rr add platform-admin`. Contract-only scaffold. Wait for superspace /rr-send platform-admin before adopting. Distinct from per-instance `admin` slug.",
    previewPath: "/preview/slices/platform-admin",
    defaultView: "desktop",
    defaultZoom: 0.7,
  },
  {
    slug: "audit-log",
    title: "Audit Log — Workspace Events",
    category: "infra",
    kind: "backend",
    version: "0.2.0",
    description: "Workspace-scoped audit event recorder. Canonical logAuditEvent helper for mutations + actions; supports entity tracking, before/after diff, IP/user-agent capture.",
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/audit-log",
    convexPaths: ["convex/features/audit-log"],
    npm: [],
    shadcn: [],
    env: [],
    peers: [{ slug: "convex-auth", range: "^0.1", reason: "Event actor resolved via authenticated user." }],
    tags: ["infra", "audit", "compliance", "logging"],
    usedBy: [],
    agentRecipe: "Run `rr add audit-log`. Import logAuditEvent from convex/_shared/auditLogger.ts and call inside every workspace-scoped mutation with { action, workspaceId, entityType, entityId, before?, after? }.",
    previewPath: "/preview/slices/audit-log",
    defaultView: "desktop",
    defaultZoom: 0.7,
  },
  {
    slug: "comments",
    title: "Comments — Threaded",
    category: "content",
    kind: "full",
    version: "0.2.1",
    description: "Polymorphic-target threaded comments. Consumer picks `TargetRef = { kind, id, subId? }` (e.g. page+block, blog+slug, task+id). Renderless <CommentsThread> + <CommentsAnchor> wrappers. useComments(bindings, opts) hook returns items + openCount + CRUD + forbiddenWords guard. Adapter pattern — see contract-negotiations §1.",
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
    version: "0.2.1",
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
    slug: "landing-sections",
    title: "Landing Sections",
    category: "infra",
    kind: "ui",
    version: "0.2.0",
    tagline: "CRUD admin for landing-page composition: reorderable sections + bg image + custom className.",
    description: "Canonical landing-page composition slice — replaces the former standalone hero / cta / pricing-page / faq-section / feature-grid / testimonials-grid / blog-section / portfolio-section / changelog-feed slices (all merged here as `kind` variants in v0.2.0). Ships a pure reducer + LandingProvider store adapter + admin LandingView/LandingEditorView built on the shared CRUD primitives, plus a per-section LandingSectionShell that handles background image + custom Tailwind className overlay. Sections carry { kind, order, title, subtitle, enabled, imageUrl, imageRatio, bgImageUrl, className, config (JSON) } with up/down reorder arrows. Consumers map each `kind` (hero, features, pricing, blog, changelog, testimonials, portfolio, services, stats, newsletter, faq, cta, custom) to their own renderer wrapped in <LandingSectionShell>. Used by all 7 rr website templates.",
    source: "rahman-resources",
    slicePath: "frontend/slices/landing-sections",
    convexPaths: [],
    npm: ["lucide-react@^0.400.0"],
    shadcn: ["badge", "button", "dialog", "input", "label", "select", "switch", "table", "textarea"],
    env: [],
    peers: [],
    tags: ["admin", "landing", "cms", "sections", "crud"],
    usedBy: ["saas-marketing-os", "personal-brand", "agency-studio", "konsultan-os", "kreator-studio", "wirausaha-os", "riset-kit"],
    agentRecipe: "Run `npx rr add landing-sections`. Fold `landingReducer` into your root reducer (cases LANDING_UPSERT + LANDING_DELETE), seed State.landingSections with `defaultLandingSections()`, wrap your StoreProvider with `<LandingProvider value={adapter}/>` where adapter maps {items, publicBase, adminBase, create, update, remove} from your dispatch. Mount `<LandingView/>` at `/admin/landing` and `<LandingEditorView id={params.id}/>` at `/admin/landing/[id]`. In HomePage iterate `state.landingSections.filter(s => s.enabled).sort((a,b) => a.order - b.order)` and render each through `<LandingSectionShell section={s}>` wrapping your own per-`kind` renderer.",
  },
  {
    slug: "theme-presets",
    title: "Theme Presets — unified switcher with bundled tweakcn registry",
    category: "ui",
    kind: "ui",
    version: "0.2.0",
    tagline: "ONE switcher: light/dark/system + ~30 color presets in one Popover. Registry ships inside the slice — no public/ setup.",
    description: "Single unified theme controller for next-themes apps. ThemePresetSwitcher ships a Palette-icon Popover trigger with three stacked sections: (1) sticky light/dark/system mode tabs, (2) sticky preset-count row with a Default reset button, (3) scrollable color-preset list grouped by mood (Profesional / Bold / Hangat / Artistik / Gelap + Lainnya). Hover-to-preview + click-to-commit + restore-on-close semantics. ThemePresetProvider context wraps state so deeply-nested consumers read via useThemePreset() instead of mounting the switcher directly. ThemeColorSync wrapper enables live tweakcn-CSS-variable preview on routes that need it. Tweakcn registry (~30 curated presets after HIDDEN_PRESETS filter drops Doom 64 / Cyberpunk / Neo Brutalism / Bubblegum / Candyland / Pastel Dreams) ships inside the slice as registry-data.json and loads lazily via dynamic import — code-splits into its own chunk, zero consumer public/ setup, no network roundtrip to a hosted URL. localStorage key `host:theme-preset` (rename via slice fork). CK-1F (2026-05-23) — collapsed prior TweakcnSwitcher + ThemePicker + phantom `theme-preset-switcher` catalog entry into this single component.",
    source: "CareerPack + notion-page-clone",
    slicePath: "frontend/slices/theme-presets",
    convexPaths: [],
    npm: ["next-themes@^0.4.6"],
    shadcn: ["button", "popover"],
    env: [],
    peers: [],
    tags: ["ui", "theme", "tweakcn", "color", "preset", "switcher", "popover", "next-themes", "notion-like"],
    usedBy: [],
    agentRecipe: "Run `npx rr add theme-presets` (registry-data.json ships inside the slice — no separate public/ copy step). Wrap your tree once with `<ThemePresetProvider>` (inside next-themes' ThemeProvider). Mount `<ThemePresetSwitcher />` anywhere in your header / sidebar / settings — one component handles light/dark/system + preset palette. Wrap dashboard with `<ThemeColorSync>` if you need live tweakcn variable preview on inner routes. Deeply-nested consumers read state via `useThemePreset()` (returns `{ presetName, registry, setPreset, preview, restore, isReady }`). For lower-level access: `applyTweakcnPreset(name)`, `previewTweakcnPreset(name)`, `restoreTweakcnPreset()`, `groupTweakcnPresets(items)`, `tweakcnSwatches(preset)` all exported from `@/features/theme-presets`. To rename localStorage key, fork `STORAGE_KEY` in `lib/tweakcn/types.ts`.",
    previewPath: "/preview/slices/theme-presets",
    defaultView: "desktop",
    defaultZoom: 0.9,
  },
  {
    slug: "files",
    title: "Files — pluggable upload + URL resolver with storage-adapter contract",
    category: "data",
    kind: "ui",
    version: "0.2.1",
    tagline: "Upload + URL resolver behind a storage adapter. localStorage demo, swap to Convex/S3.",
    description: "Host-pluggable file upload + URL resolution. Ships <FileUploadButton>, <FileChip>, useFileUpload(), useFileUrl() — all reading from a FilesAdapter the host wires via <FilesAdapterProvider>. Bundled localStorage demo adapter stores blobs as data URLs (small files only). Drop in your own adapter for Convex / S3 / GCS / R2. The slice itself has zero backend coupling, proving the storage-adapter pattern for the rest of the open-silong blocked-pending-adapter wave (cover, workspace-io, templates, …).",
    source: "notion-page-clone",
    slicePath: "frontend/slices/files",
    convexPaths: [],
    npm: [],
    shadcn: ["button"],
    env: [],
    peers: [],
    tags: ["data", "upload", "files", "storage", "adapter", "portable", "notion-like"],
    usedBy: [],
    agentRecipe: "Run `npx rr add files`. Wrap your tree with `<FilesAdapterProvider adapter={...}>` — pass `useLocalStorageFilesAdapter()` for a quick demo or implement `FilesAdapter` (upload + remove + useUrl) against your backend. Then drop `<FileUploadButton onUploaded={...}>` anywhere; pair with `<FileChip fileRef={...}>` for rendered chips. Hooks: `useFileUpload()` returns `{upload, uploading, progress, removeFromStorage}`; `useFileUrl(storageId)` resolves to a fetchable URL (Convex adapter uses useQuery for live invalidation; demo reads localStorage synchronously). To wire S3: implement the FilesAdapter interface with presigned URLs + DELETE; the slice doesn't care which backend you pick.",
    previewPath: "/preview/slices/files",
    defaultView: "desktop",
    defaultZoom: 0.9,
  },
  {
    slug: "selection",
    title: "Selection — marquee multi-select + bulk actions",
    category: "ui",
    kind: "ui",
    version: "0.2.0",
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
    slug: "notion-database",
    title: "Notion Database",
    category: "ui",
    kind: "ui",
    version: "0.17.0",
    maturity: "beta",
    tagline: "Drop-in Notion-style database — 11 views, 18 cell types, per-type column config, cell drag-fill. Pure & props-driven.",
    description: "Drop-in Notion-style database surface. 11 views (table, board, list, gallery, calendar, feed, chart, dashboard, form, map, timeline), 18 property/cell types, and a per-type column-header config menu (number format, date ranges, select, relation, rollup, formula) plus filter / sort / group / calculate, row peek, row multi-select, table cell selection + drag-to-fill (click a cell, drag the handle to copy down — merged from the former database-cell-selection slice in v0.16), and CSV + JSON import-export. Pure and props-driven — the host owns the data and dispatches change callbacks. Domain types live in notion-shell (install it as the peer). Full release history in CHANGELOG.md.",
    source: "open-silong",
    slicePath: "frontend/slices/notion-database",
    convexPaths: [
      "template-base/database-silong/convex/handlers/databases.ts",
      "template-base/database-silong/convex/handlers/pages.ts",
      "template-base/database-silong/convex/schema.database-silong.ts",
    ],
    npm: ["recharts@^2.13.0"],
    shadcn: ["button", "input", "checkbox", "dropdown-menu", "popover", "select", "dialog", "sheet", "toggle-group", "tooltip", "separator"],
    env: [],
    peers: [
      { slug: "notion-shell", range: "^0.7", reason: "Domain types live in notion-shell. v0.7 extends Database with `locked` flag for the DatabaseMenu lock-toggle action." },
    ],
    tags: ["ui", "notion", "notion-like", "database", "table", "board", "list", "gallery", "calendar", "feed", "chart", "dashboard", "form", "map", "timeline", "gantt", "kanban", "views", "filter", "sort", "property", "files", "person", "formula", "timestamp", "unique-id", "csv", "json", "import", "export", "template", "data", "backup", "primitive", "optional", "embeddable"],
    usedBy: ["notion-page-clone-os"],
    agentRecipe: "**Controlled component.** `<NotionDatabase />` renders the whole surface — 11 views (table, board, list, gallery, calendar, feed, chart, dashboard, form, map, timeline), 18 cell types, filter / sort / group / calculate, row peek + multi-select, table cell drag-fill, CSV / JSON import-export. It is 100% props-driven: it owns NO data state — you hold `db` + `rows` and persist every change callback. The view tab strip scrolls horizontally and the card clips to its border, so it stays inside any container width.\n\n**1. Install** — `npx rr add notion-database`. Cascades the `notion-shell` peer (the domain types live there). Components import from `@/features/notion-database`; types from `@/features/notion-shell`.\n\n**2. Minimal wire-up** — keep `db: Database` + `rows: Page[]` in your store (a Convex query result or `useState`) and pass change handlers:\n```tsx\nimport { NotionDatabase } from '@/features/notion-database';\n\n<NotionDatabase\n  db={db}\n  rows={rows}\n  onRowAdd={addRow}\n  onRowUpdate={(rowId, propId, value) => setValue(rowId, propId, value)}\n  onRowRemove={removeRow}\n  onPropertyAdd={addProperty}\n  onViewActivate={setActiveView}\n  onViewAdd={addView}\n  onViewConfigChange={(viewId, patch) => patchView(viewId, patch)}\n/>\n```\nOmit any callback and that affordance goes read-only; pass `readOnly` to freeze everything at once.\n\n**3. Data shape** — `Database = { id, name, properties: Property[], views: DatabaseViewConfig[], activeViewId }`; each row `Page = { id, title, rowProps: Record<propId, PropertyValue> }`. For `relation` / `rollup` cells also pass `pages` + `databases`; for `person` / `created_by` cells pass `userLookup(id)`.\n\n**4. Import / export** — mount `<DatabaseIOActions db={db} rows={rows} onImport={handleImport} />` in your toolbar: CSV/JSON in (with schema-diff), CSV/JSON + live-schema templates out. New columns arrive with a `tempId` — map it to your real backend id before writing their `rowProps`.\n\n**5. Backend (optional)** — the UI is store-agnostic. For Convex persistence copy `template-base/database-silong/convex/` (handlers → `convex/`, schema fragment merges into `convex/schema.ts`). Pick `_shared/minimal/` (single-user, noop authz) or `_shared/full/` (`@convex-dev/auth` + workspaces). See CONVEX-BACKEND.md.\n\n**Just one view?** Import it directly — `import { TableView } from '@/features/notion-database'` — and feed it `rows` + `renderCell` + `renderColumnHeader`.",
    previewPath: "/preview/slices/notion-database",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "image-picker",
    title: "Image Picker — one-button image/wallpaper chooser (gallery · upload · link · Unsplash · reposition)",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    maturity: "beta",
    tagline: "ONE button opens a dialog: gallery (colours/gradients/textures), upload, paste URL, Unsplash search. Set any image — wallpaper, cover, profile header. Props-driven, no backend lock-in.",
    description: "Generic image/wallpaper picker — not coupled to Notion. The headline API is ONE button (ImagePickerButton) that opens a dialog with 4 tabs: Gallery (12 colours + 8 gradients + Notion textures), Upload (drag/click, ≤8MB), Link (paste any https image URL), Unsplash (bundled curated landscapes + live search). On pick, onChange fires with an ImageValue ({ type, value, positionY?, metadata? }). ImageBanner is the optional reposition-able band — render an ImageValue as a full-width cover / profile header / card hero with hover controls: Change (opens the dialog), Reposition (drag the vertical focal point), Remove. The slice imports NO other slice and NO backend — the upload backend and Unsplash search are INJECTED as props (onUpload + searchUnsplash), so it drops into any app: wire onUpload to the `files` slice and searchUnsplash to a server route via unsplashSearchVia('/api/unsplash') that holds UNSPLASH_ACCESS_KEY server-side (never NEXT_PUBLIC). Ships a curated Unsplash fallback + gallery so it works with zero config. parseImage normalizes legacy raw-string values; imageStyle builds the focal-point CSS. Wired into the notion-page-clone template as the page cover via NotionPage's coverSlot.",
    source: "notion-page-clone",
    slicePath: "frontend/slices/image-picker",
    convexPaths: [],
    npm: [],
    shadcn: ["dialog", "button", "input"],
    env: [{ name: "UNSPLASH_ACCESS_KEY", scope: "server", required: false, description: "Server-side only (e.g. on the /api/unsplash route). Without it the Unsplash tab falls back to the curated set." }],
    peers: [],
    tags: ["ui", "image", "picker", "wallpaper", "cover", "upload", "unsplash", "gallery", "reposition", "files", "primitive", "portable", "dialog"],
    usedBy: ["notion-page-clone-os"],
    agentRecipe: "Run `npx rr add image-picker`. The headline component is `<ImagePickerButton label=\"Change wallpaper\" onChange={(img)=>save(img)} onUpload={…} searchUnsplash={…} />` — ONE button that opens the 4-tab dialog (gallery / upload / link / Unsplash). For a reposition-able cover/hero band use `<ImageBanner image={value} onChange={save} resolvedUrl={…} onUpload={…} searchUnsplash={…} />` (also passable to notion-shell's `<NotionPage coverSlot={…} />`). Inject the backend: `onUpload` = the `files` slice's useFileUpload().upload (returns a FileRef); resolve upload images for display with `resolvedUrl` = files useFileUrl(parseFileRef(imageRef(parseImage(value))).storageId). `searchUnsplash` = `unsplashSearchVia('/api/unsplash')` — add a server route that proxies api.unsplash.com with UNSPLASH_ACCESS_KEY (never expose the key client-side). Ships a curated Unsplash + gallery fallback so it works with zero wiring. ImageValue = { type, value, positionY?, metadata? }; parseImage handles legacy string values.",
    previewPath: "/preview/slices/image-picker",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "notion-sidebar",
    title: "Notion Sidebar — tree nav + page CRUD (rename · drag · icon picker)",
    category: "ui",
    kind: "ui",
    version: "0.1.0",
    maturity: "beta",
    tagline: "Standalone Notion-style tree-nav sidebar: double-click rename, drag-reorder/reparent, per-row icon picker. Props-driven + decoupled.",
    description: "Standalone Notion-style tree-nav sidebar with full page CRUD, lifted out of notion-shell so it is reusable on its own. Props-driven + fully decoupled — owns its own lightweight NotionSidebarPage type (id / title / icon / parentId), imports no other slice. Capabilities: click a row to open; DOUBLE-CLICK a title to rename inline; drag the grip to reorder AND reparent (a @dnd-kit sortable tree with horizontal-offset depth projection); collapse/expand subtrees; hover a row for +subpage / delete. Optional per-row icon PICKER — wire `renderIconPicker` + `onIconChange` (e.g. @/features/icon-picker's IconPickerPopover) so clicking a row icon opens the picker. The host owns the data and dispatches onSelect / onCreate / onRename / onDelete / onMove / onIconChange. Compose with notion-shell (page editor) + notion-database (embedded DBs) for the full Notion-clone OS — see the notion-page-clone-os template.",
    source: "notion-page-clone",
    slicePath: "frontend/slices/notion-sidebar",
    convexPaths: [],
    npm: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
    shadcn: ["button", "input"],
    env: [],
    peers: [],
    tags: ["ui", "notion", "sidebar", "tree", "nav", "page", "crud", "rename", "drag", "dnd", "reorder", "reparent", "icon-picker", "primitive", "portable", "notion-like"],
    usedBy: ["notion-page-clone-os"],
    agentRecipe: "Run `npx rr add notion-sidebar`. Import `import { NotionSidebar, type NotionSidebarPage } from \"@/features/notion-sidebar\"`. Feed it a flat `pages: NotionSidebarPage[]` ({ id, title, icon, parentId }) — the sidebar builds the tree. Wire callbacks: onSelect(id), onCreate(parentId|null), onRename(id, title) [double-click a title to trigger], onDelete(id), onMove(id, parentId, beforeId) [drag the grip — reorders + reparents], onIconChange(id, icon). For rich icons pass `renderIcon` (display) + `renderIconPicker` (click-to-pick) wired to `@/features/icon-picker` (DynamicIcon + IconPickerPopover). npm: @dnd-kit/core + sortable + utilities. Pair with notion-shell (page editor) + notion-database (embedded DBs) — the notion-page-clone-os template shows the full reducer wiring.",
    previewPath: "/preview/slices/notion-sidebar",
    defaultView: "desktop",
    defaultZoom: 1,
  },
  {
    slug: "notion-shell",
    title: "Notion Shell — page + block editor primitives (pure, no sidebar/database)",
    category: "ui",
    kind: "ui",
    version: "0.23.0",
    maturity: "beta",
    tagline: "Portable Notion-style PAGE editor: blocks + slash menu + inline toolbar + colour + layout + built-in code/equation + cover slot. Pair with notion-sidebar + notion-database + image-picker.",
    description: "Portable Notion-style PAGE EDITOR primitives. v0.22 split the tree-nav SIDEBAR out into the standalone `notion-sidebar` slice (so the page editor and the sidebar are independently reusable); embedded DATABASES already live in the `notion-database` peer. notion-shell ships: NotionPage (optional cover image band + header + body), NotionHeader, NotionBlock (live inline-markdown decorator, hover actions menu, optional dragHandle slot, BUILT-IN code (highlight.js) + equation (KaTeX) blocks), SlashMenu (searchable block-type picker w/ keyboard nav), BlockActionsMenu (turn-into / duplicate / delete), InsertBlockButton (`+` trigger w/ SlashMenu), SortableBlockList (@dnd-kit render-prop wrapper for block reorder), PageActionsMenu (header dropdown: cover/favorite/duplicate/export/trash), InlineFormatToolbar + BlockColorPicker (colour) + MentionTypeahead + PageLayoutSection (layout). SPECIALISED BLOCK RENDERERS: ImageRenderer, EmbedRenderer (YouTube/Vimeo/Loom/Figma/CodePen/Spotify auto-detect). Domain types (Database, Property, PropertyValue, DbView, DatabaseViewConfig, DatabaseFilter, DatabaseSort) remain in notion-shell as the single source of truth (Page.rowOfDatabaseId + rowProps reference them). Pure / props-driven — host owns data + change handlers. Compose notion-sidebar + notion-shell + notion-database for the full Notion-clone OS.",
    source: "notion-page-clone",
    slicePath: "frontend/slices/notion-shell",
    convexPaths: [],
    npm: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "katex@^0.16.45", "highlight.js@^11.11.1"],
    shadcn: ["button", "input", "checkbox", "dropdown-menu", "popover"],
    env: [],
    peers: [],
    tags: ["ui", "notion", "shell", "wrapper", "page", "block", "editor", "primitive", "portable", "slash-menu", "decorator", "wysiwyg", "drag", "cover", "embed", "image", "code", "equation", "notion-like"],
    usedBy: ["notion-page-clone-os"],
    agentRecipe: "Run `npx rr add notion-shell` for the portable PAGE EDITOR wrappers ONLY (no backend; the tree-nav sidebar is the separate `notion-sidebar` slice). NPM deps: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities. Import: `import { NotionPage, NotionBlock, SortableBlockList, PageActionsMenu, InsertBlockButton, InlineFormatToolbar, ImageRenderer, EmbedRenderer } from \"@/features/notion-shell\"`. NotionBlock ships slash menu + decorator + actions menu + dragHandle slot. **`createDefaultBlockRenderers()` returns the block-renderer registry — pass it to `<NotionBlock blockRenderers={…}>` so callout (icon+kind picker), table (editable grid), divider, image, embed, code (highlight.js) + equation (KaTeX) all render. code + equation are now BUILT-IN to notion-shell (npm: katex + highlight.js) — no adapter needed. Only `database` + `toc` are injected at the app level (they depend on host data + the sibling notion-database slice).** NotionPage ships optional cover prop. SortableBlockList wraps a render-prop callback `(id, dragProps) => <NotionBlock dragHandle={...} />`. NotionDatabase ships 6 views via VIEW_REGISTRY. Property cells: text/number/checkbox/select/multi-select/status/date/url/email/phone all built in. For rich icon UX wire `renderIcon` + `renderIconPicker` to `@/features/icon-picker`. **v0.17 — Notion-canonical editing keys (`blockKeyHandler.ts`): Enter splits at the caret into a new block (lists continue their type; an empty list item exits to paragraph); Backspace on an empty non-paragraph downgrades it to a plain paragraph (re-triggerable with `/`); a second Backspace on an empty paragraph merges into the previous block; Arrow up/down at a line edge hops blocks. Wire the host callbacks on `<NotionBlock>`: `onInsertAfter(type, init) => newId`, `onMergeBack()`, `onFocusSibling(dir)` — plus `focusBlock(id, offset?)` exported to move the caret after a host state change. The preview `page-demo.tsx` and the notion-clone template `DocView` show full array- and reducer-based wirings.** PRODUCT POINTER: the full Convex-backed Notion-clone OS (multi-workspace + auth + sharing + comments + snapshots + MCP) lives at https://github.com/rahmanef63/open-silong — clone that repo for the production stack; use this slice when you only need to embed the Notion-style UI in another project.**",
    previewPath: "/preview/slices/notion-shell",
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
    version: "0.1.0",
    description: "Grab-bag resource hub. One polymorphic `libraryItems` table holds six kinds — prompt, image, video, link, download, snippet — with per-kind payload fields switched on `kind` (no joins). Attribution-first: every item carries optional source/license/tools so re-shares stay correct. Collections group items. Convex-backed (schema + queries + unauthenticated mutations); SEO override fields reused from the `seo` peer slice so the surface matches blog/projects rows. Public view = filterable card grid + per-item detail with copy-to-clipboard for prompts/snippets and an opt-in upvote control. Lifted 2026-05-28 from rahmanef.com; 432-LOC mutations + 330-LOC detail split for the 200-LOC cap; Indonesian copy + custom primitives stripped (prop-driven English defaults); cross-slice auth + comments-votes coupling dropped (consumer wraps mutations + supplies the upvote handler).",
    source: "rahmanef.com",
    slicePath: "frontend/slices/library",
    convexPaths: ["convex/features/library"],
    npm: ["convex@^1.17", "next@^15", "react@^18"],
    shadcn: [],
    env: [],
    peers: [{ slug: "seo", range: "^0.2", reason: "Library item SEO override fields reuse the seo slice's metadata shape so the surface matches blog/projects rows." }],
    tags: ["library", "resources", "prompts", "snippets", "moodboard", "downloads", "attribution", "seo", "personal-brand"],
    usedBy: [],
    agentRecipe: "Run `npx rr add seo` (peer) then `npx rr add library`. Spread `seoTables` + `libraryTables` into your root Convex schema. Wrap the unauthenticated CRUD `internalMutation`s with your auth model (see README Install). Render `<LibraryIndex items={await fetchQuery(api.library.listPublic)} />` and `<LibraryDetail item={await fetchQuery(api.library.getBySlug, { slug })} />`. Pass `onUpvote` to enable voting (consumer-owned backend); override `copy` + `kindLabels` per consumer.",
    previewPath: undefined,
    defaultView: "desktop",
    defaultZoom: 0.85,
  },
];

export function getSlice(slug: string): SliceEntry | null {
  return slices.find((s) => s.slug === slug) ?? null;
}
