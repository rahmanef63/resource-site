import { Hammer } from "lucide-react";

/**
 * Workspace placeholder rendered at /preview/<template>/dashboard/workspace.
 * AZ-wave foundation only — full workspace (notion editor, calendar,
 * command-menu, database views) lands in BB-wave. See
 * docs/architecture/dashboard-vision.md.
 */
export function WorkspacePlaceholder({ template }: { template: string }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full border bg-muted p-4 text-muted-foreground">
        <Hammer className="size-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Workspace — coming soon</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Notion-style editor, command menu, calendar, and database views land
          here in BB-wave. Template: <code className="font-mono">{template}</code>
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        See <code className="font-mono">docs/architecture/dashboard-vision.md</code>
      </p>
    </main>
  );
}
