import type { Action, NotionDoc, State } from "./types";

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Sub-sub-reducer for db.* actions. Split out of notion-reducer.ts to
 *  satisfy the 200-LOC audit cap. Returns the FULL next state. Caller
 *  routes via the `case "db.*"` arm in notion-reducer.ts. */
export function dbReducer(state: State, action: Extract<Action, { type: `db.${string}` }>): State {
  switch (action.type) {
    case "db.create":
      return { ...state, databases: [...state.databases, action.db] };
    case "db.update":
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id === action.id ? { ...db, ...action.patch, updatedAt: Date.now() } : db,
        ),
      };
    case "db.delete":
      return {
        ...state,
        databases: state.databases.filter((db) => db.id !== action.id),
        docs: state.docs.filter((d) => d.rowOfDatabaseId !== action.id),
      };
    case "db.property.add": {
      const propId = genId("prop");
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id === action.dbId
            ? { ...db, properties: [...db.properties, { id: propId, name: "New", type: action.propType }], updatedAt: Date.now() }
            : db,
        ),
      };
    }
    case "db.property.update":
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id !== action.dbId
            ? db
            : { ...db, properties: db.properties.map((p) => (p.id === action.propId ? { ...p, ...action.patch } : p)), updatedAt: Date.now() },
        ),
      };
    case "db.property.remove":
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id !== action.dbId
            ? db
            : { ...db, properties: db.properties.filter((p) => p.id !== action.propId), updatedAt: Date.now() },
        ),
        docs: state.docs.map((d) => {
          if (!d.rowProps || d.rowProps[action.propId] === undefined) return d;
          const next = { ...d.rowProps };
          delete next[action.propId];
          return { ...d, rowProps: next };
        }),
      };

    case "db.row.add": {
      const rowId = genId("row");
      const row: NotionDoc = {
        id: rowId, parentId: null, title: "Untitled", icon: "📄",
        blocks: [], favorite: false, trashed: false,
        createdAt: Date.now(), updatedAt: Date.now(),
        rowOfDatabaseId: action.dbId, rowProps: action.initialProps ?? {},
      };
      return {
        ...state,
        docs: [...state.docs, row],
        databases: state.databases.map((db) =>
          db.id === action.dbId ? { ...db, rowIds: [...db.rowIds, rowId], updatedAt: Date.now() } : db,
        ),
      };
    }
    case "db.row.duplicate": {
      const src = state.docs.find((d) => d.id === action.rowId);
      if (!src) return state;
      const rowId = genId("row");
      const copy: NotionDoc = {
        ...src,
        id: rowId,
        title: src.title ? `${src.title} (copy)` : "Untitled",
        blocks: src.blocks.map((b) => ({ ...b })),
        rowProps: { ...(src.rowProps ?? {}) },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        docs: [...state.docs, copy],
        databases: state.databases.map((db) => {
          if (db.id !== action.dbId) return db;
          const idx = db.rowIds.indexOf(action.rowId);
          const next = [...db.rowIds];
          if (idx === -1) next.push(rowId);
          else next.splice(idx + 1, 0, rowId);
          return { ...db, rowIds: next, updatedAt: Date.now() };
        }),
      };
    }
    case "db.row.update":
      return {
        ...state,
        docs: state.docs.map((d) =>
          d.id === action.rowId
            ? { ...d, rowProps: { ...d.rowProps, [action.propId]: action.value }, updatedAt: Date.now() }
            : d,
        ),
      };
    case "db.row.remove":
      return {
        ...state,
        docs: state.docs.filter((d) => d.id !== action.rowId),
        databases: state.databases.map((db) =>
          db.id === action.dbId ? { ...db, rowIds: db.rowIds.filter((id) => id !== action.rowId), updatedAt: Date.now() } : db,
        ),
      };

    case "db.view.activate":
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id === action.dbId ? { ...db, activeViewId: action.viewId, updatedAt: Date.now() } : db,
        ),
      };
    case "db.view.add": {
      const viewId = genId("v");
      const name = action.viewType.charAt(0).toUpperCase() + action.viewType.slice(1);
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id !== action.dbId
            ? db
            : {
                ...db,
                views: [
                  ...db.views,
                  { id: viewId, name, type: action.viewType, sorts: [], filters: [], search: "" },
                ],
                activeViewId: viewId,
                updatedAt: Date.now(),
              },
        ),
      };
    }
    case "db.view.remove":
      return {
        ...state,
        databases: state.databases.map((db) => {
          if (db.id !== action.dbId) return db;
          const views = db.views.filter((v) => v.id !== action.viewId);
          const activeViewId = db.activeViewId === action.viewId
            ? views[0]?.id ?? ""
            : db.activeViewId;
          return { ...db, views, activeViewId, updatedAt: Date.now() };
        }),
      };
    case "db.view.config":
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id !== action.dbId
            ? db
            : {
                ...db,
                views: db.views.map((v) => (v.id === action.viewId ? { ...v, ...action.patch } : v)),
                updatedAt: Date.now(),
              },
        ),
      };

    default:
      return state;
  }
}
