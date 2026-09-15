export interface NotionSidebarPage {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
}
export interface FlatPage extends NotionSidebarPage {
  depth: number;
  childCount: number;
}
