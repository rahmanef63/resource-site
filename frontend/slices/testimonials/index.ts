// Testimonials slice — public read, admin CRUD, internal seed.
// Convex schema/queries/mutations at convex/features/testimonials/.

export { testimonialsFeature } from "./config";

export type Testimonial = {
  _id: string;
  quote: string;
  name: string;
  role: string;
  order: number;
  createdAt: number;
};
