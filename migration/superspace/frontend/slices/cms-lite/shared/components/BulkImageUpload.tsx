import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { Button } from './Button';
import { useImageUpload } from '../hooks/useImageUpload';
import { toast } from '@/hooks/use-toast';

export interface UploadedImage {
  url: string;
  file?: File;
  altText?: string;
  caption?: string;
}

interface BulkImageUploadProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  maxImages?: number;
  existingImages?: UploadedImage[];
  onRemoveImage?: (index: number) => void;
}

export function BulkImageUpload({
  onImagesUploaded,
  maxImages = 20,
  existingImages = [],
  onRemoveImage,
}: BulkImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload: uploadImage } = useImageUpload();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        toast({
          title: 'Maximum images reached',
          description: `You can only upload up to ${maxImages} images.`,
          variant: 'destructive',
        });
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      setUploading(true);

      try {
        const uploadedImages: UploadedImage[] = [];

        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          const fileKey = `${file.name}-${i}`;

          setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));

          try {
            const url = await uploadImage(file);

            uploadedImages.push({
              url,
              file,
              altText: file.name.replace(/\.[^/.]+$/, ''),
            });

            setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            toast({
              title: 'Upload failed',
              description: `Failed to upload ${file.name}`,
              variant: 'destructive',
            });
          }
        }

        const newImages = [...images, ...uploadedImages];
        setImages(newImages);
        onImagesUploaded(newImages);

        toast({
          title: 'Upload successful',
          description: `Uploaded ${uploadedImages.length} image(s)`,
        });
      } catch (error) {
        console.error('Bulk upload error:', error);
        toast({
          title: 'Upload failed',
          description: 'An error occurred during upload',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        setUploadProgress({});
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [images, maxImages, uploadImage, onImagesUploaded]
  );

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (onRemoveImage) {
      onRemoveImage(index);
    } else {
      onImagesUploaded(newImages);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fakeEvent = {
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors"
      >
        {/* @dod:skip-primitive reason="cms-lite bulk image uploader has its own drag-drop zone, per-image progress, and maxImages quota distinct from generic FileUpload single-item flow" */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-foreground/40" />
        
        <h3 className="text-lg font-medium mb-2">
          {uploading ? 'Uploading...' : 'Upload Images'}
        </h3>
        
        <p className="text-sm text-foreground/60 mb-4">
          Drag and drop images here or click to browse
        </p>
        
        <p className="text-xs text-foreground/40 mb-4">
          {images.length} / {maxImages} images uploaded
        </p>

        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          isLoading={uploading}
        >
          {uploading ? 'Uploading...' : 'Select Images'}
        </Button>
      </div>

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">{key.split('-')[0]}</span>
                <span className="text-foreground/60">{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border group"
            >
              <Image
                src={image.url}
                alt={image.altText || `Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <button aria-label="Close"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {image.altText || `Image ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
