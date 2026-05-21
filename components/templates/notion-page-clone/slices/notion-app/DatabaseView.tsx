"use client";

import { NotionDatabase } from "@/features/notion-database";
import { useDatabases, useDocs, useStore } from "../../shared/store";

/** Renders one notion-clone database selected by id. Wires NotionDatabase
 *  CRUD callbacks to db.* / db.row.* / db.view.* reducer actions. */
export function DatabaseView({ dbId }: { dbId: string }) {
  const databases = useDatabases();
  const docs = useDocs();
  const { dispatch } = useStore();
  const db = databases.find((d) => d.id === dbId);

  if (!db) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Database not found — pick one from the sidebar.
      </div>
    );
  }

  const rows = db.rowIds
    .map((id) => docs.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-3xl">{db.icon}</span>
        <h1 className="text-2xl font-semibold tracking-tight">{db.name}</h1>
      </div>
      <NotionDatabase
        db={db}
        rows={rows}
        onPropertyAdd={(propType) => dispatch({ type: "db.property.add", dbId: db.id, propType })}
        onPropertyUpdate={(propId, patch) => dispatch({ type: "db.property.update", dbId: db.id, propId, patch })}
        onPropertyRemove={(propId) => dispatch({ type: "db.property.remove", dbId: db.id, propId })}
        onRowAdd={() => dispatch({ type: "db.row.add", dbId: db.id })}
        onRowUpdate={(rowId, propId, value) =>
          dispatch({ type: "db.row.update", dbId: db.id, rowId, propId, value })
        }
        onRowRemove={(rowId) => dispatch({ type: "db.row.remove", dbId: db.id, rowId })}
        onViewActivate={(viewId) => dispatch({ type: "db.view.activate", dbId: db.id, viewId })}
        onViewAdd={(viewType) => dispatch({ type: "db.view.add", dbId: db.id, viewType })}
        onViewRemove={(viewId) => dispatch({ type: "db.view.remove", dbId: db.id, viewId })}
        onViewConfigChange={(viewId, patch) =>
          dispatch({ type: "db.view.config", dbId: db.id, viewId, patch })
        }
      />
    </div>
  );
}
