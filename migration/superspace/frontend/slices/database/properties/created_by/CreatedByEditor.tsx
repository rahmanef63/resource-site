import React from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export const CreatedByEditor: React.FC<PropertyEditorProps> = ({ value }) => {
  // Created by is auto-generated, not editable
  
  if (!value) {
    return (
      <div className="text-sm text-muted-foreground italic p-2">
        Creator will be set automatically when record is created
      </div>
    );
  }

  const userData = typeof value === 'object' && value !== null ? value : { name: String(value) };
  const name = 'name' in userData ? String(userData.name) : 'User';
  const email = 'email' in userData ? String(userData.email) : '';
  const avatar = 'avatar' in userData ? String(userData.avatar) : '';
  const userId = 'id' in userData ? String(userData.id) : '';
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-3 p-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {avatar && <AvatarImage src={avatar} alt={name} />}
          <AvatarFallback className="text-sm">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          {email && <span className="text-xs text-muted-foreground">{email}</span>}
          {userId && <span className="text-xs text-muted-foreground">ID: {userId}</span>}
        </div>
      </div>
      <div className="text-xs text-muted-foreground italic">
        Creator is auto-generated and cannot be edited
      </div>
    </div>
  );
};
