import type { Action, State } from "./types";
import { dbReducer } from "./notion-db-reducer";

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Sub-reducer for the Notion-clone state slices (docs + databases).
 *  Pulled out of store.tsx to keep that file under the 200-LOC audit
 *  cap. doc.* actions handled inline; db.* delegated to dbReducer to
 *  keep this file under the cap too. */
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
    case "doc.block.insertAfter":
      return {
        ...state,
        docs: state.docs.map((d) => {
          if (d.id !== action.docId) return d;
          const i = d.blocks.findIndex((b) => b.id === action.afterId);
          const at = i < 0 ? d.blocks.length : i + 1;
          const blocks = [...d.blocks.slice(0, at), action.block, ...d.blocks.slice(at)];
          return { ...d, blocks, updatedAt: Date.now() };
        }),
      };
    case "doc.block.mergeBack":
      return {
        ...state,
        docs: state.docs.map((d) => {
          if (d.id !== action.docId) return d;
          const i = d.blocks.findIndex((b) => b.id === action.blockId);
          if (i <= 0) return d; // first block — nothing to merge into
          const prev = d.blocks[i - 1];
          const cur = d.blocks[i];
          const merged = { ...prev, text: (prev.text ?? "") + (cur.text ?? "") };
          const blocks = [...d.blocks.slice(0, i - 1), merged, ...d.blocks.slice(i + 1)];
          return { ...d, blocks, updatedAt: Date.now() };
        }),
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
    case "doc.block.reorder":
      return {
        ...state,
        docs: state.docs.map((d) => {
          if (d.id !== action.docId) return d;
          const next = [...d.blocks];
          const [item] = next.splice(action.from, 1);
          if (!item) return d;
          next.splice(action.to, 0, item);
          return { ...d, blocks: next, updatedAt: Date.now() };
        }),
      };
    case "doc.move": {
      const src = state.docs.find((d) => d.id === action.id);
      if (!src || action.id === action.parentId) return state;
      const moved = { ...src, parentId: action.parentId, updatedAt: Date.now() };
      const rest = state.docs.filter((d) => d.id !== action.id);
      const at = action.beforeId ? rest.findIndex((d) => d.id === action.beforeId) : -1;
      if (at < 0) rest.push(moved); else rest.splice(at, 0, moved);
      return { ...state, docs: rest };
    }
    case "doc.duplicate": {
      const src = state.docs.find((d) => d.id === action.id);
      if (!src) return state;
      const dup = {
        ...src,
        id: genId("doc"),
        title: `${src.title} (copy)`,
        blocks: src.blocks.map((b) => ({ ...b, id: genId("b") })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return { ...state, docs: [...state.docs, dup] };
    }

    default:
      if (action.type.startsWith("db.")) {
        return dbReducer(state, action as Extract<Action, { type: `db.${string}` }>);
      }
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
