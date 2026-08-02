import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, Image, Video, FileText } from 'lucide-react';
import { useUploadAsset } from '@/frontend/shared/foundation/hooks/assets';
import { ConvexErrorAlert } from '../error/ConvexErrorAlert';
import { useWorkspaceContext } from '@/frontend/shared/foundation/provider/WorkspaceProvider';

interface FileUploadZoneProps {
  onUploadComplete?: (assetId: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export function FileUploadZone({
  onUploadComplete,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md', '.csv']
  },
  maxSize = 10 * 1024 * 1024,
  multiple = true
}: FileUploadZoneProps) {
  const { currentWorkspace } = useWorkspaceContext();
  const { uploadAsset } = useUploadAsset();
  
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentWorkspace) {
      setError(new Error('No workspace selected'));
      return;
    }

    setError(null);
    const newUploadingFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const fileIndex = uploadingFiles.length + i;

      try {
        const assetId = await uploadAsset(file, currentWorkspace._id);
        setUploadingFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex].progress = 100;
          }
          return updated;
        });

        setTimeout(() => {
          setUploadingFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
        }, 1000);

        onUploadComplete?.(assetId);
      } catch (err) {
        setUploadingFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex].error = (err as Error).message;
          }
          return updated;
        });
      }
    }
  }, [currentWorkspace, uploadAsset, uploadingFiles.length, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (file.type.includes('pdf')) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      {error && (
        <ConvexErrorAlert error={error} onDismiss={() => setError(null)} />
      )}

      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse (max {Math.round(maxSize / 1024 / 1024)}MB per file)
            </p>
          </div>
        </div>
      </Card>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  {getFileIcon(uploadingFile.file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadingFile.error ? (
                    <p className="text-xs text-destructive mt-1">
                      {uploadingFile.error}
                    </p>
                  ) : (
                    <Progress value={uploadingFile.progress} className="mt-2 h-1" />
                  )}
                </div>
                {uploadingFile.progress === 100 && (
                  <div className="text-green-600 text-xs">Complete</div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadingFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
