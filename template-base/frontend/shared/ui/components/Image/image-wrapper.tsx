/**
 * image-component Wrapper
 * Displays an image with various styling options
 */

import { ImageComponent } from "./image-component"
import { createComponent, textProp, booleanProp, selectProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface ImageProps {
  src?: string
  alt?: string
  width?: string
  height?: string
  rounded?: boolean
  objectFit?: string
  className?: string
}

export const ImageWrapper: ComponentWrapper<ImageProps> = createComponent<ImageProps>({
  id: "image",
  name: "Image",
  displayName: "Image",
  description: "Displays an image with various styling options",
  category: "media",
  component: ImageComponent as any,

  defaults: {
    src: "https://picsum.photos/640/420",
    alt: "placeholder",
    width: "640",
    height: "420",
    rounded: true,
    objectFit: "cover",
    className: "w-full h-auto",
  },

  props: {
    src: textProp("Source URL", "https://picsum.photos/640/420"),
    alt: textProp("Alt Text", "placeholder"),
    width: textProp("Width", "640"),
    height: textProp("Height", "420"),
    rounded: booleanProp("Rounded", true),
    objectFit: selectProp("Object Fit", ['cover', 'contain', 'fill', 'none', 'scale-down'], "cover"),
  },

  icon: "Image",
  tags: ["image", "media", "picture", "photo"],

  metadata: {
    version: "1.0.0",
    category: "media",
  },
})

export default ImageWrapper
