"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NotionDatabase } from "@/features/notion-database";
import { NotionPage } from "@/features/notion-shell";
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

  return (
    <NotionPage
      icon={db.icon}
      title={db.name}
      onIconChange={(icon) => dispatch({ type: "db.update", id: db.id, patch: { icon } })}
      onTitleChange={(name) => dispatch({ type: "db.update", id: db.id, patch: { name } })}
      renderIcon={renderIcon}
      renderIconPicker={renderIconPicker}
    >
      <NotionDatabase
        db={db}
        rows={rows}
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
