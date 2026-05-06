"use client"

import * as React from "react"
import NextImage, { type ImageProps as NextImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface ImageProps extends Omit<NextImageProps, "src" | "alt"> {
  /**
   * Base64-encoded image data
   */
  base64: string
  /**
   * MIME type (e.g., 'image/jpeg', 'image/png')
   */
  mediaType: string
  /**
   * Binary image data array (optional, not used for rendering but kept for API compatibility)
   */
  uint8Array?: Uint8Array

  alt?: string
}

/**
 * Image - Display AI-generated images
 * 
 * Takes base64, mediaType from AI image generation and converts
 * to proper img src data URLs. No manual data URL construction needed.
 * 
 * @example
 * ```tsx
 * <Image
 *   base64="valid base64 string"
 *   mediaType="image/jpeg"
 *   alt="Generated image"
 *   className="max-w-md rounded-lg"
 * />
 * ```
 */
function Image({
  base64,
  mediaType,
  uint8Array,
  alt = "AI generated image",
  fill,
  width,
  height,
  className,
  ...props
}: ImageProps) {
  // Construct data URL from base64 and mediaType
  const src = React.useMemo(() => {
    if (!base64 || !mediaType) return ""
    return `data:${mediaType};base64,${base64}`
  }, [base64, mediaType])

  if (!src) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground rounded-md",
          className
        )}
        {...props as React.HTMLAttributes<HTMLDivElement>}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    )
  }

  const widthFromProps = typeof width === "string" ? Number(width) : width
  const heightFromProps = typeof height === "string" ? Number(height) : height

  return (
    <NextImage
      {...props}
      data-slot="ai-image"
      src={src}
      alt={alt}
      className={cn("max-w-full rounded-md", className)}
      fill={fill}
      height={fill ? undefined : (heightFromProps ?? 1024)}
      width={fill ? undefined : (widthFromProps ?? 1024)}
    />
  )
}

export { Image }
export type { ImageProps }
