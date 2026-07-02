import singleBusiness from "./single-business.json";
import multiBranch from "./multi-branch.json";
import franchiseChain from "./franchise-chain.json";
import agencyClients from "./agency-clients.json";
import holdingCompany from "./holding-company.json";

export type MigrationTemplateId =
  | "single-business"
  | "multi-branch"
  | "franchise-chain"
  | "agency-clients"
  | "holding-company";

export interface MigrationTemplateMeta {
  id: MigrationTemplateId;
  name: string;
  description: string;
  tags: string[];
  workspaceCount: number;
  icon: string;
}

export const MIGRATION_TEMPLATES: MigrationTemplateMeta[] = [
  {
    id: "single-business",
    name: singleBusiness.meta.name,
    description: singleBusiness.meta.description ?? "",
    tags: singleBusiness.meta.tags ?? [],
    workspaceCount: singleBusiness.workspaces.length,
    icon: "Building2",
  },
  {
    id: "multi-branch",
    name: multiBranch.meta.name,
    description: multiBranch.meta.description ?? "",
    tags: multiBranch.meta.tags ?? [],
    workspaceCount: multiBranch.workspaces.length,
    icon: "GitBranch",
  },
  {
    id: "franchise-chain",
    name: franchiseChain.meta.name,
    description: franchiseChain.meta.description ?? "",
    tags: franchiseChain.meta.tags ?? [],
    workspaceCount: franchiseChain.workspaces.length,
    icon: "Network",
  },
  {
    id: "agency-clients",
    name: agencyClients.meta.name,
    description: agencyClients.meta.description ?? "",
    tags: agencyClients.meta.tags ?? [],
    workspaceCount: agencyClients.workspaces.length,
    icon: "Briefcase",
  },
  {
    id: "holding-company",
    name: holdingCompany.meta.name,
    description: holdingCompany.meta.description ?? "",
    tags: holdingCompany.meta.tags ?? [],
    workspaceCount: holdingCompany.workspaces.length,
    icon: "Layers",
  },
];

export const MIGRATION_TEMPLATE_DATA: Record<MigrationTemplateId, object> = {
  "single-business": singleBusiness,
  "multi-branch": multiBranch,
  "franchise-chain": franchiseChain,
  "agency-clients": agencyClients,
  "holding-company": holdingCompany,
};

export function getTemplateById(id: MigrationTemplateId): object | null {
  return MIGRATION_TEMPLATE_DATA[id] ?? null;
}
