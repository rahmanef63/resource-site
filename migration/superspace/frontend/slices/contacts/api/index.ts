import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

// Contacts API hooks
export const useContactsApi = () => {
  // Queries - use api.user.contacts (file is convex/user/contacts.ts)
  const contacts = useQuery(api.user.contacts.getUserContacts);
  const pendingRequests = useQuery(api.user.contacts.getPendingContactRequests);
  const sentRequests = useQuery(api.user.contacts.getSentContactRequests);

  // Mutations
  const sendContactRequest = useMutation(api.user.contacts.sendContactRequest);
  const acceptContactRequest = useMutation(api.user.contacts.acceptContactRequest);
  const declineContactRequest = useMutation(api.user.contacts.declineContactRequest);
  const removeContact = useMutation(api.user.contacts.removeContact);

  return {
    // Data (use lowercase for consistency)
    contacts,
    Contacts: contacts, // Alias for backward compatibility
    pendingRequests,
    sentRequests,

    // Actions
    sendContactRequest,
    acceptContactRequest,
    declineContactRequest,
    removeContact,
  };
};

// Individual hooks for specific use cases
export const useContacts = () => useQuery(api.user.contacts.getUserContacts);
export const usePendingContactRequests = () => useQuery(api.user.contacts.getPendingContactRequests);
export const useSentContactRequests = () => useQuery(api.user.contacts.getSentContactRequests);

export const useSendContactRequest = () => useMutation(api.user.contacts.sendContactRequest);
export const useAcceptContactRequest = () => useMutation(api.user.contacts.acceptContactRequest);
export const useDeclineContactRequest = () => useMutation(api.user.contacts.declineContactRequest);
export const useRemoveContact = () => useMutation(api.user.contacts.removeContact);
