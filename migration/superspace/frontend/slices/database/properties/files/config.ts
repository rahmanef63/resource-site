import { Paperclip } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { FilesRenderer } from './FilesRenderer';
import { FilesEditor } from './FilesEditor';

export const filesPropertyConfig: PropertyConfig = {
  // Identification
  type: 'files',
  label: 'Files',
  description: 'File attachments with upload, validation, and preview',
  icon: Paperclip,

  // Capabilities
  supportsOptions: true, // maxFiles, maxSize, acceptedTypes
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: FilesRenderer,
  Editor: FilesEditor,

  // Validation
  validate: (value, options) => {
    if (value === null || value === undefined) return null;
    if (!Array.isArray(value) && typeof value !== 'object') {
      return 'Files must be an array or object';
    }
    
    const files = Array.isArray(value) ? value : [value];
    const maxFiles = options && 'maxFiles' in options ? Number(options.maxFiles) : 10;
    const maxSize = options && 'maxSize' in options ? Number(options.maxSize) : 10 * 1024 * 1024;
    
    if (files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }
    
    for (const file of files) {
      if (typeof file === 'object' && file !== null && 'size' in file) {
        const size = Number(file.size);
        if (size > maxSize) {
          return `File exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`;
        }
      }
    }
    
    return null;
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    const files = Array.isArray(value) ? value : [value];
    const fileNames = files.map(f => 
      typeof f === 'object' && f !== null && 'name' in f ? f.name : String(f)
    );
    return fileNames.join(', ');
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['files', 'attachments', 'upload', 'media'],
};


export default filesPropertyConfig;
