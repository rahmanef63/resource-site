import { Layers } from "lucide-react";
import { BuildShell } from "@/components/build/build-shell";

export const metadata = { title: "Bundle Builder" };

export default function BuildPage() {
  return (
    <>
      <div className="border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Catalog · Build
          </p>
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Layers className="size-4" /> Bundle Builder
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Compose a kitab bundle → emit{" "}
            <code className="rounded bg-muted px-1">npx rahman-resources</code> command.
          </p>
        </div>
      </div>
      <BuildShell />
    </>
  );
}
