import { WorkspaceType } from "../types";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function getWorkspaceTypeLabel(type: WorkspaceType): string {
  const typeMap = {
    personal: "Personal",
    family: "Family", 
    group: "Group",
    organization: "Organization",
    institution: "Institution"
  };
  return typeMap[type] || "Unknown";
}

export function validateWorkspaceName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50;
}
