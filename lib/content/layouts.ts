import type { PreviewView } from "@/lib/preview-presets";

export type LayoutStatus =
  | "stable"        // production-ready, default (available)
  | "beta"          // feature-complete, polishing
  | "wip"           // in-develop — visible but flagged not-ready
  | "draft"         // hidden from default catalog
  | "experimental"  // research preview, may break
  | "deprecated"    // scheduled for removal
  | "coming-soon";  // announced, not yet shipped

export type LayoutEntry = {
  slug: string;
  title: string;
  category: "marketing" | "dashboard" | "cms" | "website-template";
  /** Build-readiness signal. Defaults to "stable" when omitted. */
  status?: LayoutStatus;
  description: string;
  source: string;
  repoPath: string;
  primaryFile: string;
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
  /** Folders to pull when scaffolding this template into a target project.
   *  Agent commands (degit / sparse-checkout) generated from these. */
  pullPaths?: string[];
  /** Selected files to surface in the Code tab tree (subset of pullPaths). */
  files?: string[];
  /** npm packages this template needs (extras beyond the base shadcn stack). */
  dependencies?: string[];
  /** shadcn primitives this template imports from `@/components/ui/*`.
   *  CLI runs `npx shadcn add <list>` after pulling files so the template
   *  compiles cleanly without the user hand-installing each component. */
  shadcnComponents?: string[];
  /** Optional path to a live in-site demo (rendered in iframe on the detail page). */
  previewPath?: string;
  /** External live demo — the template's own Vercel deployment (dev-lab repo,
   *  always ahead of rr's snapshot). Overrides the demo-subdomain link. */
  demoUrl?: string;
  /** Optional second preview surface — admin/dashboard side of a full-app template. */
  adminPreviewPath?: string;
  /** When both preview paths exist, which surface opens first. Defaults to "public". */
  defaultSurface?: "public" | "admin";
  /** Initial preview viewport. Defaults to desktop. */
  defaultView?: PreviewView;
  /** Initial preview zoom (1.0 = real size). */
  defaultZoom?: number;
};

export const layouts: LayoutEntry[] = [];

export function getLayout(slug: string) {
  return layouts.find((l) => l.slug === slug) ?? null;
}
