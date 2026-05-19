import { Hammer } from "lucide-react";

/**
 * Workspace placeholder rendered at /preview/<template>/dashboard/workspace.
 * The full workspace (notion editor, calendar, command-menu, database
 * views) is queued for BC-wave. BB-wave delivered only the
 * DashboardSwitcher chassis. See docs/architecture/dashboard-vision.md.
 */
export function WorkspacePlaceholder({ template }: { template: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full border bg-muted p-4 text-muted-foreground">
        <Hammer className="size-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Workspace — coming soon</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Notion-style editor, command menu, calendar, and database views land
          here in BC-wave. Template: <code className="font-mono">{template}</code>
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Use the workspace switcher above (⌘1 admin · ⌘2 workspace) to swap surfaces.
      </p>
    </div>
  );
}
