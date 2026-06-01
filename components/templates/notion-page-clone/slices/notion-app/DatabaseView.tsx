"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { NotionDatabase, type Database } from "@/features/notion-database";
import { NotionPage } from "@/features/notion-shell";
import { Button } from "@/components/ui/button";
import { DynamicIcon, IconPickerPopover } from "@/features/icon-picker";
import { useDatabases, useDocs, useStore } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

function renderIcon(icon: string, className?: string) {
  return <DynamicIcon value={icon} className={className} />;
}

function renderIconPicker({
  value, onChange, children,
}: {
  value: string;
  onChange: (next: string) => void;
  children: React.ReactNode;
}) {
  return (
    <IconPickerPopover value={value} onChange={onChange} onClear={() => onChange("🗂️")}>
      {children}
    </IconPickerPopover>
  );
}

/** Renders one notion-clone database selected by id. Wires NotionDatabase
 *  CRUD callbacks to db.* / db.row.* / db.view.* reducer actions. Wraps
 *  in NotionPage shell so the database surface gets the same icon + title
 *  header chrome as DocView. */
export function DatabaseView({ dbId }: { dbId: string }) {
  const router = useRouter();
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

  // Every doc that is a database row — fed to NotionDatabase so the relation
  // link-picker + rollup can resolve rows across ALL databases.
  const allRows = docs.filter((d) => d.rowOfDatabaseId);

  /** Spin up a second database (pre-linked to this one via a relation column)
   *  so relation + rollup are testable out of the box. */
  const handleCreateDatabase = () => {
    const id = `db-${Date.now().toString(36)}`;
    const next: Database = {
      id, name: "New database", icon: "🗃️",
      properties: [
        { id: "name", name: "Name", type: "text" },
        { id: "rel", name: `${db.name} link`, type: "relation", relationDatabaseId: db.id },
      ],
      rowIds: [],
      views: [{ id: "v-table", name: "All", type: "table", sorts: [], filters: [], search: "" }],
      activeViewId: "v-table",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: "db.create", db: next });
    router.push(`${PUBLIC_BASE}/db/${id}`);
  };

  return (
    <NotionPage
      icon={db.icon}
      title={db.name}
      onIconChange={(icon) => dispatch({ type: "db.update", id: db.id, patch: { icon } })}
      onTitleChange={(name) => dispatch({ type: "db.update", id: db.id, patch: { name } })}
      renderIcon={renderIcon}
      renderIconPicker={renderIconPicker}
    >
      <div className="mb-2 flex justify-end">
        <Button type="button" size="sm" variant="outline" onClick={handleCreateDatabase}>
          <Plus className="mr-1 h-3.5 w-3.5" /> New database
        </Button>
      </div>
      <NotionDatabase
        db={db}
        rows={rows}
        databases={databases}
        pages={allRows}
        onPropertyAdd={(propType) => dispatch({ type: "db.property.add", dbId: db.id, propType })}
        onPropertyUpdate={(propId, patch) => dispatch({ type: "db.property.update", dbId: db.id, propId, patch })}
        onPropertyRemove={(propId) => dispatch({ type: "db.property.remove", dbId: db.id, propId })}
        onRowAdd={() => dispatch({ type: "db.row.add", dbId: db.id })}
        onRowAddInGroup={({ groupPropId, groupValue }) =>
          dispatch({
            type: "db.row.add",
            dbId: db.id,
            initialProps: groupValue === null ? {} : { [groupPropId]: groupValue },
          })
        }
        onRowUpdate={(rowId, propId, value) =>
          dispatch({ type: "db.row.update", dbId: db.id, rowId, propId, value })
        }
        onRowRemove={(rowId) => dispatch({ type: "db.row.remove", dbId: db.id, rowId })}
        onRowDuplicate={(rowId) => dispatch({ type: "db.row.duplicate", dbId: db.id, rowId })}
        onOpenRow={(rowId) => router.push(`${PUBLIC_BASE}/d/${rowId}`)}
        onViewActivate={(viewId) => dispatch({ type: "db.view.activate", dbId: db.id, viewId })}
        onViewAdd={(viewType) => dispatch({ type: "db.view.add", dbId: db.id, viewType })}
        onViewRemove={(viewId) => dispatch({ type: "db.view.remove", dbId: db.id, viewId })}
        onViewConfigChange={(viewId, patch) =>
          dispatch({ type: "db.view.config", dbId: db.id, viewId, patch })
        }
      />
    </NotionPage>
  );
}
