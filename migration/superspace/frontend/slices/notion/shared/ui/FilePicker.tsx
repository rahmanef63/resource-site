"use client"

/**
 * Headless file picker — a hidden native file input with an imperative
 * `open()` handle. Vendored seam the notion image/media blocks expect
 * (`@/shared/ui/FilePicker` in the source app); kept slice-local here.
 */

import { forwardRef, useImperativeHandle, useRef } from "react"

export interface FilePickerHandle {
  open: () => void
}

interface FilePickerProps {
  accept?: string
  multiple?: boolean
  "aria-label"?: string
  onFiles: (files: File[]) => void
}

export const FilePicker = forwardRef<FilePickerHandle, FilePickerProps>(function FilePicker(
  { accept, multiple, onFiles, ...rest },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => ({ open: () => inputRef.current?.click() }), [])
  return (
    // @dod:skip-primitive reason="vendored rr notion seam; local-first slice, no fileAttachments backend by design"
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      hidden
      onChange={(e) => {
        const files = Array.from(e.target.files ?? [])
        if (files.length) onFiles(files)
        e.target.value = ""
      }}
      {...rest}
    />
  )
})
