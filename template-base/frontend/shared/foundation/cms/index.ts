import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

export type CMSCollectionDoc = Doc<"cms_collections">;

export interface CMSCollectionsResult {
  collections: CMSCollectionDoc[] | undefined;
  loading: boolean;
}

export const useCMSCollections = (
  workspaceId?: Id<"workspaces"> | null
): CMSCollectionsResult => {
  const collections = useQuery(
    api.features.cms.queries.getCollections,
    workspaceId ? { workspaceId } : "skip"
  ) as CMSCollectionDoc[] | undefined;

  return {
    collections,
    loading: Boolean(workspaceId) && typeof collections === "undefined",
  };
};

export const useCreateCollection = () => {
  const mutate = useMutation(api.features.cms.mutations.createCollection);
  return { mutate };
};

export const useUpdateCollection = () => {
  const mutate = useMutation(api.features.cms.mutations.updateCollection);
  return { mutate };
};

export const useDeleteCollection = () => {
  const mutate = useMutation(api.features.cms.mutations.deleteCollection);
  return { mutate };
};
