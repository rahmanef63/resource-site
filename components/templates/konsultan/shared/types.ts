// Konsultan OS — domain types.

export type ClientStatus = "lead" | "active" | "completed";

export type Client = {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  city: string;
  status: ClientStatus;
  createdAt: number;
};

export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";

export type Proposal = {
  id: string;
  clientId: string;
  title: string;
  scope: string;
  valueLabel: string; // "Rp 80jt"
  durationLabel: string; // "3 bulan"
  status: ProposalStatus;
  createdAt: number;
};

export type ContractStatus = "draft" | "signed" | "expired";

export type Contract = {
  id: string;
  proposalId: string;
  clientId: string;
  title: string;
  termsSummary: string;
  status: ContractStatus;
  signedAt: number;
  endsAt: number;
};

export type ProjectStatus = "kickoff" | "in-progress" | "review" | "delivered";

export type Project = {
  id: string;
  contractId: string;
  clientId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  startedAt: number;
  endsAt: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type Invoice = {
  id: string;
  projectId: string;
  clientId: string;
  number: string; // "INV-2026-001"
  amountLabel: string;
  ppnLabel: string; // "Rp 8.8jt (11%)"
  totalLabel: string;
  status: InvoiceStatus;
  dueAt: number;
  issuedAt: number;
};

export type ConsultDoc = {
  id: string;
  projectId: string;
  title: string;
  kind: "deliverable" | "memo" | "minutes" | "report";
  status: "draft" | "shared";
  updatedAt: number;
};

export type State = {
  clients: Client[];
  proposals: Proposal[];
  contracts: Contract[];
  projects: Project[];
  invoices: Invoice[];
  documents: ConsultDoc[];
};

export type Action =
  | { type: "client.upsert"; client: Client }
  | { type: "client.delete"; id: string }
  | { type: "proposal.upsert"; proposal: Proposal }
  | { type: "proposal.delete"; id: string }
  | { type: "contract.upsert"; contract: Contract }
  | { type: "contract.delete"; id: string }
  | { type: "project.upsert"; project: Project }
  | { type: "project.delete"; id: string }
  | { type: "invoice.upsert"; invoice: Invoice }
  | { type: "invoice.delete"; id: string }
  | { type: "document.upsert"; doc: ConsultDoc }
  | { type: "document.delete"; id: string }
  | { type: "hydrate"; state: State }
  | { type: "reset" };
