// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const slice = JSON.parse(read("frontend/slices/data-table/slice.json"));
const react = read("frontend/slices/data-table/components/DataTable.tsx");
const svelte = [
  read("frontend/slices/data-table-svelte/components/DataTable.svelte"),
  read("frontend/slices/data-table-svelte/components/DataTableToolbar.svelte"),
  read("frontend/slices/data-table-svelte/components/DataTablePagination.svelte"),
  read("frontend/slices/data-table-svelte/components/DataTableColumnHeader.svelte"),
  read("frontend/slices/data-table-svelte/lib/table.ts"),
].join("\n");

 describe("data-table framework contract", () => {
  it("keeps React v8 default and selects native Svelte 5/v9 explicitly", () => {
    expect(slice.version).toBe("0.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.deps.npm).toContain("@tanstack/react-table@^8.21.3");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/data-table-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: {
        npm: ["svelte@^5", "@tanstack/svelte-table@^9.2.4"],
        shadcn: [],
        sharedFiles: ["frontend/slices/data-table/lib/core.ts"],
      },
    });
  });

  it("preserves the React renderer while Svelte uses its official adapter", () => {
    expect(react).toContain('from "@tanstack/react-table"');
    expect(svelte).toContain('from "@tanstack/svelte-table"');
    expect(svelte).toContain("createTable({");
    expect(svelte).toContain("tableFeatures({");
    expect(svelte).toContain("FlexRender");
    expect(svelte).toContain("rowSelectionFeature");
    expect(svelte).toContain("columnVisibilityFeature");
  });

  it("keeps React/Next/Lucide/shadcn runtime out of the Svelte distribution", () => {
    expect(svelte).not.toContain('from "react"');
    expect(svelte).not.toContain('from "next');
    expect(svelte).not.toContain("lucide-react");
    expect(svelte).not.toContain("@/components/ui/");
    expect(svelte).toContain("../../data-table/lib/core");
  });
});
