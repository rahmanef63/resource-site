"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { ImagePickerButton } from "./components/ImagePickerButton";
import { imageStyle } from "./lib/imageStyle";
import type { ImageValue } from "./types";

const SEED: ImageValue = {
  type: "gradient",
  value: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  positionY: 50,
};
const { useDemoStore } = createDemoStore<ImageValue>({ slug: "image-picker", seed: SEED });

const ImagePreview: SlicePreviewModule["ImagePickerButton"] = ({ variant }) => {
  const buttonVariant =
    (variant.variant as "outline" | "secondary" | "ghost") ?? "outline";
  const size = (variant.size as "sm" | "default") ?? "sm";
  const [image, setImage, { ready }] = useDemoStore();

  if (!ready) return null;

  return (
    <div className="p-4">
      <div
        className="mb-3 h-28 w-full rounded-lg border border-border"
        style={imageStyle(image, null)}
      />
      <div className="flex items-center gap-3">
        <ImagePickerButton
          variant={buttonVariant}
          size={size}
          label="Choose image"
          onChange={(next) => setImage(next)}
        />
        <span className="text-xs text-muted-foreground">
          {image.type} · {String(image.value).slice(0, 28)}
        </span>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Gallery · Link · Upload tabs work with zero config. Unsplash live search
        is omitted here (needs a server key).
      </p>
    </div>
  );
};

const preview: SlicePreviewModule = { ImagePickerButton: ImagePreview };
export default preview;
