"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import dynamic from "next/dynamic";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crop as CropIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useFileUpload, type UploadResult } from "@/shared/lib/use-file-upload";
import {
  applyCropToImage,
  describeConversion,
  type PixelCrop,
} from "@/shared/lib/image-convert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Lazy-load react-easy-crop so it only ships when a slice uses <FileUpload crop>.
// Cast to any: the package uses static defaultProps, which next/dynamic's
// inferred types surface as required — breaks typecheck on sensible defaults.
const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false }) as any;

export type CropConfig = boolean | { aspect?: number };

type FileUploadProps = {
  uploadedBy: string;
  tenantId: string;
  onUploaded?: (info: UploadResult) => void;
  accept?: string;
  className?: string;
  label?: string;
  /** Enable cropping UI for image picks. Pass { aspect: 1 } to lock square. */
  crop?: CropConfig;
  /** Render progress in a fixed portal instead of inline. */
  floating?: boolean;
};

const ACCEPT_DEFAULT = "image/jpeg,image/png,image/webp,application/pdf";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function FileUpload({
  uploadedBy,
  tenantId,
  onUploaded,
  accept = ACCEPT_DEFAULT,
  className,
  label = "Drop file di sini atau klik untuk pilih",
  crop,
  floating = false,
}: FileUploadProps) {
  const { upload, isUploading, phase, progress, error, storageId, reset } = useFileUpload();
  const [dragging, setDragging] = React.useState(false);
  const [info, setInfo] = React.useState<UploadResult | null>(null);
  const [pending, setPending] = React.useState<{ file: File; src: string } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const urlQuery = useQuery(
    (api as any).slices.files.getFileUrl,
    storageId && info ? { storageId, requestingUser: uploadedBy, tenantId } : "skip",
  ) as string | null | undefined;

  const startUpload = async (file: File, originalSize?: number) => {
    try {
      const result = await upload(file, uploadedBy, tenantId, { originalSize });
      setInfo(result);
      onUploaded?.(result);
      if (result.converted) {
        toast.success(
          `Gambar dikonversi ke WebP — ${describeConversion(result.originalSize, result.fileSize)}`,
        );
      }
    } catch {
      /* error already toasted inside the hook */
    }
  };

  const handleFile = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const shouldCrop = !!crop && isImage;
    if (shouldCrop) {
      const src = URL.createObjectURL(file);
      setPending({ file, src });
    } else {
      await startUpload(file);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const clear = () => {
    setInfo(null);
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  const cancelCrop = () => {
    if (pending) URL.revokeObjectURL(pending.src);
    setPending(null);
  };

  const confirmCrop = async (pixelCrop: PixelCrop) => {
    if (!pending) return;
    try {
      const cropped = await applyCropToImage(pending.file, pixelCrop);
      const originalSize = pending.file.size;
      URL.revokeObjectURL(pending.src);
      setPending(null);
      await startUpload(cropped, originalSize);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(err.message);
    }
  };

  const isImage = info ? info.fileType.startsWith("image/") : false;
  const phaseLabel = phaseToLabel(phase);

  const progressInline = !floating && isUploading;
  const progressFloating = floating && isUploading;

  return (
    <div className={cn("space-y-3", className)}>
      {!info && !progressInline && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            if (!dragging) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg bg-card px-6 py-10 cursor-pointer transition-colors",
            dragging
              ? "border-foreground bg-accent text-accent-foreground"
              : "border-foreground/60 hover:border-foreground hover:bg-accent/40",
            error && "border-destructive",
            floating && isUploading && "opacity-70 cursor-wait",
          )}
        >
          <div
            className="inline-flex items-center justify-center size-12 border-2 border-foreground rounded-md bg-background"
            style={{ color: "oklch(var(--chart-1) / 1)" }}
          >
            {progressFloating ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm uppercase tracking-brutal-sm font-medium">{label}</div>
            <div className="text-[10px] uppercase tracking-brutal text-muted-foreground">
              JPG · PNG · WEBP · PDF — maks 10 MB gambar / 50 MB dokumen
            </div>
            {crop ? (
              <div className="inline-flex items-center gap-1.5 pt-1 text-[10px] uppercase tracking-brutal text-muted-foreground">
                <CropIcon className="size-3" />
                Gambar bisa dipotong sebelum upload
              </div>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={onInputChange}
            disabled={isUploading}
          />
        </label>
      )}

      {progressInline && (
        <div className="border-2 border-foreground rounded-lg bg-card p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-brutal-sm">
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              {phaseLabel}
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 border-2 border-foreground rounded-sm overflow-hidden bg-background">
            <div
              className="h-full transition-[width] duration-200"
              style={{
                width: `${phase === "uploading" ? progress : phase === "saving" ? 100 : 5}%`,
                backgroundColor: "oklch(var(--chart-2) / 1)",
              }}
            />
          </div>
        </div>
      )}

      {info && !isUploading && (
        <div className="border-2 border-foreground rounded-lg bg-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            {isImage && urlQuery ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlQuery}
                alt={info.fileName}
                className="size-20 object-cover border-2 border-foreground rounded-md shrink-0"
              />
            ) : (
              <div className="inline-flex items-center justify-center size-20 border-2 border-foreground rounded-md bg-muted text-muted-foreground shrink-0">
                {isImage ? <ImageIcon className="size-6" /> : <FileText className="size-6" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-brutal font-medium">
                <CheckCircle2
                  className="size-3.5"
                  style={{ color: "oklch(var(--chart-2) / 1)" }}
                />
                Terunggah
              </div>
              <div className="mt-1 text-sm truncate">{info.fileName}</div>
              <div className="mt-1 text-[10px] uppercase tracking-brutal text-muted-foreground">
                {info.fileType} · {formatSize(info.fileSize)}
              </div>
              {info.converted && info.originalSize !== info.fileSize ? (
                <div
                  className="mt-2 inline-flex items-center gap-1.5 border-2 rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-brutal font-medium"
                  style={{
                    borderColor: "oklch(var(--chart-2) / 0.7)",
                    color: "oklch(var(--chart-2) / 1)",
                    backgroundColor: "oklch(var(--chart-2) / 0.12)",
                  }}
                >
                  Asli {describeConversion(info.originalSize, info.fileSize)}
                </div>
              ) : null}
              <div className="mt-1 text-[10px] uppercase tracking-brutal text-muted-foreground font-mono truncate">
                id: {info.storageId}
              </div>
            </div>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center justify-center size-8 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
              aria-label="Upload lagi"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {error && !isUploading && (
        <div className="flex items-start gap-2 border-2 border-destructive rounded-md bg-destructive/10 text-destructive px-3 py-2 text-xs uppercase tracking-brutal-sm">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error.message}</span>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 hover:opacity-70"
            aria-label="Tutup error"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {pending && (
        <CropDialog
          src={pending.src}
          aspect={typeof crop === "object" && crop?.aspect ? crop.aspect : undefined}
          onCancel={cancelCrop}
          onConfirm={confirmCrop}
        />
      )}

      {progressFloating && (
        <FloatingProgress
          phase={phase}
          progress={progress}
          fileName={info?.fileName}
        />
      )}
    </div>
  );
}

function phaseToLabel(phase: string): string {
  return phase === "converting"
    ? "Mengonversi ke WebP…"
    : phase === "uploading"
      ? "Mengunggah…"
      : phase === "saving"
        ? "Menyimpan…"
        : "Memuat…";
}

/** Fixed floating progress card portaled to body. Lives bottom-left to
 *  avoid colliding with sonner toasts at bottom-right. */
export function FloatingProgress({
  phase,
  progress,
  fileName,
}: {
  phase: string;
  progress: number;
  fileName?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  const label = phaseToLabel(phase);
  const isUploading = phase === "uploading";
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[60] w-72 border-2 border-foreground rounded-lg shadow-lg bg-card p-3 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-brutal font-medium">
          <Loader2 className="size-3.5 animate-spin" />
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-brutal tabular-nums text-muted-foreground">
          {progress}%
        </span>
      </div>
      {fileName ? (
        <div className="text-[10px] uppercase tracking-brutal text-muted-foreground truncate font-mono">
          {fileName}
        </div>
      ) : null}
      <div className="h-1.5 border-2 border-foreground rounded-sm overflow-hidden bg-background">
        <div
          className="h-full transition-[width] duration-200"
          style={{
            width: `${isUploading ? progress : phase === "saving" ? 100 : 5}%`,
            backgroundColor: "oklch(var(--chart-2) / 1)",
          }}
        />
      </div>
    </div>,
    document.body,
  );
}

function CropDialog({
  src,
  aspect,
  onCancel,
  onConfirm,
}: {
  src: string;
  aspect?: number;
  onCancel: () => void;
  onConfirm: (crop: PixelCrop) => void;
}) {
  const [crop, setCrop] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [pixelCrop, setPixelCrop] = React.useState<PixelCrop | null>(null);

  return (
    <Dialog open onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Atur potongan gambar</DialogTitle>
          <DialogDescription>
            Geser untuk memindahkan, tarik slider untuk zoom
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-80 sm:h-96 bg-foreground">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect ?? 4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_: unknown, pixel: PixelCrop) => setPixelCrop(pixel)}
            showGrid
            restrictPosition
            objectFit="contain"
          />
        </div>

        <div className="border-b-2 border-foreground px-4 py-3 flex items-center gap-3">
          <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-foreground"
            aria-label="Zoom"
          />
          <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-brutal tabular-nums w-10 text-right">
            {zoom.toFixed(1)}×
          </span>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 border-2 border-foreground rounded-md bg-background px-4 py-2 text-xs uppercase tracking-brutal-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-xs"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!pixelCrop}
            onClick={() => pixelCrop && onConfirm(pixelCrop)}
            className="inline-flex items-center gap-2 border-2 border-foreground rounded-md bg-foreground text-background px-4 py-2 text-xs uppercase tracking-brutal-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <CropIcon className="size-3.5" /> Potong & upload
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
