// Services slice — public read, admin CRUD, internal seed.
// Convex schema/queries/mutations at convex/features/services/.

export { servicesFeature } from "./config";

export type Service = {
  _id: string;
  title: string;
  summary: string;
  deliverables: string[];
  order: number;
  createdAt: number;
};
