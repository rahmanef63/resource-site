/**
 * File upload utilities
 * @module shared/chat/lib/upload
 */

import type { Attachment, AttachmentDraft, UploadedRef } from "../types/message";
import { ATTACHMENT_MIME_TYPES, CHAT_CONSTANTS } from "../constants/chat";
import { generateAttachmentId } from "../util/id";
import { validateAttachmentSize } from "../util/guard";
import type { ChatConfig } from "../types/config";

/**
 * Determine attachment kind from MIME type
 */
export function getAttachmentKind(
  mimeType: string
): Attachment["kind"] | null {
  if (ATTACHMENT_MIME_TYPES.IMAGE.includes(mimeType as any)) return "image";
  if (ATTACHMENT_MIME_TYPES.VIDEO.includes(mimeType as any)) return "video";
  if (ATTACHMENT_MIME_TYPES.AUDIO.includes(mimeType as any)) return "audio";
  if (ATTACHMENT_MIME_TYPES.DOCUMENT.includes(mimeType as any)) return "file";
  return "file"; // Default to file for unknown types
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  config?: ChatConfig
): { valid: boolean; error?: string } {
  // Check if attachments are allowed
  if (!config?.allowAttachments) {
    return { valid: false, error: "Attachments are not allowed" };
  }

  // Check file size
  const sizeValidation = validateAttachmentSize(file.size, config);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Additional validations can be added here
  return { valid: true };
}

/**
 * Upload file to storage
 * TODO: Implement actual upload to Convex storage or CDN
 */
export async function uploadFile(
  file: File,
  config?: ChatConfig
): Promise<UploadedRef> {
  // Validate file first
  const validation = validateFile(file, config);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // TODO: Implement actual upload
  // For Convex: Use storage.generateUploadUrl() then fetch()
  // For direct upload: Use signed URL from server

  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      resolve({
        id: generateAttachmentId(),
        url: mockUrl,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });
    }, 1000);
  });
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  config?: ChatConfig,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadedRef[]> {
  // Check max attachments limit
  if (files.length > CHAT_CONSTANTS.MAX_ATTACHMENTS_PER_MESSAGE) {
    throw new Error(
      `Maximum ${CHAT_CONSTANTS.MAX_ATTACHMENTS_PER_MESSAGE} attachments allowed`
    );
  }

  const results: UploadedRef[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const uploaded = await uploadFile(file, config);
      results.push(uploaded);
      completed++;
      onProgress?.(completed, files.length);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Convert UploadedRef to Attachment
 */
export function uploadedToAttachment(uploaded: UploadedRef): Attachment {
  return {
    id: uploaded.id,
    kind: getAttachmentKind(uploaded.mimeType) || "file",
    url: uploaded.url,
    name: uploaded.name,
    size: uploaded.size,
    mimeType: uploaded.mimeType,
  };
}

/**
 * Generate thumbnail for image
 */
export async function generateThumbnail(
  file: File,
  maxWidth = 200,
  maxHeight = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Download attachment
 */
export async function downloadAttachment(
  attachment: Attachment,
  filename?: string
): Promise<void> {
  try {
    const response = await fetch(attachment.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || attachment.name || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download attachment:", error);
    throw error;
  }
}

/**
 * Copy attachment URL to clipboard
 */
export async function copyAttachmentUrl(attachment: Attachment): Promise<void> {
  try {
    await navigator.clipboard.writeText(attachment.url);
  } catch (error) {
    console.error("Failed to copy URL:", error);
    throw error;
  }
}
