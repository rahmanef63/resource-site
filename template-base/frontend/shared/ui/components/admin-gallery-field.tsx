"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImageIcon,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  performUpload,
  useUploadMutations,
  validateFile,
  type UploadResult,
} from "@/shared/lib/use-file-upload";
import { describeConversion } from "@/shared/lib/image-convert";
import { useAuth } from "@/shared/lib/auth-context";
import { cn } from "@/shared/lib/cn";

type Props = {
  value: string[] | undefined | null;
  onChange: (next: string[]) => void;
  className?: string;
};

const TENANT_ID = "admin";
const ACCEPT = "image/jpeg,image/png,image/webp";

/**
 * Multi-image field for AdminCrud gallery type. Stores an ordered string[]
 * of resolved URLs. Appends via drag-drop (multiple files at once), removes
 * via X per thumbnail, reorders via up/down arrows. Uses performUpload so
 * each file gets the same WebP conversion pipeline as single FileUpload.
 */
export function AdminGalleryField({ value, onChange, className }: Props) {
  const { user } = useAuth();
  const uploader = user?.email ?? "anonymous";
  const mutations = useUploadMutations();

  const [busyCount, setBusyCount] = React.useState(0);
  const [pendingIds, setPendingIds] = React.useState<string[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const gallery = value ?? [];

  // Resolve any pending storageIds to URLs, append to gallery when ready.
  const lastPending = pendingIds[pendingIds.length - 1] ?? null;
  const resolved = useQuery(
    (api as any).slices.files.getFileUrl,
    lastPending
      ? { storageId: lastPending, requestingUser: uploader, tenantId: TENANT_ID }
      : "skip",
  ) as string | null | undefined;

  React.useEffect(() => {
    if (resolved && lastPending) {
      onChange([...gallery, resolved]);
      setPendingIds((ids) => ids.slice(0, -1));
    }
  }, [resolved, lastPending]); // eslint-disable-line react-hooks/exhaustive-deps

  const processFile = async (file: File) => {
    const msg = validateFile(file);
    if (msg) {
      toast.error(`${file.name}: ${msg}`);
      return;
    }
    setBusyCount((c) => c + 1);
    try {
      const result: UploadResult = await performUpload({
        file,
        uploadedBy: uploader,
        tenantId: TENANT_ID,
        mutations,
      });
      if (result.converted) {
        toast.success(
          `${result.fileName} — ${describeConversion(result.originalSize, result.fileSize)}`,
        );
      }
      setPendingIds((ids) => [...ids, result.storageId]);
    } catch (e) {
      toast.error(`${file.name}: ${(e as Error).message}`);
    } finally {
      setBusyCount((c) => c - 1);
    }
  };

  const addFiles = (files: File[]) => {
    for (const f of files) void processFile(f);
  };

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

  const removeAt = (i: number) => {
    const next = gallery.slice();
    next.splice(i, 1);
    onChange(next);
  };

  const move = (i: number, direction: -1 | 1) => {
    const next = gallery.slice();
    const target = i + direction;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const busy = busyCount > 0 || pendingIds.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {gallery.length > 0 && (
        <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
          {gallery.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="group relative border-2 border-foreground rounded-md bg-muted aspect-square overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Galeri ${i + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                className="w-full h-full object-cover"
              />
              <span
                aria-hidden
                className="absolute top-1 left-1 inline-flex items-center gap-1 border-2 border-foreground rounded-sm bg-background/90 backdrop-blur px-1.5 py-0.5 text-[9px] uppercase tracking-brutal font-medium tabular-nums"
              >
                <GripVertical className="size-2.5" />
                {i + 1}
              </span>
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Naik"
                    className="inline-flex items-center justify-center size-6 border-2 border-foreground rounded-sm bg-background hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowUp className="size-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === gallery.length - 1}
                    title="Turun"
                    className="inline-flex items-center justify-center size-6 border-2 border-foreground rounded-sm bg-background hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowDown className="size-2.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  title="Hapus"
                  className="inline-flex items-center justify-center size-6 border-2 border-destructive text-destructive rounded-sm bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            </div>
          ))}
          {busy &&
            Array.from({ length: busyCount + pendingIds.length }).map((_, i) => (
              <div
                key={`busy-${i}`}
                className="border-2 border-foreground rounded-md bg-muted aspect-square overflow-hidden flex items-center justify-center animate-pulse"
              >
                <ImageIcon className="size-5 text-muted-foreground" />
              </div>
            ))}
        </div>
      )}

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
        )}
      >
        <div className="inline-flex items-center gap-2">
          {gallery.length === 0 ? (
            <Upload className="size-4" style={{ color: "oklch(var(--chart-1) / 1)" }} />
          ) : (
            <Plus className="size-4" style={{ color: "oklch(var(--chart-2) / 1)" }} />
          )}
          <span className="text-[11px] uppercase tracking-brutal-sm font-medium">
            {gallery.length === 0 ? "Drop gambar atau klik" : "Tambah lagi"}
          </span>
        </div>
        <div className="text-[9px] uppercase tracking-brutal text-muted-foreground">
          JPG · PNG · WEBP — boleh banyak sekaligus
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={onInputChange}
        />
      </label>
    </div>
  );
}
