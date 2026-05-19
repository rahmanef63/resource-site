import type { LandingSection } from "@/components/templates/_shared/landing/types";
import type { State, Snippet } from "./types";

const now = () => Date.now();

/** Notion-OS specific landing seed — features + custom snippets gallery
 *  tuned to the notion-blocks demo. Public homepage reads + renders these
 *  via LandingRenderer; admin edits them at /admin/landing. */
function nosionLandingSections(): LandingSection[] {
  return [
    {
      id: "ls-hero",
      order: 10,
      kind: "hero",
      title: "Block-based writing surface, in 4 primitives.",
      subtitle:
        "Equations, code, subscriptions, drag-fill grids. Each is a portable rr slice — drop into any React surface without convex or store coupling.",
      enabled: true,
    },
    {
      id: "ls-features",
      order: 20,
      kind: "features",
      title: "What ships in notion-blocks",
      subtitle: "Four notion-style primitives, one install.",
      enabled: true,
    },
    {
      id: "ls-snippets",
      order: 30,
      kind: "custom",
      title: "Live snippets gallery",
      subtitle: "Each entry below is admin-editable — add via /admin/snippets, renders live here.",
      enabled: true,
    },
    {
      id: "ls-cta",
      order: 40,
      kind: "cta",
      title: "Lift the whole bundle into your project.",
      subtitle: "Run `npx rr add notion-blocks` — cascades all four peer slices + every shared dep.",
      enabled: true,
    },
  ];
}

const SEED_SNIPPETS: Snippet[] = [
  {
    id: "sn-eq-1",
    kind: "equation",
    title: "Gaussian integral",
    body: String.raw`\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}`,
    order: 1,
    published: true,
  },
  {
    id: "sn-eq-2",
    kind: "equation",
    title: "Mass-energy equivalence",
    body: String.raw`E = mc^2`,
    order: 2,
    published: true,
  },
  {
    id: "sn-code-1",
    kind: "code",
    title: "Type-safe pipeline (TypeScript)",
    lang: "typescript",
    body: `type Pipe<A, B> = (a: A) => B;
const compose = <A, B, C>(f: Pipe<A, B>, g: Pipe<B, C>): Pipe<A, C> =>
  (a) => g(f(a));`,
    order: 3,
    published: true,
  },
  {
    id: "sn-code-2",
    kind: "code",
    title: "rr-sync workflow (bash)",
    lang: "bash",
    body: `pnpm sync:rr notion-blocks --dry-run
pnpm sync:rr notion-blocks
cd ~/projects/resources && git add . && git commit && git push`,
    order: 4,
    published: true,
  },
  {
    id: "sn-text-1",
    kind: "text",
    title: "About this template",
    body: "Nosion-os bundles the notion-blocks slice (4 editor primitives) with admin CRUD + public landing. Each primitive is config-driven — drop into any React surface unchanged.",
    order: 5,
    published: true,
  },
  {
    id: "sn-grid-1",
    kind: "grid",
    title: "Drag-fill demo data",
    body: JSON.stringify([
      { id: "r1", name: "Alice", role: "Author" },
      { id: "r2", name: "Bob", role: "" },
      { id: "r3", name: "Carol", role: "" },
    ]),
    order: 6,
    published: true,
  },
];

export const SEED_STATE: State = {
  pages: [
    {
      id: "pg-home",
      slug: "home",
      title: "Home",
      description: "Landing page showcasing notion-blocks primitives in a real surface.",
      blocks: [],
      status: "published",
      createdAt: now(),
      updatedAt: now(),
      systemPage: true,
    },
  ],
  snippets: SEED_SNIPPETS,
  landingSections: nosionLandingSections(),
};
