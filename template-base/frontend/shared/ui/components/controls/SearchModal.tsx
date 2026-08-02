import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface SearchModalProps {
  workspaceId: Id<"workspaces">;
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (documentId: Id<"documents">) => void;
}

export function SearchModal({ workspaceId, isOpen, onClose, onSelectDocument }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const searchResults = useQuery(
    api["features/docs/documents"].searchDocuments,
    query.trim() ? { workspaceId, query } : "skip"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-2xl mx-4 max-h-96 flex flex-col">
        <div className="p-4 border-b">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-auto p-4">
          {query.trim() && searchResults ? (
            <div className="space-y-2">
              {searchResults.map((doc: { _id: Id<"documents">; title?: string; _creationTime: number }) => (
                <Button
                  key={doc._id}
                  variant="ghost"
                  onClick={() => {
                    onSelectDocument(doc._id);
                    onClose();
                  }}
                  className="w-full justify-start h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(doc._creationTime).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))}
              {searchResults.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No documents found
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Start typing to search documents
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
