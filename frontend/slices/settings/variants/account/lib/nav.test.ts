import { describe, expect, it, vi } from "vitest";
import { SETTINGS_SECTIONS, settingsSectionsToNav } from "./nav";

describe("settingsSectionsToNav", () => {
  it("returns one group holding the catalog in order", () => {
    const groups = settingsSectionsToNav(() => {});
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("settings");
    expect(groups[0].label).toBe("Settings");
    expect(groups[0].items).toHaveLength(4);
    expect(groups[0].items.map((i) => i.id)).toEqual(
      SETTINGS_SECTIONS.map((s) => s.id),
    );
  });

  it("flags exactly the activeId item", () => {
    const items = settingsSectionsToNav(() => {}, { activeId: "preferences" })[0].items;
    expect(items.filter((i) => i.active === true).map((i) => i.id)).toEqual([
      "preferences",
    ]);
    expect(items.filter((i) => i.active === false)).toHaveLength(3);
  });

  it("leaves active unset when no activeId is given", () => {
    const items = settingsSectionsToNav(() => {})[0].items;
    expect(items.every((i) => i.active === undefined)).toBe(true);
  });

  it("docks only the first dockCount items", () => {
    const items = settingsSectionsToNav(() => {}, { dockCount: 2 })[0].items;
    expect(items.map((i) => i.dock)).toEqual([true, true, false, false]);
  });

  it("docks the first three by default — the shell appends its own Menu button", () => {
    const items = settingsSectionsToNav(() => {})[0].items;
    expect(items.map((i) => i.dock)).toEqual([true, true, true, false]);
  });

  it("onSelect calls back with the section id", () => {
    const onSelect = vi.fn();
    settingsSectionsToNav(onSelect)[0].items[2].onSelect();
    expect(onSelect).toHaveBeenCalledWith("notifications");
  });
});
