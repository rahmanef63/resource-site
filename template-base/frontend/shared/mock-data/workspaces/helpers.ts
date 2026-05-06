import type { IconName, MockMenuItem, MockWorkspace } from "../types";

export function menuItem(
  scope: string,
  slug: string,
  label: string,
  icon: IconName,
  extra: Partial<Omit<MockMenuItem, "id" | "slug" | "label" | "icon">> = {},
): MockMenuItem {
  return {
    id: `${scope}-${slug}`,
    slug,
    label,
    icon,
    ...extra,
  };
}

function dedupeFeatureIds(menuItems: MockMenuItem[]): string[] {
  return Array.from(
    new Set(
      menuItems
        .map((item) => item.slug)
        .filter((slug): slug is string => typeof slug === "string" && slug.length > 0),
    ),
  );
}

export function defineMockWorkspace(workspace: MockWorkspace): MockWorkspace {
  const children = workspace.children?.map((child) => defineMockWorkspace(child));

  return {
    ...workspace,
    enabledFeatures: workspace.enabledFeatures ?? dedupeFeatureIds(workspace.menuItems),
    children,
  };
}
