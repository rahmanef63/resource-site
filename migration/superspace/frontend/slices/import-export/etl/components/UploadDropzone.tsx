"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
};

export function UploadDropzone({ onFileSelect, isLoading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      toast.error("Hanya file .xlsx yang didukung.");
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file Excel"
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); !isLoading && inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-2xl p-10 cursor-pointer
          transition-all duration-200
          ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}
          ${isLoading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm">Drop file Excel di sini</p>
          <p className="text-xs text-muted-foreground mt-1">
            atau klik untuk pilih file (.xlsx)
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          Format: NEW LAP [tanggal] JAN 2026.xlsx
        </p>
        {/* @dod:skip-primitive reason="ETL drag-drop parses locally with xlsx; no Convex storage upload — FileUpload helper doesn't apply." */}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
          <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
          </div>
          {!isLoading && (
            <button aria-label="Close"
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
