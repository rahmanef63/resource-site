import { useState, useEffect } from "react";
import { Modal } from "../../../../shared/components/Modal";
import { Button } from "../../../../shared/components/Button";
import { Input, Textarea, Select } from "../../../../shared/components/Form";
import { ImageEditor } from "../../../../shared/components/ImageEditor";
import { BulkImageUpload, UploadedImage } from "../../../../shared/components/BulkImageUpload";
import { Plus, X, GripVertical } from "lucide-react";
import type { PortfolioItem } from "../../../../types/cms-types";


interface PortfolioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PortfolioFormData) => Promise<void>;
  item?: PortfolioItem | null;
}

export interface PortfolioFormData {
  id?: number | string;
  slug: string;
  locale: string;
  title: string;
  description: string;
  tags: string[];
  images: Array<{ imageUrl: string; altText: string; displayOrder: number }>;
  status: string;
}

export function PortfolioForm({ isOpen, onClose, onSave, item }: PortfolioFormProps) {
  const [form, setForm] = useState<PortfolioFormData>({
    id: undefined,
    slug: "",
    locale: "id",
    title: "",
    description: "",
    tags: [],
    images: [],
    status: "draft",
  });

  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        slug: item.slug ?? "",
        locale: item.locale ?? "id",
        title: item.title,
        description: item.description || "",
        tags: item.tags ?? [],
        images: (item.images ?? []).map((img: { imageUrl: string; altText?: string | null }, idx: number) => ({
          imageUrl: img.imageUrl,
          altText: img.altText || "",
          displayOrder: idx,
        })),
        status: item.status ?? "draft",
      });
    } else {
      setForm({
        id: undefined,
        slug: "",
        locale: "id",
        title: "",
        description: "",
        tags: [],
        images: [],
        status: "draft",
      });
    }
  }, [item, isOpen]);

  const [tagInput, setTagInput] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [useBulkUpload, setUseBulkUpload] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const addImage = () => {
    setForm({
      ...form,
      images: [...form.images, { imageUrl: "", altText: "", displayOrder: form.images.length }],
    });
  };

  const updateImage = (index: number, field: "imageUrl" | "altText", value: string) => {
    const newImages = [...form.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setForm({ ...form, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages.map((img, i) => ({ ...img, displayOrder: i })) });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.images.length) return;

    const newImages = [...form.images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setForm({ ...form, images: newImages.map((img, i) => ({ ...img, displayOrder: i })) });
  };

  const handleBulkImagesUploaded = (uploadedImages: UploadedImage[]) => {
    const newImages = uploadedImages.map((img, idx) => ({
      imageUrl: img.url,
      altText: img.altText || "",
      displayOrder: form.images.length + idx,
    }));
    setForm({ ...form, images: [...form.images, ...newImages] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? "Edit Portfolio" : "Create Portfolio"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Slug"
            value={form.slug}
            onChange={(value) => setForm({ ...form, slug: value })}
            placeholder="wedding-photoshoot"
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

        <Textarea
          label="Description"
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
          rows={3}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <Button type="button" onClick={addTag}>Add</Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {form.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm flex items-center gap-2">
                {tag}
                <button aria-label="Close" type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Images</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseBulkUpload(!useBulkUpload)}
                className="text-sm text-primary hover:underline"
              >
                {useBulkUpload ? "Switch to Individual Upload" : "Switch to Bulk Upload"}
              </button>
              {!useBulkUpload && (
                <Button type="button" size="sm" onClick={addImage}>
                  <Plus className="w-4 h-4" />
                  Add Image
                </Button>
              )}
            </div>
          </div>

          {useBulkUpload && (
            <div className="mb-6">
              <BulkImageUpload
                onImagesUploaded={handleBulkImagesUploaded}
                maxImages={50}
                existingImages={form.images.map(img => ({
                  url: img.imageUrl,
                  altText: img.altText,
                }))}
                onRemoveImage={(index) => removeImage(index)}
              />
            </div>
          )}

          {!useBulkUpload && (
            <div className="space-y-4">
              {form.images.map((img, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <button aria-label="Drag to reorder"
                      type="button"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <button aria-label="Drag to reorder"
                      type="button"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === form.images.length - 1}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <ImageEditor
                      value={img.imageUrl}
                      onChange={(value) => updateImage(index, "imageUrl", value)}
                    />
                    <Input
                      label="Alt Text"
                      value={img.altText}
                      onChange={(value) => updateImage(index, "altText", value)}
                      placeholder="Describe the image..."
                    />
                  </div>

                  <Button aria-label="Close"
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Save Portfolio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
