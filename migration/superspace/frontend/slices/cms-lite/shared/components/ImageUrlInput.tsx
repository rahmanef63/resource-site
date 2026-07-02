import { useState } from "react";
import Image from "next/image";
import { Input } from "./Form";
import { Button } from "./Button";
import { Upload, Loader } from "lucide-react";
import { useImageUpload } from "../hooks/useImageUpload";
import { toast } from "@/hooks/use-toast";

interface ImageUrlInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUrlInput({
  label,
  value,
  onChange,
  placeholder,
  className,
}: ImageUrlInputProps) {
  const { upload, isUploading } = useImageUpload();
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = await upload(file);
      onChange(url);
      toast({ title: "Image uploaded successfully" });
      setFileInputKey((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Failed to upload image",
        description: message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
        <div className="relative">
          {/* @dod:skip-primitive reason="ImageUrlInput overlays a transparent file input atop the URL Input field to allow inline upload-or-paste; FileUpload renders a full dropzone that does not fit this inline pattern" */}
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isUploading}
            className="pointer-events-none"
          >
            {isUploading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
      {value && (
        <div className="mt-2">
          <Image
            src={value}
            alt="Preview"
            width={80}
            height={80}
            className="h-20 w-20 object-cover rounded border"
            sizes="80px"
          />
        </div>
      )}
    </div>
  );
}
