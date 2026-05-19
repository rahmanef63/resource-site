import { defaultLandingSections } from "@/components/templates/_shared/landing/seed-factory";
import type { State, Snippet } from "./types";

const now = () => Date.now();

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
  landingSections: defaultLandingSections(),
};
