import { Layers } from "lucide-react";
import { BuildShell } from "@/components/build/build-shell";
import { PageHeader } from "@/components/site/page-header";

export const metadata = { title: "Bundle Builder" };

export default function BuildPage() {
  return (
    <>
      <div className="border-b bg-background px-4 py-3 sm:px-6">
        <PageHeader
          compact
          eyebrow="Catalog · Build"
          title={
            <>
              <Layers className="size-4" /> Bundle Builder
            </>
          }
          description={
            <>
              Compose a slice bundle → emit{" "}
              <code className="rounded bg-muted px-1">npx rahman-resources</code> command.
            </>
          }
        />
      </div>
      <BuildShell />
    </>
  );
}
