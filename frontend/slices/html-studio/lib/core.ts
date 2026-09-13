export type Visibility = "public" | "private";
export type HtmlDoc = { title: string; html: string; visibility: Visibility };
export type SavedPage = HtmlDoc & { slug: string; updatedAt: number };
export type PageRow = { slug: string; title: string; visibility: Visibility; updatedAt: number };

export type HtmlStudioAdapter = {
  mode: "mock" | "live";
  save?: (doc: HtmlDoc & { slug?: string }) => Promise<{ slug: string }>;
  load?: (slug: string) => Promise<SavedPage | null>;
  list?: () => Promise<PageRow[]>;
  remove?: (slug: string) => Promise<void>;
};

export type View = "code" | "split" | "preview";
export type Device = "full" | "tablet" | "phone";

export const DEVICE_W: Record<Device, number | undefined> = {
  full: undefined,
  tablet: 834,
  phone: 414,
};
export const DEVICE_NEXT: Record<Device, Device> = {
  full: "tablet",
  tablet: "phone",
  phone: "full",
};
export const SPLIT_MIN = 720;

/**
 * Security boundary for arbitrary user-authored HTML.
 * `allow-same-origin` MUST stay absent so srcdoc executes in an opaque origin.
 */
export const HTML_SANDBOX = "allow-scripts allow-forms allow-popups allow-presentation";

export const STARTER = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello</title>
    <style>
      body { margin: 0; height: 100vh; display: grid; place-items: center;
             font-family: system-ui, sans-serif; background: #0b0b12; color: #fafafa; }
      h1 { font-size: clamp(2rem, 8vw, 4rem); cursor: pointer;
           background: linear-gradient(90deg, #a78bfa, #f472b6);
           -webkit-background-clip: text; background-clip: text; color: transparent; }
    </style>
  </head>
  <body>
    <h1 id="t">Hello, world</h1>
    <script>
      document.getElementById("t").addEventListener("click", () => {
        document.getElementById("t").textContent = "It runs! " + new Date().toLocaleTimeString();
      });
    </script>
  </body>
</html>
`;

function slugify(title: string, n: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return `${base || "page"}-${n.toString(36)}`;
}

function createMockStudio(): HtmlStudioAdapter {
  const pages = new Map<string, SavedPage>([
    [
      "welcome-1",
      {
        slug: "welcome-1",
        title: "Welcome",
        html: STARTER,
        visibility: "public",
        updatedAt: Date.now() - 36e5,
      },
    ],
  ]);
  let sequence = 0;
  return {
    mode: "mock",
    save: async ({ slug, title, html, visibility }) => {
      const nextSlug = slug && pages.has(slug) ? slug : slugify(title, ++sequence);
      pages.set(nextSlug, {
        slug: nextSlug,
        title: title.trim() || "Untitled",
        html,
        visibility,
        updatedAt: Date.now(),
      });
      return { slug: nextSlug };
    },
    load: async (slug) => pages.get(slug) ?? null,
    list: async () =>
      [...pages.values()]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(({ slug, title, visibility, updatedAt }) => ({ slug, title, visibility, updatedAt })),
    remove: async (slug) => {
      pages.delete(slug);
    },
  };
}

let adapter: HtmlStudioAdapter = createMockStudio();

export function configureHtmlStudio(nextAdapter: HtmlStudioAdapter): void {
  adapter = nextAdapter;
}

export const htmlStudioApi = {
  get mode() {
    return adapter.mode;
  },
  get canSave() {
    return !!adapter.save;
  },
  get hasList() {
    return !!adapter.list;
  },
  save: (doc: HtmlDoc & { slug?: string }) =>
    adapter.save ? adapter.save(doc) : Promise.resolve({ slug: "" }),
  load: (slug: string) =>
    adapter.load ? adapter.load(slug) : Promise.resolve(null as SavedPage | null),
  list: () => (adapter.list ? adapter.list() : Promise.resolve([] as PageRow[])),
  remove: (slug: string) => (adapter.remove ? adapter.remove(slug) : Promise.resolve()),
};

export function shareUrl(slug: string): string {
  const base = typeof location !== "undefined" ? location.origin : "";
  return `${base}/p/${slug}`;
}

export function payloadSlug(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const slug = (payload as { slug?: unknown }).slug;
    if (typeof slug === "string" && slug) return slug;
  }
  return null;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
