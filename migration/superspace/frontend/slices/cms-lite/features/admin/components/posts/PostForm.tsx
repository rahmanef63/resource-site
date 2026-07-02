import { useState, useEffect } from "react";
import { Save, Clock } from "lucide-react";
import { Modal } from "../../../../shared/components/Modal";
import { Button } from "../../../../shared/components/Button";
import { Input, Select } from "../../../../shared/components/Form";
import { ImageEditor } from "../../../../shared/components/ImageEditor";
import { RichTextEditor } from "../../../../shared/components/RichTextEditor";
import { useAutosave, loadDraft, hasDraft } from "../../../../shared/hooks/useAutosave";
import type { Post } from "../../../../types/cms-types";

import { logger } from "../../../../shared/utils/logger";

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PostFormData) => Promise<void>;
  post?: Post | null;
}

export interface PostFormData {
  id?: number | string;
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  status: string;
}

export function PostForm({ isOpen, onClose, onSave, post }: PostFormProps) {
  const storageKey = `draft-post-${post?.id || 'new'}`;
  const [showDraftPrompt, setShowDraftPrompt] = useState<boolean>(false);
  
  const [form, setForm] = useState<PostFormData>({
    id: undefined,
    slug: "",
    locale: "id",
    title: "",
    excerpt: "",
    body: "",
    coverImage: "",
    publishedAt: undefined,
    scheduledPublishAt: undefined,
    status: "draft",
  });

  useEffect(() => {
    if (post) {
      setForm({
        id: post.id,
        slug: post.slug ?? "",
        locale: post.locale ?? "id",
        title: post.title,
        excerpt: post.excerpt || "",
        body: post.body || post.content || "",
        coverImage: post.coverImage || "",
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
        scheduledPublishAt: (post as any).scheduledPublishAt ? new Date((post as any).scheduledPublishAt) : undefined,
        status: post.status || "draft",
      });
    } else {
      setForm({
        id: undefined,
        slug: "",
        locale: "id",
        title: "",
        excerpt: "",
        body: "",
        coverImage: "",
        publishedAt: undefined,
        scheduledPublishAt: undefined,
        status: "draft",
      });
    }
  }, [post, isOpen]);

  const [saving, setSaving] = useState<boolean>(false);

  const { isSaving, lastSaved, saveNow, clearDraft } = useAutosave({
    data: form,
    onSave: async (data) => {
      if (data.status === 'draft') {
        localStorage.setItem(storageKey, JSON.stringify({
          ...data,
          _autosaveTimestamp: new Date().toISOString(),
        }));
      }
    },
    delay: 2000,
    enabled: form.status === 'draft' && isOpen,
    storageKey,
  });

  useEffect(() => {
    if (!post && hasDraft(storageKey)) {
      setShowDraftPrompt(true);
    }
  }, [post, storageKey]);

  const loadSavedDraft = () => {
    const draft = loadDraft<PostFormData>(storageKey);
    if (draft) {
      setForm(draft);
    }
    setShowDraftPrompt(false);
  };

  const dismissDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const action = post ? "update" : "create";
    logger.action(`${action === 'update' ? 'Mengupdate' : 'Menyimpan'} post...`, { 
      slug: form.slug, 
      status: form.status,
      locale: form.locale 
    });
    try {
      await onSave(form);
      logger.saved(`post '${form.title}'`, "database/posts table");
      clearDraft();
      onClose();
    } catch (err) {
      logger.error(action === 'update' ? "update" : "menyimpan", "post", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {showDraftPrompt && (
        <Modal isOpen={showDraftPrompt} onClose={dismissDraft} title="Restore Draft?" size="sm">
          <div className="space-y-4">
            <p className="text-foreground/80">
              A saved draft was found. Would you like to restore it?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={dismissDraft}>
                Discard
              </Button>
              <Button onClick={loadSavedDraft}>
                Restore Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}
      
      <Modal isOpen={isOpen} onClose={onClose} title={post ? "Edit Post" : "Create Post"} size="xl">
        {form.status === 'draft' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-foreground/60 bg-muted p-2 rounded">
            {isSaving ? (
              <>
                <Save className="w-4 h-4 animate-pulse" />
                <span>Saving draft...</span>
              </>
            ) : lastSaved ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Autosave enabled</span>
              </>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Slug"
            value={form.slug}
            onChange={(value) => setForm({ ...form, slug: value })}
            placeholder="my-blog-post"
            required
          />

          <Select
            label="Language"
            value={form.locale}
            onChange={(value) => setForm({ ...form, locale: value })}
            options={[
              { value: "id", label: "Indonesian" },
              { value: "en", label: "English" },
              { value: "ar", label: "Arabic" },
            ]}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value })}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
          />
        </div>

        <Input
          label="Title"
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
          required
        />

        <Input
          label="Excerpt"
          value={form.excerpt}
          onChange={(value) => setForm({ ...form, excerpt: value })}
          placeholder="A short summary of the post..."
        />

        <div>
          <label className="block text-sm font-medium mb-2">Cover Image</label>
          <ImageEditor
            value={form.coverImage}
            onChange={(value) => setForm({ ...form, coverImage: value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Body</label>
          <RichTextEditor
            value={form.body}
            onChange={(value) => setForm({ ...form, body: value })}
            placeholder="Write your post content here..."
          />
        </div>

        {form.status === "published" && (
          <Input
            label="Published At"
            type="datetime-local"
            value={form.publishedAt ? new Date(form.publishedAt).toISOString().slice(0, 16) : ""}
            onChange={(value) => setForm({ ...form, publishedAt: value ? new Date(value) : undefined })}
          />
        )}

        {form.status === "draft" && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Schedule Publishing</h3>
            </div>
            <Input
              label="Schedule Publish At (Optional)"
              type="datetime-local"
              value={form.scheduledPublishAt ? new Date(form.scheduledPublishAt).toISOString().slice(0, 16) : ""}
              onChange={(value) => setForm({ ...form, scheduledPublishAt: value ? new Date(value) : undefined })}
              placeholder="Leave empty to publish manually"
            />
            {form.scheduledPublishAt && (
              <p className="text-sm text-foreground/60 mt-2">
                This post will be automatically published on{' '}
                <span className="font-medium">
                  {new Date(form.scheduledPublishAt).toLocaleString()}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving || isSaving}>
            Save Post
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
}

