import type { SliceFile } from "@/lib/slice-files";

export type TreeNode = {
  name: string;
  path: string;
  kind: "file" | "dir";
  size?: number;
  children?: TreeNode[];
};

/**
 * Convert flat file list into a nested tree. Folders are inferred from
 * the path segments — empty folders are not represented (we only know
 * files exist).
 */
export function buildTree(files: SliceFile[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", kind: "dir", children: [] };

  for (const file of files) {
    const segments = file.path.split("/");
    let cursor = root;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!;
      const isLeaf = i === segments.length - 1;
      const segmentPath = segments.slice(0, i + 1).join("/");
      const existing = (cursor.children ??= []).find((c) => c.name === segment);
      if (existing) {
        cursor = existing;
        continue;
      }
      const node: TreeNode = isLeaf
        ? { name: segment, path: segmentPath, kind: "file", size: file.size }
        : { name: segment, path: segmentPath, kind: "dir", children: [] };
      cursor.children!.push(node);
      cursor = node;
    }
  }

  const sortNode = (n: TreeNode): void => {
    if (!n.children) return;
    n.children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    n.children.forEach(sortNode);
  };
  sortNode(root);

  return root.children ?? [];
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
