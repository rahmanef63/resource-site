import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Modal } from "../../../../shared/components/Modal";
import { Button } from "../../../../shared/components/Button";
import { RotateCcw, Clock, User } from "lucide-react";

interface Revision {
  id: number;
  title: string;
  excerpt: string | null;
  body: string;
  createdAt: Date;
  createdBy: string | null;
  revisionNote: string | null;
}

interface RevisionsDiffProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: Revision[];
  onRestore: (revisionId: number) => Promise<void>;
}

export function RevisionsDiff({ isOpen, onClose, revisions, onRestore }: RevisionsDiffProps) {
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async (revisionId: number) => {
    if (!confirm("Are you sure you want to restore this revision? This will create a new version based on this revision.")) {
      return;
    }

    setRestoring(true);
    try {
      await onRestore(revisionId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Revisions" size="xl">
      <div className="flex gap-4" style={{ maxHeight: "70vh" }}>
        <div className="w-1/3 border-r pr-4 overflow-y-auto">
          <h3 className="font-semibold mb-3">Revision History</h3>
          <div className="space-y-2">
            {revisions.map((revision) => (
              <button
                key={revision.id}
                onClick={() => setSelectedRevision(revision)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedRevision?.id === revision.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                  <Clock className="w-3 h-3" />
                  {new Date(revision.createdAt).toLocaleString()}
                </div>
                {revision.revisionNote && (
                  <p className="text-sm font-medium mb-1">{revision.revisionNote}</p>
                )}
                <p className="text-sm truncate">{revision.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedRevision ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{selectedRevision.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedRevision.createdAt).toLocaleString()}
                  </div>
                  {selectedRevision.revisionNote && (
                    <p className="text-sm text-foreground/70 mt-2">
                      Note: {selectedRevision.revisionNote}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleRestore(selectedRevision.id)}
                  isLoading={restoring}
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                {selectedRevision.excerpt && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                    <p className="text-sm text-foreground/80">{selectedRevision.excerpt}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Body</label>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedRevision.body) }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-foreground/60">
              Select a revision to view details
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
