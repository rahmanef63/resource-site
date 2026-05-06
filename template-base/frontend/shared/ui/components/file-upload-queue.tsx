"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  performUpload,
  useUploadMutations,
  validateFile,
  type UploadPhase,
  type UploadResult,
} from "@/shared/lib/use-file-upload";
import { describeConversion } from "@/shared/lib/image-convert";
import { cn } from "@/shared/lib/cn";

type QueueStatus = UploadPhase | "pending";

type QueueItem = {
  id: string;
  file: File;
  status: QueueStatus;
  progress: number;
  error: string | null;
  result: UploadResult | null;
};

type FileUploadQueueProps = {
  uploadedBy: string;
  tenantId: string;
  concurrency?: number;
  accept?: string;
  onItemComplete?: (result: UploadResult) => void;
  onAllComplete?: (results: UploadResult[]) => void;
  className?: string;
  label?: string;
};

const ACCEPT_DEFAULT = "image/jpeg,image/png,image/webp,application/pdf";
const STATUS_ORDER: QueueStatus[] = [
  "pending",
  "converting",
  "uploading",
  "saving",
  "done",
  "error",
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function phaseLabel(status: QueueStatus): string {
  switch (status) {
    case "pending":
      return "Antre";
    case "converting":
      return "Konversi";
    case "uploading":
      return "Upload";
    case "saving":
      return "Simpan";
    case "done":
      return "Selesai";
    case "error":
      return "Gagal";
    default:
      return status;
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Multi-file drag-drop queue. Each file runs through the same pipeline as
 * <FileUpload> (validate → convert-to-webp → upload → saveFile) but with
 * per-item state and bounded concurrency (default 2). Crop is intentionally
 * omitted — queue UX with per-file crop dialogs is painful.
 */
export function FileUploadQueue({
  uploadedBy,
  tenantId,
  concurrency = 2,
  accept = ACCEPT_DEFAULT,
  onItemComplete,
  onAllComplete,
  className,
  label = "Drop banyak file atau klik untuk pilih",
}: FileUploadQueueProps) {
  const mutations = useUploadMutations();
  const [items, setItems] = React.useState<QueueItem[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Refs for async concurrency orchestration — written synchronously,
  // consulted from async callbacks that outlive a single render.
  const itemsRef = React.useRef<QueueItem[]>([]);
  itemsRef.current = items;
  const activeCount = React.useRef(0);
  const inFlight = React.useRef(new Set<string>());
  const onItemCompleteRef = React.useRef(onItemComplete);
  const onAllCompleteRef = React.useRef(onAllComplete);
  onItemCompleteRef.current = onItemComplete;
  onAllCompleteRef.current = onAllComplete;

  const updateItem = React.useCallback((id: string, patch: Partial<QueueItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const processItem = React.useCallback(
    async (id: string) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;

      const msg = validateFile(item.file);
      if (msg) {
        updateItem(id, { status: "error", error: msg });
        toast.error(`${item.file.name}: ${msg}`);
        inFlight.current.delete(id);
        activeCount.current--;
        pumpRef.current();
        return;
      }

      try {
        const result = await performUpload({
          file: item.file,
          uploadedBy,
          tenantId,
          mutations,
          callbacks: {
            onPhase: (phase) => updateItem(id, { status: phase as QueueStatus }),
            onProgress: (p) => updateItem(id, { progress: p }),
          },
        });
        updateItem(id, { status: "done", progress: 100, result });
        onItemCompleteRef.current?.(result);
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        updateItem(id, { status: "error", error: err });
        toast.error(`${item.file.name}: ${err}`);
      } finally {
        inFlight.current.delete(id);
        activeCount.current--;
        pumpRef.current();
      }
    },
    [mutations, tenantId, updateItem, uploadedBy],
  );

  // `pump` is stored in a ref so the finally block in processItem and the
  // effect below can both trigger it without circular useCallback deps.
  const pumpRef = React.useRef<() => void>(() => {});
  pumpRef.current = () => {
    const list = itemsRef.current;
    for (const it of list) {
      if (activeCount.current >= concurrency) break;
      if (it.status !== "pending") continue;
      if (inFlight.current.has(it.id)) continue;
      inFlight.current.add(it.id);
      activeCount.current++;
      void processItem(it.id);
    }
  };

  React.useEffect(() => {
    // Fire onAllComplete once every enqueued file has landed (done or error).
    if (items.length === 0) return;
    const allFinished = items.every((i) => i.status === "done" || i.status === "error");
    if (!allFinished) return;
    const results = items
      .filter((i) => i.result !== null)
      .map((i) => i.result as UploadResult);
    onAllCompleteRef.current?.(results);
  }, [items]);

  const addFiles = React.useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const newItems: QueueItem[] = files.map((f) => ({
        id: randomId(),
        file: f,
        status: "pending",
        progress: 0,
        error: null,
        result: null,
      }));
      setItems((prev) => [...prev, ...newItems]);
      // Kick pump in a microtask — ensures itemsRef picks up new items.
      queueMicrotask(() => pumpRef.current());
    },
    [],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) addFiles(Array.from(files));
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) addFiles(Array.from(files));
  };

  const removeItem = (id: string) => {
    // Allow removing anything not in-flight.
    if (inFlight.current.has(id)) {
      toast.error("Tunggu upload selesai sebelum menghapus");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const retryItem = (id: string) => {
    updateItem(id, { status: "pending", progress: 0, error: null });
    queueMicrotask(() => pumpRef.current());
  };

  const clearDone = () => {
    setItems((prev) => prev.filter((i) => i.status !== "done"));
  };

  const summary = React.useMemo(() => {
    const done = items.filter((i) => i.status === "done").length;
    const failed = items.filter((i) => i.status === "error").length;
    const total = items.length;
    const busy = items.filter(
      (i) => i.status === "converting" || i.status === "uploading" || i.status === "saving",
    ).length;
    const savedBytes = items.reduce((sum, i) => {
      if (!i.result || !i.result.converted) return sum;
      return sum + Math.max(0, i.result.originalSize - i.result.fileSize);
    }, 0);
    return { done, failed, total, busy, savedBytes };
  }, [items]);

  const hasItems = items.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg bg-card px-6 py-8 cursor-pointer transition-colors",
          dragging
            ? "border-foreground bg-accent text-accent-foreground"
            : "border-foreground/60 hover:border-foreground hover:bg-accent/40",
        )}
      >
        <div
          className="inline-flex items-center justify-center size-11 border-2 border-foreground rounded-md bg-background"
          style={{ color: "oklch(var(--chart-1) / 1)" }}
        >
          <Upload className="size-4" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm uppercase tracking-brutal-sm font-medium">{label}</div>
          <div className="text-[10px] uppercase tracking-brutal text-muted-foreground">
            JPG · PNG · WEBP · PDF — maks 10 MB gambar / 50 MB dokumen · {concurrency} paralel
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={onInputChange}
        />
      </label>

      {hasItems && (
        <div className="border-2 border-foreground rounded-lg bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2.5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-brutal font-medium">
              <span className="tabular-nums">
                {summary.done}/{summary.total}
              </span>
              <span className="text-muted-foreground">selesai</span>
              {summary.busy > 0 && (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  · <Loader2 className="size-3 animate-spin" /> {summary.busy} aktif
                </span>
              )}
              {summary.failed > 0 && (
                <span className="inline-flex items-center gap-1.5 text-destructive">
                  · {summary.failed} gagal
                </span>
              )}
              {summary.savedBytes > 0 && (
                <span
                  className="inline-flex items-center gap-1 border-2 rounded-sm px-1.5 ml-2"
                  style={{
                    borderColor: "oklch(var(--chart-2) / 0.7)",
                    color: "oklch(var(--chart-2) / 1)",
                    backgroundColor: "oklch(var(--chart-2) / 0.12)",
                  }}
                >
                  Hemat {formatSize(summary.savedBytes)}
                </span>
              )}
            </div>
            {summary.done > 0 && (
              <button
                type="button"
                onClick={clearDone}
                className="text-[10px] uppercase tracking-brutal text-muted-foreground hover:text-foreground transition-colors"
              >
                Bersihkan selesai
              </button>
            )}
          </div>
          <ul className="divide-y-2 divide-foreground/10 max-h-80 overflow-y-auto">
            {items
              .slice()
              .sort(
                (a, b) =>
                  STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
              )
              .map((i) => (
                <QueueRow key={i.id} item={i} onRemove={removeItem} onRetry={retryItem} />
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function QueueRow({
  item,
  onRemove,
  onRetry,
}: {
  item: QueueItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const isImage = item.file.type.startsWith("image/");
  const isUploading =
    item.status === "converting" || item.status === "uploading" || item.status === "saving";
  const isDone = item.status === "done";
  const isError = item.status === "error";

  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <span
        className={cn(
          "inline-flex items-center justify-center size-9 border-2 border-foreground rounded-md shrink-0",
          isDone
            ? "bg-background"
            : isError
              ? "bg-destructive/10 text-destructive border-destructive"
              : "bg-muted text-muted-foreground",
        )}
      >
        {isDone ? (
          <CheckCircle2
            className="size-4"
            style={{ color: "oklch(var(--chart-2) / 1)" }}
          />
        ) : isError ? (
          <AlertCircle className="size-4" />
        ) : isImage ? (
          <ImageIcon className="size-4" />
        ) : (
          <FileText className="size-4" />
        )}
      </span>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium truncate" title={item.file.name}>
            {item.file.name}
          </span>
          <span className="text-[10px] uppercase tracking-brutal text-muted-foreground tabular-nums shrink-0">
            {formatSize(item.file.size)}
          </span>
        </div>
        {isUploading ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 border-2 border-foreground rounded-sm overflow-hidden bg-background">
              <div
                className="h-full transition-[width] duration-200"
                style={{
                  width: `${item.status === "uploading" ? item.progress : item.status === "saving" ? 100 : 5}%`,
                  backgroundColor: "oklch(var(--chart-2) / 1)",
                }}
              />
            </div>
            <span className="text-[10px] uppercase tracking-brutal text-muted-foreground tabular-nums w-20 text-right">
              {phaseLabel(item.status)} {item.status === "uploading" ? `${item.progress}%` : ""}
            </span>
          </div>
        ) : isDone && item.result ? (
          <div className="text-[10px] uppercase tracking-brutal text-muted-foreground">
            {item.result.fileType} · {formatSize(item.result.fileSize)}
            {item.result.converted && item.result.originalSize !== item.result.fileSize ? (
              <span
                className="ml-2 inline-block"
                style={{ color: "oklch(var(--chart-2) / 1)" }}
              >
                Asli {describeConversion(item.result.originalSize, item.result.fileSize)}
              </span>
            ) : null}
          </div>
        ) : isError ? (
          <div className="text-[10px] uppercase tracking-brutal text-destructive truncate">
            {item.error}
          </div>
        ) : (
          <div className="text-[10px] uppercase tracking-brutal text-muted-foreground">
            {phaseLabel(item.status)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isError && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            title="Coba lagi"
            className="inline-flex items-center justify-center size-7 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
          >
            <RotateCcw className="size-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={isUploading}
          title="Hapus dari antrean"
          className="inline-flex items-center justify-center size-7 border-2 border-foreground rounded-md hover:bg-destructive hover:border-destructive hover:text-destructive-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
        </button>
      </div>
    </li>
  );
}
