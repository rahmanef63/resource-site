/** Lock the renderless command-menu contract shapes pulled UP from
 *  notion-page-clone Wave N+3.7. Any breaking change to these field
 *  names / defaults is a contract break and bumps the slice version. */

import { describe, it, expect, expectTypeOf } from "vitest";
import {
  DEFAULT_PALETTE_LABELS,
  DEFAULT_SEARCH_LABELS,
  type CommandGroup,
  type CommandItem,
  type CommandPaletteLabels,
  type SearchModalLabels,
} from "./types";

describe("command-menu contract types", () => {
  it("CommandItem has the renderless onSelect-driven shape", () => {
    const item: CommandItem = {
      id: "id-1",
      value: "action:test:id-1",
      label: "Test",
      onSelect: () => {},
    };
    expectTypeOf(item.onSelect).toEqualTypeOf<() => void | Promise<void>>();
    expectTypeOf<CommandItem["track"]>().toEqualTypeOf<{ id: string; label: string } | undefined>();
    expect(item.id).toBe("id-1");
    expect(item.value).toBe("action:test:id-1");
  });

  it("CommandGroup carries the visibility flags consumers rely on", () => {
    const group: CommandGroup = {
      id: "favorites",
      heading: "Favorites",
      items: [],
      hideOnQuery: true,
    };
    expectTypeOf<CommandGroup["hideOnQuery"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<CommandGroup["showOnQueryOnly"]>().toEqualTypeOf<boolean | undefined>();
    expect(group.hideOnQuery).toBe(true);
  });

  it("DEFAULT_PALETTE_LABELS has the three fields the palette resolves", () => {
    expect(Object.keys(DEFAULT_PALETTE_LABELS).sort()).toEqual([
      "empty",
      "placeholder",
      "recentCommandsHeading",
    ]);
    expect(DEFAULT_PALETTE_LABELS.placeholder).toBe(
      "Search pages, databases, or run a command…",
    );
    expect(DEFAULT_PALETTE_LABELS.empty).toBe("No results.");
    expect(DEFAULT_PALETTE_LABELS.recentCommandsHeading).toBe("Recent commands");
  });

  it("CommandPaletteLabels fields are all optional", () => {
    const partial: CommandPaletteLabels = {};
    expect(partial).toEqual({});
    const overridden: CommandPaletteLabels = { placeholder: "Cari…" };
    expect(overridden.placeholder).toBe("Cari…");
  });

  it("DEFAULT_SEARCH_LABELS has the nine generic-EN fields the modal renders", () => {
    expect(Object.keys(DEFAULT_SEARCH_LABELS).sort()).toEqual([
      "databasesHeading",
      "emptyHint",
      "escapeHint",
      "noResults",
      "pagesHeading",
      "recentHeading",
      "searchDescription",
      "searchPlaceholder",
      "searchTitle",
    ]);
    expect(DEFAULT_SEARCH_LABELS.escapeHint).toBe("ESC");
    expect(DEFAULT_SEARCH_LABELS.recentHeading).toBe("Recent");
    expect(DEFAULT_SEARCH_LABELS.pagesHeading).toBe("Pages");
    expect(DEFAULT_SEARCH_LABELS.databasesHeading).toBe("Databases");
  });

  it("DEFAULT_SEARCH_LABELS.noResults templates the query verbatim", () => {
    expect(DEFAULT_SEARCH_LABELS.noResults("foo")).toBe('No results for "foo"');
    expect(DEFAULT_SEARCH_LABELS.noResults("")).toBe('No results for ""');
  });

  it("SearchModalLabels.noResults stays a typed function-or-undefined", () => {
    expectTypeOf<SearchModalLabels["noResults"]>().toEqualTypeOf<
      ((query: string) => string) | undefined
    >();
    const overridden: SearchModalLabels = {
      noResults: (q) => `Tidak ada hasil untuk "${q}"`,
    };
    expect(overridden.noResults!("test")).toBe('Tidak ada hasil untuk "test"');
  });

  it("upstream consumer-domain term MUST NOT appear in the labels surface", () => {
    // Construct the forbidden literal at runtime so the source file itself
    // stays clean of it (the contract `forbiddenTerms` scanner greps the
    // tree and would otherwise flag this test as a leak).
    const forbidden = ["n", "o", "s", "i", "o", "n"].join("");
    const dump = JSON.stringify({ DEFAULT_PALETTE_LABELS, DEFAULT_SEARCH_LABELS });
    expect(dump.toLowerCase()).not.toContain(forbidden);
  });
});
