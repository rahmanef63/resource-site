'use client';

import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Link2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RelationData {
  id: string;
  title?: string;
  [key: string]: any;
}

export const RelationRenderer: React.FC<PropertyRendererProps> = ({ value, property, readOnly }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">No relations</span>;
  }

  // Handle array of relations or single relation
  const relations = Array.isArray(value) ? value : [value];

  if (relations.length === 0) {
    return <span className="text-muted-foreground italic">No relations</span>;
  }

  const parseRelation = (rel: any): RelationData => {
    if (typeof rel === 'string') {
      return { id: rel, title: rel };
    }
    if (typeof rel === 'object' && rel !== null) {
      return {
        id: rel.id || rel._id || String(rel),
        title: rel.title || rel.name || rel.id || rel._id,
        ...rel
      };
    }
    return { id: String(rel), title: String(rel) };
  };

  const handleOpenRelation = (relationId: string) => {
    // In a real implementation, this would navigate to the related record
    // Example: router.push(`/database/record/${relationId}`);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Link2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      {relations.map((relation, index) => {
        const relationData = parseRelation(relation);
        
        return (
          <Badge 
            key={index} 
            variant="secondary" 
            className="font-normal gap-1 pr-0.5 max-w-[200px] hover:bg-secondary/80 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) {
                handleOpenRelation(relationData.id);
              }
            }}
          >
            <span className="truncate" title={relationData.title}>
              {relationData.title}
            </span>
            {!readOnly && (
              <Button aria-label="Open in new tab"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenRelation(relationData.id);
                }}
              >
                <ExternalLink className="h-2.5 w-2.5" />
              </Button>
            )}
          </Badge>
        );
      })}
    </div>
  );
};
