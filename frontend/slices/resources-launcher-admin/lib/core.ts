export type Resource = {
  id: string;
  label: string;
  /** Portable icon NAME. React resolves to Lucide; other frameworks may render their own glyphs. */
  icon: string;
  url: string;
  group: string;
  order: number;
};

export type ResourceInput = Omit<Resource, "id"> & { id?: string };

export type ResourcesAdapter = {
  mode: "mock" | "live";
  list: () => Promise<Resource[]>;
  upsert?: (resource: ResourceInput) => Promise<void>;
  remove?: (id: string) => Promise<void>;
  canManage?: () => Promise<boolean>;
};

export const RESOURCE_ICON_NAMES = [
  "Link",
  "Globe",
  "Mail",
  "FileText",
  "Folder",
  "Image",
  "Book",
  "Calendar",
  "Code",
  "Video",
  "Pen",
  "Work",
] as const;

export type ResourceIconName = (typeof RESOURCE_ICON_NAMES)[number];

export function normalizeResourceInput(input: ResourceInput): ResourceInput {
  return {
    ...(input.id ? { id: input.id } : {}),
    label: input.label.trim(),
    icon: input.icon || RESOURCE_ICON_NAMES[0],
    url: input.url.trim(),
    group: input.group.trim() || "Links",
    order: Number.isFinite(input.order) ? input.order : 0,
  };
}

export function sortResources(rows: readonly Resource[]): Resource[] {
  return [...rows].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

export function swapResourceOrder(
  rows: readonly Resource[],
  index: number,
  direction: -1 | 1,
): [ResourceInput, ResourceInput] | null {
  const adjacent = index + direction;
  if (index < 0 || index >= rows.length || adjacent < 0 || adjacent >= rows.length) return null;
  const current = rows[index];
  const other = rows[adjacent];
  return [
    { ...current, order: other.order },
    { ...other, order: current.order },
  ];
}

function createMockResources(): ResourcesAdapter {
  const rows: Resource[] = [
    { id: "seed-docs", label: "Docs", icon: "FileText", url: "https://example.com/docs", group: "Resources", order: 0 },
    { id: "seed-site", label: "Website", icon: "Globe", url: "https://example.com", group: "Resources", order: 1 },
    { id: "seed-contact", label: "Contact", icon: "Mail", url: "mailto:hello@example.com", group: "Links", order: 2 },
  ];
  let sequence = 0;
  return {
    mode: "mock",
    list: async () => rows.slice(),
    upsert: async (input) => {
      const resource = normalizeResourceInput(input);
      if (resource.id) {
        const index = rows.findIndex((row) => row.id === resource.id);
        if (index >= 0) {
          rows[index] = { ...rows[index], ...resource, id: resource.id };
          return;
        }
      }
      rows.push({ ...resource, id: `local-${++sequence}` });
    },
    remove: async (id) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index >= 0) rows.splice(index, 1);
    },
    canManage: async () => true,
  };
}

let adapter: ResourcesAdapter = createMockResources();

export function configureResources(nextAdapter: ResourcesAdapter): void {
  adapter = nextAdapter;
}

export const resourcesApi = {
  get mode() {
    return adapter.mode;
  },
  get canWrite() {
    return !!adapter.upsert && !!adapter.remove;
  },
  list: async () => sortResources(await adapter.list()),
  upsert: (resource: ResourceInput) => (adapter.upsert ? adapter.upsert(normalizeResourceInput(resource)) : Promise.resolve()),
  remove: (id: string) => (adapter.remove ? adapter.remove(id) : Promise.resolve()),
  canManage: () => (adapter.canManage ? adapter.canManage() : Promise.resolve(false)),
};

export async function readResourcesState(): Promise<{ rows: Resource[]; canManage: boolean }> {
  const [rows, allowed] = await Promise.all([resourcesApi.list(), resourcesApi.canManage()]);
  return { rows, canManage: allowed && resourcesApi.canWrite };
}
