import type { Action, NotionDoc, State } from "./types";

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Sub-reducer for the Notion-clone state slices (docs + databases).
 *  Pulled out of store.tsx to keep that file under the 200-LOC audit
 *  cap. Returns the FULL next state — caller spreads template slice
 *  results in. */
export function notionReducer(state: State, action: Action): State {
  switch (action.type) {
    case "doc.create":
      return { ...state, docs: [...state.docs, action.doc] };
    case "doc.update":
      return {
        ...state,
        docs: state.docs.map((d) =>
          d.id === action.id ? { ...d, ...action.patch, updatedAt: Date.now() } : d,
        ),
      };
    case "doc.delete":
      return {
        ...state,
        docs: state.docs.filter((d) => d.id !== action.id && d.parentId !== action.id),
        databases: state.databases.map((db) => ({
          ...db,
          rowIds: db.rowIds.filter((id) => id !== action.id),
        })),
      };
    case "doc.block.update":
      return {
        ...state,
        docs: state.docs.map((d) =>
          d.id !== action.docId
            ? d
            : { ...d, blocks: d.blocks.map((b) => (b.id === action.blockId ? { ...b, ...action.patch } : b)), updatedAt: Date.now() },
        ),
      };
    case "doc.block.append":
      return {
        ...state,
        docs: state.docs.map((d) =>
          d.id !== action.docId ? d : { ...d, blocks: [...d.blocks, action.block], updatedAt: Date.now() },
        ),
      };
    case "doc.block.remove":
      return {
        ...state,
        docs: state.docs.map((d) =>
          d.id !== action.docId ? d : { ...d, blocks: d.blocks.filter((b) => b.id !== action.blockId), updatedAt: Date.now() },
        ),
      };
    case "doc.block.duplicate":
      return {
        ...state,
        docs: state.docs.map((d) => {
          if (d.id !== action.docId) return d;
          const i = d.blocks.findIndex((b) => b.id === action.blockId);
          if (i < 0) return d;
          const src = d.blocks[i];
          const dup = { ...src, id: genId("b") };
          const blocks = [...d.blocks.slice(0, i + 1), dup, ...d.blocks.slice(i + 1)];
          return { ...d, blocks, updatedAt: Date.now() };
        }),
      };
    case "doc.block.turnInto":
      return {
        ...state,
        docs: state.docs.map((d) =>
          d.id !== action.docId
            ? d
            : { ...d, blocks: d.blocks.map((b) => (b.id === action.blockId ? { ...b, type: action.blockType } : b)), updatedAt: Date.now() },
        ),
      };

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
        id: rowId,
        parentId: null,
        title: "Untitled",
        icon: "📄",
        blocks: [],
        favorite: false,
        trashed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rowOfDatabaseId: action.dbId,
        rowProps: {},
      };
      return {
        ...state,
        docs: [...state.docs, row],
        databases: state.databases.map((db) =>
          db.id === action.dbId ? { ...db, rowIds: [...db.rowIds, rowId], updatedAt: Date.now() } : db,
        ),
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

    default:
      return state;
  }
}

/** Action-type guard — true for any action handled by notionReducer. */
export function isNotionAction(action: Action): boolean {
  return (
    action.type.startsWith("doc.") ||
    action.type.startsWith("db.")
  );
}
