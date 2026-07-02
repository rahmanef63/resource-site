export type {
  ContactsListProps,
  Contact,
  ContactRequest,
  WorkspaceMemberSummary,
  AddContactModalProps,
} from "./types";

// Public API re-exports — cross-slice consumers should import from this root barrel
export {
  useContactsApi,
  useContacts,
  usePendingContactRequests,
  useSentContactRequests,
  useSendContactRequest,
  useAcceptContactRequest,
  useDeclineContactRequest,
  useRemoveContact,
} from "./api";
