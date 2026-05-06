/**
 * Generic file-upload hook stub. Kitab foundation; specific apps wire
 * this to their storage backend (Convex storage, S3, R2, etc.).
 *
 * Replace with a real implementation when scaffolding a new project.
 * The exposed surface mirrors superspace's hook so existing callers
 * (file-upload.tsx, file-upload-queue.tsx, admin-*-field.tsx) compile.
 */

import { useCallback, useState } from "react";

export type UploadPhase =
  | "idle"
  | "preparing"
  | "converting"
  | "uploading"
  | "saving"
  | "finalizing"
  | "done"
  | "error";

export type UploadResult = {
  url: string;
  storageId?: string;
  fileName?: string;
  mimeType?: string;
  fileType?: string;
  fileSize?: number;
  size?: number;
  originalSize?: number;
  converted?: boolean;
};

export interface UseFileUploadOptions {
  workspaceId?: string;
  onProgress?: (pct: number) => void;
}

export function useFileUpload(_options: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setPhase("idle");
    setProgress(0);
    setError(null);
    setStorageId(null);
  }, []);

  const upload = useCallback(async (
    file: File,
    _uploadedBy?: unknown,
    _tenantId?: unknown,
    extras?: { originalSize?: number },
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setPhase("preparing");
    setProgress(0);
    setError(null);
    try {
      const reader = new FileReader();
      const url = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setPhase("done");
      setProgress(100);
      return {
        url,
        fileName: file.name,
        mimeType: file.type,
        fileType: file.type,
        size: file.size,
        fileSize: file.size,
        originalSize: extras?.originalSize ?? file.size,
        converted: false,
      };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setPhase("error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, phase, progress, error, storageId, reset };
}

/**
 * Imperative variant — same effect as `upload(file)` from useFileUpload
 * but callable outside a React component (queue workers, batch jobs).
 *
 * Accepts a flexible config object so the queue runner (file-upload-queue)
 * can pass `{ file, uploadedBy, tenantId, mutations, callbacks }` without
 * each kitab app having to implement an entire async upload pipeline.
 */
export interface PerformUploadConfig {
  file: File;
  uploadedBy?: unknown;
  tenantId?: unknown;
  mutations?: { generateUploadUrl?: () => Promise<string>; recordUpload?: (...args: any[]) => Promise<unknown> };
  callbacks?: {
    onPhase?: (phase: UploadPhase) => void;
    onProgress?: (pct: number) => void;
  };
  originalSize?: number;
}

export async function performUpload(
  arg: File | PerformUploadConfig,
  _options: UseFileUploadOptions = {},
): Promise<UploadResult> {
  const isConfig = arg instanceof File ? false : typeof arg === "object";
  const file = isConfig ? (arg as PerformUploadConfig).file : (arg as File);
  const cfg: PerformUploadConfig | undefined = isConfig ? (arg as PerformUploadConfig) : undefined;

  cfg?.callbacks?.onPhase?.("preparing");
  const reader = new FileReader();
  const url = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  cfg?.callbacks?.onPhase?.("done");
  cfg?.callbacks?.onProgress?.(100);
  return {
    url,
    fileName: file.name,
    mimeType: file.type,
    fileType: file.type,
    size: file.size,
    fileSize: file.size,
    originalSize: cfg?.originalSize ?? file.size,
    converted: false,
  };
}

/**
 * Stub: returns no-op mutation refs. Real impl returns Convex mutation
 * references for `generateUploadUrl` + `recordUpload`. Kitab apps that
 * need file upload should override this hook.
 */
export function useUploadMutations() {
  return {
    generateUploadUrl: async () => "",
    recordUpload: async () => "",
  };
}

/**
 * Validate file size + mime against a soft policy. Returns null if OK,
 * else an error message string.
 */
export function validateFile(
  file: File,
  options: { maxSize?: number; accept?: string[] } = {},
): string | null {
  if (options.maxSize && file.size > options.maxSize) {
    return `File too large (max ${(options.maxSize / 1_048_576).toFixed(1)} MB)`;
  }
  if (options.accept && options.accept.length > 0) {
    const ok = options.accept.some((a) => {
      if (a.endsWith("/*")) return file.type.startsWith(a.slice(0, -1));
      return file.type === a;
    });
    if (!ok) return `File type "${file.type}" not allowed`;
  }
  return null;
}
