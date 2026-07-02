import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ZoomIn, ZoomOut, RotateCw, Loader2, Info } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { useImageUpload } from "../hooks/useImageUpload";
import { formatFileSize } from "../utils/imageCompression";

interface ImageEditorProps {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImageEditor({
  value,
  onChange,
  aspectRatio,
  maxWidth = 1200,
  maxHeight = 1200,
}: ImageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempImage, setTempImage] = useState("");
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress, error, metadata } = useImageUpload();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target?.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const publicUrl = await upload(selectedFile, {
        maxWidth,
        maxHeight,
        quality: 0.85,
        maxSizeMB: 2,
        outputFormat: 'jpeg',
      });

      onChange(publicUrl);
      setIsEditing(false);
      setScale(1);
      setRotation(0);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }, [selectedFile, upload, maxWidth, maxHeight, onChange]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setTempImage("");
    setScale(1);
    setRotation(0);
    setSelectedFile(null);
  }, []);

  return (
    <div className="space-y-2">
      {/* @dod:skip-primitive reason="ImageEditor pipes selected File into scale/rotation crop preview state before upload; FileUpload's auto-WebP-convert would bypass the editor preview" */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="relative h-48 border rounded-lg overflow-hidden group">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <Button aria-label="Close"
              size="sm"
              variant="danger"
              onClick={() => onChange("")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-foreground/60"
        >
          <Upload className="w-8 h-8" />
          <p className="text-sm">Click to upload image</p>
        </button>
      )}

      <Modal
        isOpen={isEditing}
        onClose={handleCancel}
        title="Edit Image"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[400px]">
            {tempImage ? (
              <Image
                src={tempImage}
                alt="Edit preview"
                width={metadata?.width ?? 800}
                height={metadata?.height ?? 400}
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s",
                  maxWidth: "100%",
                  maxHeight: "400px",
                }}
                sizes="100vw"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            {metadata && (
              <div className="flex items-center gap-2 text-sm text-foreground/60 bg-muted p-2 rounded">
                <Info className="w-4 h-4" />
                <span>
                  {metadata.width}×{metadata.height} •
                  {formatFileSize(metadata.originalSize)} → {formatFileSize(metadata.size)} •
                  {metadata.compressionRatio}% smaller
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-4 justify-center">
              <Button aria-label="Zoom out"
                size="sm"
                variant="ghost"
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                disabled={isUploading}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <Button aria-label="Zoom in"
                size="sm"
                variant="ghost"
                onClick={() => setScale(Math.min(2, scale + 0.1))}
                disabled={isUploading}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="border-l h-6 mx-2" />
              <Button aria-label="Refresh"
                size="sm"
                variant="ghost"
                onClick={() => setRotation((rotation + 90) % 360)}
                disabled={isUploading}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {isUploading && progress && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={handleCancel} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
