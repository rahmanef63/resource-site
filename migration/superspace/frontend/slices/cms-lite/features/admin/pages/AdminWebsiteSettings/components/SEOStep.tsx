/**
 * SEO Configuration Step
 * Configure title, description, keywords, images
 */

import { FileText, Image, Tag } from "lucide-react";
import NextImage from "next/image";
import { Input } from "../../../../../shared/components/Form";
import { cn } from "@/lib/utils";
import type { WebsiteSettings, ValidationErrors } from "../types";

interface SEOStepProps {
  form: WebsiteSettings;
  setForm: (form: WebsiteSettings) => void;
  errors: ValidationErrors;
}

export function SEOStep({ form, setForm, errors }: SEOStepProps) {
  const descriptionLength = form.siteDescription.length;
  const isDescriptionOverLimit = descriptionLength > 160;

  return (
    <div className="space-y-6">
      {/* Site Title */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-primary" />
          Site Title <span className="text-red-500">*</span>
        </label>
        <div className={cn(errors.siteTitle && "ring-2 ring-red-500 rounded-lg")}>
          <Input
            value={form.siteTitle}
            onChange={(value) => setForm({ ...form, siteTitle: value })}
            placeholder="My Awesome Website"
          />
        </div>
        {errors.siteTitle && (
          <p className="text-sm text-red-500">{errors.siteTitle}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Optimal: 50-60 characters • Current: {form.siteTitle.length} chars
        </p>
      </div>

      {/* Site Description */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-primary" />
          Meta Description <span className="text-red-500">*</span>
        </label>
        <div className={cn(
          errors.siteDescription && "ring-2 ring-red-500 rounded-lg"
        )}>
          <textarea
            value={form.siteDescription}
            onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
            placeholder="A compelling description of your website that will appear in search results..."
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            "text-muted-foreground",
            isDescriptionOverLimit && "text-red-500 font-semibold"
          )}>
            {descriptionLength}/160 characters
          </span>
          {isDescriptionOverLimit && (
            <span className="text-red-500">Over limit!</span>
          )}
        </div>
        {errors.siteDescription && (
          <p className="text-sm text-red-500">{errors.siteDescription}</p>
        )}
        <p className="text-xs text-muted-foreground">
          💡 Include a call-to-action for better click-through rates
        </p>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Tag className="w-4 h-4 text-primary" />
          Keywords <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <Input
          value={form.keywords || ''}
          onChange={(value) => setForm({ ...form, keywords: value })}
          placeholder="web design, portfolio, creative agency"
        />
        <p className="text-xs text-muted-foreground">
          Separate keywords with commas • Aim for 5-10 relevant keywords
        </p>
        {form.keywords && (
          <div className="flex flex-wrap gap-2 pt-2">
            {form.keywords.split(',').filter(k => k.trim()).map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary/10 text-primary border border-primary/20"
              >
                {keyword.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Favicon */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Image className="w-4 h-4 text-primary" />
          Favicon URL <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <div className={cn(
          errors.favicon && "ring-2 ring-red-500 rounded-lg"
        )}>
          <Input
            value={form.favicon || ''}
            onChange={(value) => setForm({ ...form, favicon: value })}
            placeholder="https://example.com/favicon.ico"
          />
        </div>
        {errors.favicon && (
          <p className="text-sm text-red-500">{errors.favicon}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Recommended: 32x32px or 64x64px • Formats: .ico, .png, .svg
        </p>
      </div>

      {/* Open Graph Image */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Image className="w-4 h-4 text-primary" />
          Open Graph Image <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <div className={cn(
          errors.ogImage && "ring-2 ring-red-500 rounded-lg"
        )}>
          <Input
            value={form.ogImage || ''}
            onChange={(value) => setForm({ ...form, ogImage: value })}
            placeholder="https://example.com/og-image.jpg"
          />
        </div>
        {errors.ogImage && (
          <p className="text-sm text-red-500">{errors.ogImage}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Recommended: 1200x630px • Used when sharing on social media
        </p>

        {/* OG Image Preview */}
        {form.ogImage && !errors.ogImage && (
          <div className="mt-3 p-3 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Preview:</p>
            <div className="relative aspect-[1.91/1] rounded overflow-hidden bg-background">
              <NextImage
                src={form.ogImage}
                alt="OG Preview"
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </div>
        )}
      </div>

      {/* SEO Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 SEO Best Practices
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Write unique, descriptive titles for each page</li>
          <li>• Include target keywords naturally in descriptions</li>
          <li>• Use long-tail keywords (2-3 words) for better ranking</li>
          <li>• Optimize images for fast loading (compress before upload)</li>
          <li>• Update content regularly to keep it fresh</li>
        </ul>
      </div>
    </div>
  );
}
