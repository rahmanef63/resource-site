"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Upload,
  X,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useFileUpload } from "@/shared/lib/use-file-upload";
import { useAuth } from "@/shared/lib/auth-context";
import { cn } from "@/shared/lib/cn";

const TENANT_ID = "admin";
const ACCEPT = "image/jpeg,image/png,image/webp,image/svg+xml,application/pdf";

type Props = {
  value: string | undefined | null;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Form-aware file field for AdminCrud. Stores the resolved URL
 * (from ctx.storage.getUrl) as the form value so public pages can
 * keep using `<img src={row.image}>` without any extra resolution.
 *
 * Flow: user picks file → useFileUpload uploads → we useQuery
 * getFileUrl with the storageId → onChange(url) when it lands.
 *
 * Escape hatch: click "URL" to paste any string (external URL or a
 * legacy /public path like `/rahmannobg.png`).
 */
export function AdminFileField({ value, onChange, placeholder, className }: Props) {
  const { user } = useAuth();
  const uploader = user?.email ?? "anonymous";
  const { upload, isUploading, progress, error, reset } = useFileUpload();
  const [pendingStorageId, setPendingStorageId] = React.useState<string | null>(null);
  const [manual, setManual] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resolvedUrl = useQuery(
    (api as any).slices.files.getFileUrl,
    pendingStorageId
      ? { storageId: pendingStorageId, requestingUser: uploader, tenantId: TENANT_ID }
      : "skip",
  ) as string | null | undefined;

  React.useEffect(() => {
    if (resolvedUrl && pendingStorageId) {
      onChange(resolvedUrl);
      setPendingStorageId(null);
      reset();
    }
  }, [resolvedUrl, pendingStorageId, onChange, reset]);

  const handleFile = async (file: File) => {
    try {
      const r = await upload(file, uploader, TENANT_ID);
      setPendingStorageId(r.storageId);
    } catch {
      /* error already in hook state */
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  const clear = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasValue = !!value;
  const awaiting = !!pendingStorageId && !resolvedUrl;
  const showUploader = !isUploading && !awaiting;

  return (
    <div className={cn("space-y-2", className)}>
      {hasValue && (
        <div className="flex items-start gap-3 border-2 border-foreground rounded-md bg-card p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value ?? ""}
            alt="preview"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            className="size-16 object-cover border-2 border-foreground rounded-md bg-background shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-[10px] uppercase tracking-brutal text-muted-foreground font-medium">
              Saat ini
            </div>
            <div className="text-xs font-mono truncate" title={value ?? ""}>
              {value}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              title="Ganti"
              className="inline-flex items-center justify-center size-8 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={clear}
              title="Hapus"
              className="inline-flex items-center justify-center size-8 border-2 border-destructive text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {showUploader && !hasValue && !manual && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            if (!dragging) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md bg-background px-4 py-5 cursor-pointer transition-colors",
            dragging
              ? "border-foreground bg-accent text-accent-foreground"
              : "border-foreground/60 hover:border-foreground hover:bg-accent/40",
            error && "border-destructive",
          )}
        >
          <Upload className="size-4" style={{ color: "oklch(var(--chart-1) / 1)" }} />
          <div className="text-center space-y-0.5">
            <div className="text-[11px] uppercase tracking-brutal-sm font-medium">
              Drop atau klik untuk unggah
            </div>
            <div className="text-[9px] uppercase tracking-brutal text-muted-foreground">
              JPEG · PNG · WEBP · SVG · PDF
            </div>
          </div>
        </label>
      )}

      {(isUploading || awaiting) && (
        <div className="border-2 border-foreground rounded-md bg-card p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-brutal-sm">
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin" />
              {awaiting ? "Memuat URL…" : "Mengunggah…"}
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 border-2 border-foreground rounded-sm overflow-hidden bg-background">
            <div
              className="h-full transition-[width] duration-200"
              style={{
                width: `${progress}%`,
                backgroundColor: "oklch(var(--chart-2) / 1)",
              }}
            />
          </div>
        </div>
      )}

      {error && !isUploading && (
        <div className="flex items-start gap-2 border-2 border-destructive rounded-md bg-destructive/10 text-destructive px-2.5 py-1.5 text-[10px] uppercase tracking-brutal-sm">
          <AlertCircle className="size-3 shrink-0 mt-0.5" />
          <span className="flex-1">{error.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setManual((m) => !m)}
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-brutal text-muted-foreground hover:text-foreground transition-colors"
        >
          <LinkIcon className="size-3" />
          {manual ? "Tutup input URL" : "Masukkan URL manual"}
        </button>
        {hasValue && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-brutal text-muted-foreground hover:text-foreground transition-colors"
          >
            <ImageIcon className="size-3" />
            Unggah baru
          </button>
        )}
      </div>

      {manual && (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "/image.webp or https://…"}
          className="w-full border-2 border-foreground rounded-md bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={onInput}
      />
    </div>
  );
}
