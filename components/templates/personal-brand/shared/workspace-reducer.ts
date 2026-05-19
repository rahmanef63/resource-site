// BC-wave — workspace-surface state transitions. Pulled out of
// store-reducer.ts to stay under the 200-LOC modularity cap.

import type { Action, State } from "./types";

export function workspaceReducer(state: State, action: Action): State {
  switch (action.type) {
    case "workspace.create":
      return {
        ...state,
        workspaces: [...state.workspaces, action.ws],
        activeWorkspaceId: action.ws.id,
      };
    case "workspace.update":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.id ? { ...w, ...action.patch } : w,
        ),
      };
    case "workspace.delete": {
      // Keep at least one workspace alive. Cascade-delete its notes + tasks.
      if (state.workspaces.length <= 1) return state;
      const workspaces = state.workspaces.filter((w) => w.id !== action.id);
      const next: State = {
        ...state,
        workspaces,
        notes: state.notes.filter((n) => n.workspaceId !== action.id),
        tasks: state.tasks.filter((t) => t.workspaceId !== action.id),
      };
      if (state.activeWorkspaceId === action.id) {
        next.activeWorkspaceId = workspaces[0].id;
      }
      return next;
    }
    case "workspace.switch":
      return state.workspaces.some((w) => w.id === action.id)
        ? { ...state, activeWorkspaceId: action.id }
        : state;

    case "note.upsert": {
      const idx = state.notes.findIndex((n) => n.id === action.note.id);
      const notes =
        idx >= 0
          ? state.notes.map((n) => (n.id === action.note.id ? action.note : n))
          : [action.note, ...state.notes];
      return { ...state, notes };
    }
    case "note.delete":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };

    case "task.upsert": {
      const idx = state.tasks.findIndex((t) => t.id === action.task.id);
      const tasks =
        idx >= 0
          ? state.tasks.map((t) => (t.id === action.task.id ? action.task : t))
          : [action.task, ...state.tasks];
      return { ...state, tasks };
    }
    case "task.toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      };
    case "task.delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}

/**
 * Discriminator: returns true when the action belongs to the workspace
 * surface so the main reducer can delegate cleanly.
 */
export function isWorkspaceAction(action: Action): boolean {
  return action.type.startsWith("workspace.") ||
    action.type.startsWith("note.") ||
    action.type.startsWith("task.");
}
