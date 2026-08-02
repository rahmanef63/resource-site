import type { PreviewView } from "@/lib/preview-presets";
import type { SliceFile } from "@/lib/slice-files";

export type TemplateDetailData = {
  slug: string;
  title: string;
  description: string;
  source: string;
  repoPath: string;
  primaryFile?: string;
  files?: string[];
  pullPaths?: string[];
  /** Server-pre-read file contents for the in-browser code viewer. */
  codeFiles?: SliceFile[];
  /** Root path the codeFiles were read from — shown as a header in the
   *  viewer. Typically equals `repoPath` or the first `pullPaths` entry. */
  codeRootPath?: string;
  dependencies?: string[];
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
  previewPath?: string;
  adminPreviewPath?: string;
  /** External live demo (template's own Vercel deployment). Overrides the
   *  demo-subdomain link when present. */
  demoUrl?: string;
  defaultSurface?: "public" | "admin";
  defaultView?: PreviewView;
  defaultZoom?: number;
  badge?: string;
  /** Maturity / status badge (beta / wip / deprecated / etc.). */
  status?:
    | "stable" | "beta" | "wip" | "draft" | "experimental"
    | "deprecated" | "coming-soon";
};

export type TemplateDetailNeighbor = { slug: string; title: string };
