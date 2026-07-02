'use client';

import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Paperclip, Download, FileImage, FileText, File as FileIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FileData {
  name: string;
  url?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

export const FilesRenderer: React.FC<PropertyRendererProps> = ({ value, readOnly }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">No files</span>;
  }

  // Handle array of files or single file
  const files = Array.isArray(value) ? value : [value];

  if (files.length === 0) {
    return <span className="text-muted-foreground italic">No files</span>;
  }

  const getFileIcon = (fileName: string, fileType?: string) => {
    if (fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)) {
      return <FileImage className="h-3 w-3" />;
    }
    if (fileType?.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FileText className="h-3 w-3" />;
    }
    return <FileIcon className="h-3 w-3" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const parseFile = (file: any): FileData => {
    if (typeof file === 'string') {
      return { name: file };
    }
    return {
      name: file.name || 'unnamed',
      url: file.url,
      size: file.size,
      type: file.type,
      uploadedAt: file.uploadedAt
    };
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      {files.map((file, index) => {
        const fileData = parseFile(file);
        
        return (
          <Badge 
            key={index} 
            variant="outline" 
            className="font-normal gap-1 pr-1 max-w-[200px]"
          >
            {getFileIcon(fileData.name, fileData.type)}
            <span className="truncate" title={fileData.name}>
              {fileData.name}
            </span>
            {fileData.size && (
              <span className="text-[10px] text-muted-foreground">
                ({formatFileSize(fileData.size)})
              </span>
            )}
            {fileData.url && !readOnly && (
              <Button aria-label="Download"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileData.url) {
                    window.open(fileData.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <Download className="h-2.5 w-2.5" />
              </Button>
            )}
          </Badge>
        );
      })}
    </div>
  );
};
