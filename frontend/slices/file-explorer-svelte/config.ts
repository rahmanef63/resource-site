export type FileExplorerSvelteConfig = {
  slug: "file-explorer";
  title: string;
  category: "os";
  rootLabel: string;
  initialPath: string;
};
export const fileExplorerConfig: FileExplorerSvelteConfig = {
  slug: "file-explorer",
  title: "File Explorer — Tree + CRUD + Preview + Properties",
  category: "os",
  rootLabel: "Files",
  initialPath: "/",
};
