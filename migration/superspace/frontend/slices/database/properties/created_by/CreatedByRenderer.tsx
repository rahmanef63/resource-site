import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export const CreatedByRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Unknown</span>;
  }

  const userData = typeof value === 'object' && value !== null ? value : { name: String(value) };
  const name = 'name' in userData ? String(userData.name) : 'User';
  const email = 'email' in userData ? String(userData.email) : '';
  const avatar = 'avatar' in userData ? String(userData.avatar) : '';
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        {avatar && <AvatarImage src={avatar} alt={name} />}
        <AvatarFallback className="text-xs">
          {initials || <User className="h-3 w-3" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        {email && <span className="text-xs text-muted-foreground">{email}</span>}
      </div>
    </div>
  );
};
