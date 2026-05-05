export type ProjectStatus = "discovery" | "design" | "build" | "delivered" | "archived";

export type Project = {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  cover: string;
  blurb: string;
  brief: string;
  outcome: string;
  status: ProjectStatus;
  publishedAt: number;
  featured: boolean;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  contact: string;
  email: string;
  status: "active" | "prospect" | "alumni";
  startedAt: number;
  notes: string;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  priceLabel: string;
  duration: string;
  bullets: string[];
  featured: boolean;
};

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  topic: string;
  source: string;
  budget?: string;
  status: LeadStatus;
  ts: number;
};

export type State = {
  projects: Project[];
  clients: Client[];
  services: Service[];
  leads: Lead[];
};

export type Action =
  | { type: "project.upsert"; project: Project }
  | { type: "project.delete"; id: string }
  | { type: "client.upsert"; client: Client }
  | { type: "client.delete"; id: string }
  | { type: "service.upsert"; service: Service }
  | { type: "service.delete"; id: string }
  | { type: "lead.create"; lead: Lead }
  | { type: "lead.update"; id: string; patch: Partial<Lead> }
  | { type: "lead.delete"; id: string }
  | { type: "hydrate"; state: State }
  | { type: "reset" };
