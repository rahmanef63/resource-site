import type { AdminConsoleSection } from "./sections";

export const ADMIN_SECTION_PARAM = "section";

export function visibleSectionIds(sections: readonly AdminConsoleSection[]): string[] {
  return sections.map((section) => section.id);
}

export function normalizeActiveSection(
  sections: readonly AdminConsoleSection[],
  requested?: string | null,
): string {
  const ids = visibleSectionIds(sections);
  return requested && ids.includes(requested) ? requested : (ids[0] ?? "");
}

export function readSectionFromSearch(search: string): string | null {
  return new URLSearchParams(search).get(ADMIN_SECTION_PARAM);
}

export function sectionHref(href: string, id: string): string {
  const url = new URL(href, "http://admin.local");
  url.searchParams.set(ADMIN_SECTION_PARAM, id);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function groupSections(
  sections: readonly AdminConsoleSection[],
): Array<{ id: AdminConsoleSection["group"]; items: AdminConsoleSection[] }> {
  const groups: Array<{ id: AdminConsoleSection["group"]; items: AdminConsoleSection[] }> = [];
  for (const section of sections) {
    const group = groups.find((item) => item.id === section.group);
    if (group) group.items.push(section);
    else groups.push({ id: section.group, items: [section] });
  }
  return groups;
}
