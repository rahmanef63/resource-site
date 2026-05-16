// Subscribers slice — newsletter list with honeypot + per-email rate-limit +
// token-based unsubscribe. Schema + queries + mutations live in
// convex/features/subscribers/. This barrel exports the frontend types +
// feature config only.

export { subscribersFeature } from "./config";

export type Subscriber = {
  _id: string;
  email: string;
  source?: string;
  confirmed: boolean;
  unsubscribeToken: string;
  createdAt: number;
  confirmedAt?: number;
  unsubscribedAt?: number;
};
