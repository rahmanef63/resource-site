/**
 * Shared Attachment Menu Component
 * Reusable attachment options for message composition
 * @module shared/communications/composer
 */

"use client"

import React from "react";
import { 
  Image, 
  Camera, 
  FileText, 
  User, 
  BarChart3,
  Edit3,
  MapPin,
  Calendar,
  Link2,
  type LucideIcon
} from "lucide-react";

export type AttachmentType = 
  | 'media' 
  | 'camera' 
  | 'document' 
  | 'contact' 
  | 'poll' 
  | 'drawing'
  | 'location'
  | 'event'
  | 'link';

export interface AttachmentOption {
  type: AttachmentType;
  icon: LucideIcon;
  label: string;
  description?: string;
  color?: string;
}

interface AttachmentMenuProps {
  onSelect: (type: AttachmentType) => void;
  onClose?: () => void;
  /** Which attachment types to show */
  allowedTypes?: AttachmentType[];
  /** Custom attachment options */
  customOptions?: AttachmentOption[];
}

const DEFAULT_ATTACHMENT_OPTIONS: AttachmentOption[] = [
  {
    type: 'media',
    icon: Image,
    label: 'Photos & Videos',
    description: 'Share images and videos',
    color: 'bg-purple-500',
  },
  {
    type: 'camera',
    icon: Camera,
    label: 'Camera',
    description: 'Take a photo or video',
    color: 'bg-pink-500',
  },
  {
    type: 'document',
    icon: FileText,
    label: 'Document',
    description: 'Share files and documents',
    color: 'bg-blue-500',
  },
  {
    type: 'contact',
    icon: User,
    label: 'Member',
    description: 'Share a contact card',
    color: 'bg-teal-500',
  },
  {
    type: 'poll',
    icon: BarChart3,
    label: 'Poll',
    description: 'Create a quick poll',
    color: 'bg-orange-500',
  },
  {
    type: 'drawing',
    icon: Edit3,
    label: 'Drawing',
    description: 'Sketch something',
    color: 'bg-green-500',
  },
  {
    type: 'location',
    icon: MapPin,
    label: 'Location',
    description: 'Share your location',
    color: 'bg-red-500',
  },
  {
    type: 'event',
    icon: Calendar,
    label: 'Event',
    description: 'Create an event',
    color: 'bg-indigo-500',
  },
  {
    type: 'link',
    icon: Link2,
    label: 'Link',
    description: 'Share a link with preview',
    color: 'bg-cyan-500',
  },
];

function AttachmentOptionItem({ 
  option, 
  onClick 
}: { 
  option: AttachmentOption; 
  onClick: () => void;
}) {
  const Icon = option.icon;
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 text-left hover:bg-muted transition-colors rounded-lg"
    >
      <div className={`w-12 h-12 ${option.color || 'bg-accent'} rounded-full flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">{option.label}</div>
        {option.description && (
          <div className="text-sm text-muted-foreground truncate">{option.description}</div>
        )}
      </div>
    </button>
  );
}

export function AttachmentMenu({ 
  onSelect, 
  onClose,
  allowedTypes,
  customOptions,
}: AttachmentMenuProps) {
  const options = customOptions || DEFAULT_ATTACHMENT_OPTIONS;
  
  const filteredOptions = allowedTypes
    ? options.filter(opt => allowedTypes.includes(opt.type))
    : options;

  const handleSelect = (type: AttachmentType) => {
    onSelect(type);
    onClose?.();
  };

  return (
    <div className="w-72 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <div className="p-2 max-h-80 overflow-y-auto">
        {filteredOptions.map((option) => (
          <AttachmentOptionItem
            key={option.type}
            option={option}
            onClick={() => handleSelect(option.type)}
          />
        ))}
      </div>
    </div>
  );
}

export default AttachmentMenu;
