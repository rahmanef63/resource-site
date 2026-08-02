/**
 * Attachment upload button component
 * @module shared/chat/components/AttachmentButton
 */

import React from "react";

export type AttachmentButtonProps = {
  onSelect: (files: File[]) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
};

/**
 * File attachment button
 */
export function AttachmentButton({
  onSelect,
  disabled = false,
  maxSizeMB = 10,
  accept = "*/*",
  multiple = true,
}: AttachmentButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file sizes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > maxSizeBytes);

    if (oversizedFiles.length > 0) {
      alert(
        `Some files exceed the ${maxSizeMB}MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    onSelect(files);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        className="chat-attachment-button"
        onClick={handleClick}
        disabled={disabled}
        aria-label="Attach files"
        title="Attach files"
      >
        📎
      </button>

      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </>
  );
}
