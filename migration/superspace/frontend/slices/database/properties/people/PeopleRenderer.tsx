import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export const PeopleRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  // Handle array or single person
  const people = Array.isArray(value) ? value : [value];

  return (
    <div className="flex -space-x-2">
      {people.slice(0, 3).map((person, index) => {
        const personData = typeof person === 'object' && person !== null ? person : { name: String(person) };
        const name = 'name' in personData ? String(personData.name) : 'User';
        const initials = name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <Avatar key={index} className="h-6 w-6 border-2 border-background">
            {'avatar' in personData && personData.avatar ? (
              <AvatarImage src={String(personData.avatar)} alt={name} />
            ) : null}
            <AvatarFallback className="text-xs">{initials || <User className="h-3 w-3" />}</AvatarFallback>
          </Avatar>
        );
      })}
      {people.length > 3 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs border-2 border-background">
          +{people.length - 3}
        </div>
      )}
    </div>
  );
};
