"use client";

import * as React from "react";
import preview from "@/features/rbac-roles/preview";
import type { RoleSlug } from "@/features/rbac-roles";
import { PreviewSection, SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MatrixPreview = preview.PermissionMatrix;
const ROLES: RoleSlug[] = ["admin", "manager", "staff", "guest"];

export default function Page() {
  const [role, setRole] = React.useState<RoleSlug>("manager");
  const [readOnly, setReadOnly] = React.useState(false);

  return (
    <SlicePreviewLayout
      title="RBAC — Roles & Permissions"
      kind="full"
      description="Role presets, wildcard permission matching, and an editable permission matrix backed by the canonical preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/rbac-roles"
    >
      <PreviewSection
        title="Permission matrix"
        hint={`role="${role}" · readOnly="${readOnly}"`}
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="inline-flex rounded-md border border-input p-0.5">
            {ROLES.map((value) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                onClick={() => setRole(value)}
                className={cn(
                  "h-auto rounded px-3 py-1 text-xs capitalize",
                  role === value ? "bg-accent font-medium" : "text-muted-foreground",
                )}
              >
                {value}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant={readOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setReadOnly((value) => !value)}
          >
            {readOnly ? "Read-only" : "Editable"}
          </Button>
        </div>
        <MatrixPreview variant={{ role, readOnly: String(readOnly) }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
