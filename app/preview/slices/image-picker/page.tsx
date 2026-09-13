"use client";

import * as React from "react";
import preview from "@/features/image-picker/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ImagePickerPreview = preview.ImagePickerButton;
type Variant = "outline" | "secondary" | "ghost";
type Size = "sm" | "default";

export default function Page() {
  const [variant, setVariant] = React.useState<Variant>("outline");
  const [size, setSize] = React.useState<Size>("sm");

  return (
    <SlicePreviewLayout
      title="Image Picker"
      kind="ui"
      description="Portable gallery, upload, link, Unsplash, and focal-point image selection through the canonical preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/image-picker"
    >
      <PreviewSection title="Picker trigger" hint={`variant="${variant}" · size="${size}"`}>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["outline", "secondary", "ghost"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setVariant(value)}
              className={cn(variant === value && "bg-accent font-medium")}
            >
              {value}
            </Button>
          ))}
          {(["sm", "default"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSize(value)}
              className={cn(size === value && "bg-accent font-medium")}
            >
              {value}
            </Button>
          ))}
        </div>
        <ImagePickerPreview variant={{ variant, size }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
