export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  outputFormat?: 'jpeg' | 'png' | 'webp';
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeMB = 2,
    outputFormat = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const sizeMB = blob.size / 1024 / 1024;
          if (sizeMB > maxSizeMB && quality > 0.1) {
            const newQuality = Math.max(0.1, quality - 0.1);
            compressImage(file, { ...options, quality: newQuality }).then(resolve).catch(reject);
          } else {
            resolve(blob);
          }
        },
        `image/${outputFormat}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    reader.readAsDataURL(file);
  });
}

export async function optimizeImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{ file: File; preview: string; metadata: ImageMetadata }> {
  const compressed = await compressImage(file, options);
  
  const compressedFile = new File([compressed], file.name, {
    type: compressed.type,
    lastModified: Date.now(),
  });

  const preview = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(compressed);
  });

  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = preview;
  });

  return {
    file: compressedFile,
    preview,
    metadata: {
      width: img.width,
      height: img.height,
      size: compressed.size,
      type: compressed.type,
      originalSize: file.size,
      compressionRatio: Math.round((1 - compressed.size / file.size) * 100),
    },
  };
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  type: string;
  originalSize: number;
  compressionRatio: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}
