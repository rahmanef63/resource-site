import type { BookingRequest } from "./host";

export type BookingDraft = {
  name: string;
  email: string;
  topic: string;
  preferredTime: string;
  note: string;
};

export function isBookingDraftValid(draft: Pick<BookingDraft, "name" | "email" | "topic">): boolean {
  return Boolean(draft.name.trim() && draft.email.trim().includes("@") && draft.topic.trim());
}

export function normalizeBookingRequest(draft: BookingDraft): BookingRequest {
  return {
    name: draft.name.trim(),
    email: draft.email.trim(),
    topic: draft.topic.trim(),
    preferredTime: draft.preferredTime.trim() || undefined,
    note: draft.note.trim() || undefined,
  };
}
