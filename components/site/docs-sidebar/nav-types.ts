// Nav data shape shared by docs-sidebar parts.
//
// 3-tier nav model:
//  - NavSection (group label, collapsible)
//    - NavBranch (collapsible menu item with children)
//      - NavLeaf (leaf link)
//    - NavLeaf (leaf link directly under group)

export type NavLeaf = {
  kind: "leaf";
  title: string;
  href: string;
  badge?: string;
  disabled?: boolean;
};
export type NavBranch = {
  kind: "branch";
  title: string;
  badge?: string;
  items: NavLeaf[];
};
export type NavNode = NavLeaf | NavBranch;
export type NavSection = { label: string; items: NavNode[] };

export function isActive(pathname: string, href: string) {
  return pathname === href;
}

export function leafContainsActive(leaf: NavLeaf, pathname: string) {
  return isActive(pathname, leaf.href);
}

export function branchContainsActive(branch: NavBranch, pathname: string) {
  return branch.items.some((l) => leafContainsActive(l, pathname));
}

export function sectionContainsActive(section: NavSection, pathname: string) {
  return section.items.some((n) =>
    n.kind === "leaf" ? leafContainsActive(n, pathname) : branchContainsActive(n, pathname),
  );
}
