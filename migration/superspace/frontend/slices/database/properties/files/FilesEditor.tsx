'use client';

import React, { useState, useRef } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, FileImage, FileText, File as FileIcon } from 'lucide-react';

interface FileData {
  name: string;
  url?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

interface FilesOptions {
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[]; // ['image/*', 'application/pdf', etc.]
}

export const FilesEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property }) => {
  const [files, setFiles] = useState<FileData[]>(() => {
    if (!value) return [];
    const valueArray = Array.isArray(value) ? value : [value];
    return valueArray.map(f => 
      typeof f === 'string' ? { name: f } : f as FileData
    );
  });
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const options = property.options as FilesOptions || {};
  const maxFiles = options.maxFiles || 10;
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  const acceptedTypes = options.acceptedTypes || ['*/*'];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError('');

    // Check max files
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: FileData[] = [];

    for (const file of selectedFiles) {
      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`);
        continue;
      }

      // Check file type
      if (acceptedTypes[0] !== '*/*') {
        const fileType = file.type;
        const isAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          setError(`File type "${file.type}" not accepted`);
          continue;
        }
      }

      // In a real implementation, you would upload the file here
      // For now, we'll create a local URL
      const fileData: FileData = {
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };

      newFiles.push(fileData);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles.length > 0 ? updatedFiles : null);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange(updatedFiles.length > 0 ? updatedFiles : null);
  };

  const getFileIcon = (fileName: string, fileType?: string) => {
    if (fileType?.startsWith('image/')) {
      return <FileImage className="h-3 w-3" />;
    }
    if (fileType?.includes('pdf')) {
      return <FileText className="h-3 w-3" />;
    }
    return <FileIcon className="h-3 w-3" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-2">
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={acceptedTypes.join(',')}
        multiple
        className="hidden"
        id="file-upload"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full justify-start text-left font-normal px-2 text-sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={files.length >= maxFiles}
      >
        <Upload className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">
          {files.length > 0 
            ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
            : 'Choose Files'
          }
        </span>
      </Button>

      {error && (
        <p className="text-xs text-destructive px-2">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 p-1.5 rounded border bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <span className="flex-shrink-0">
                {getFileIcon(file.name, file.type)}
              </span>
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-xs truncate" title={file.name}>
                  {file.name}
                </span>
                {file.size && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                )}
              </div>
              <Button aria-label="Close"
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
