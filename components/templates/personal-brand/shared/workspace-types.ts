// BC-wave — workspace-surface types. Split out of `types.ts` to stay
// under the 200-LOC modularity cap. The Action union for these
// entities is co-located here so the reducer can import a tight set.

export type Workspace = {
  id: string;
  name: string;
  /** lucide icon name OR short emoji */
  icon: string;
  createdAt: number;
};

export type Note = {
  id: string;
  workspaceId: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export type Task = {
  id: string;
  workspaceId: string;
  title: string;
  done: boolean;
  dueDate?: number;
  createdAt: number;
};

export type WorkspaceAction =
  | { type: "workspace.create"; ws: Workspace }
  | { type: "workspace.update"; id: string; patch: Partial<Omit<Workspace, "id" | "createdAt">> }
  | { type: "workspace.delete"; id: string }
  | { type: "workspace.switch"; id: string }
  | { type: "note.upsert"; note: Note }
  | { type: "note.delete"; id: string }
  | { type: "task.upsert"; task: Task }
  | { type: "task.toggle"; id: string }
  | { type: "task.delete"; id: string };
