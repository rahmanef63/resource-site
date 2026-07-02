import { useState, useEffect } from "react";
import { Modal } from "../../../../shared/components/Modal";
import { Button } from "../../../../shared/components/Button";
import { Input, Textarea, Select } from "../../../../shared/components/Form";
import { ImageEditor } from "../../../../shared/components/ImageEditor";
import type { Product } from "../../../../types/cms-types";

import { validateForm, required, slug as slugValidator, min, url as urlValidator, type ValidationErrors } from "../../../../shared/utils/validation";
import { logger } from "../../../../shared/utils/logger";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
  product?: Product | null;
}

export interface ProductFormData {
  id?: number | string;
  slug: string;
  titleId: string;
  titleEn: string;
  titleAr: string;
  descId: string;
  descEn: string;
  descAr: string;
  price: number;
  currency: string;
  paymentLink: string;
  coverImage: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export function ProductForm({ isOpen, onClose, onSave, product }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    id: undefined,
    slug: "",
    titleId: "",
    titleEn: "",
    titleAr: "",
    descId: "",
    descEn: "",
    descAr: "",
    price: 0,
    currency: "SAR",
    paymentLink: "",
    coverImage: "",
    status: "draft",
  });

  const [activeTab, setActiveTab] = useState<"id" | "en" | "ar">("id");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (product) {
      setForm({
        id: product.id,
        slug: product.slug || "",
        titleId: product.titleId || "",
        titleEn: product.titleEn || "",
        titleAr: product.titleAr || "",
        descId: product.descId || "",
        descEn: product.descEn || "",
        descAr: product.descAr || "",
        price: product.price || 0,
        currency: product.currency || "SAR",
        paymentLink: product.paymentLink || "",
        coverImage: product.coverImage || "",
        status: product.status || "draft",
      });
    } else {
      setForm({
        id: undefined,
        slug: "",
        titleId: "",
        titleEn: "",
        titleAr: "",
        descId: "",
        descEn: "",
        descAr: "",
        price: 0,
        currency: "SAR",
        paymentLink: "",
        coverImage: "",
        status: "draft",
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form, {
      slug: [required(), slugValidator()],
      titleId: [required()],
      titleEn: [required()],
      titleAr: [required()],
      price: [required(), min(0)],
      paymentLink: [urlValidator()],
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      logger.error("validasi", "product form", validationErrors);
      return;
    }

    setSaving(true);
    const action = product ? "update" : "create";
    logger.action(`${action === 'update' ? 'Mengupdate' : 'Menyimpan'} product...`, { 
      slug: form.slug, 
      price: form.price,
      currency: form.currency 
    });
    try {
      await onSave(form);
      logger.saved(`product '${form.titleEn}'`, "database/products table");
      onClose();
    } catch (err) {
      logger.error(action === 'update' ? "update" : "menyimpan", "product", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Create Product"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              placeholder="private-photoshoot"
              required
            />
            {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
          </div>

          <Select
            label="Status"
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value })}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
          />

          <div>
            <Input
              label="Price"
              type="number"
              value={form.price.toString()}
              onChange={(value) => setForm({ ...form, price: parseFloat(value) || 0 })}
              required
            />
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>

          <Select
            label="Currency"
            value={form.currency}
            onChange={(value) => setForm({ ...form, currency: value })}
            options={[
              { value: "SAR", label: "SAR (Saudi Riyal)" },
              { value: "USD", label: "USD (US Dollar)" },
              { value: "IDR", label: "IDR (Indonesian Rupiah)" },
            ]}
          />
        </div>

        <div>
          <Input
            label="Payment Link"
            value={form.paymentLink}
            onChange={(value) => setForm({ ...form, paymentLink: value })}
            placeholder="https://payment.link/..."
          />
          {errors.paymentLink && <p className="text-sm text-red-500 mt-1">{errors.paymentLink}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cover Image</label>
          <ImageEditor
            value={form.coverImage}
            onChange={(value) => setForm({ ...form, coverImage: value })}
          />
        </div>

        <div>
          <div className="flex gap-2 mb-4 border-b">
            {(["id", "en", "ar"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveTab(lang)}
                className={`px-4 py-2 ${
                  activeTab === lang
                    ? "border-b-2 border-primary font-medium"
                    : "text-foreground/60"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <Input
                label="Title"
                value={form[`title${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)}` as keyof ProductFormData] as string}
                onChange={(value) =>
                  setForm({
                    ...form,
                    [`title${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)}`]: value,
                  })
                }
                required
              />
              {errors[`title${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)}`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`title${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)}`]}
                </p>
              )}
            </div>

            <Textarea
              label="Description"
              value={form[`desc${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)}` as keyof ProductFormData] as string}
              onChange={(value) =>
                setForm({
                  ...form,
                  [`desc${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)}`]: value,
                })
              }
              rows={6}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Save Product
          </Button>
        </div>
      </form>
    </Modal>
  );
}

