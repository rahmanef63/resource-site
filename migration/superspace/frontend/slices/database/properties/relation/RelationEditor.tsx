'use client';

import React, { useState } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface RelationData {
  id: string;
  title?: string;
  [key: string]: any;
}

interface RelationOptions {
  targetDatabase?: string;
  allowMultiple?: boolean;
  allowCreate?: boolean;
}

export const RelationEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property }) => {
  const [relations, setRelations] = useState<RelationData[]>(() => {
    if (!value) return [];
    const valueArray = Array.isArray(value) ? value : [value];
    return valueArray.map(r => 
      typeof r === 'string' ? { id: r, title: r } : r as RelationData
    );
  });
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const options = property.options as RelationOptions || {};
  const allowMultiple = options.allowMultiple !== false; // Default true

  // Mock available relations - in real implementation, fetch from database
  const mockRelations: RelationData[] = [
    { id: '1', title: 'Record 1' },
    { id: '2', title: 'Record 2' },
    { id: '3', title: 'Record 3' },
    { id: '4', title: 'Task Alpha' },
    { id: '5', title: 'Task Beta' },
  ];

  const handleAddRelation = (relation: RelationData) => {
    if (!allowMultiple) {
      setRelations([relation]);
      onChange(relation);
    } else {
      // Check if already added
      if (relations.some(r => r.id === relation.id)) {
        return;
      }
      const updatedRelations = [...relations, relation];
      setRelations(updatedRelations);
      onChange(updatedRelations);
    }
    setSearchInput('');
    setShowSuggestions(false);
  };

  const handleRemoveRelation = (index: number) => {
    const updatedRelations = relations.filter((_, i) => i !== index);
    setRelations(updatedRelations);
    onChange(updatedRelations.length > 0 ? updatedRelations : null);
  };

  const filteredRelations = mockRelations.filter(rel =>
    rel.title?.toLowerCase().includes(searchInput.toLowerCase()) &&
    !relations.some(r => r.id === rel.id)
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1.5 relative">
        <Label className="text-xs text-muted-foreground">
          Linked Records {allowMultiple && `(${relations.length})`}
        </Label>

        <div className="relative">
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search records..."
            disabled={!allowMultiple && relations.length > 0}
            className="pr-8"
          />
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        {showSuggestions && searchInput && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-[200px] overflow-auto">
            {filteredRelations.length > 0 ? (
              filteredRelations.map((relation) => (
                <button
                  key={relation.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => handleAddRelation(relation)}
                >
                  {relation.title}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No records found
              </div>
            )}
          </div>
        )}
      </div>

      {relations.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Selected</Label>
          <div className="flex flex-wrap gap-1">
            {relations.map((relation, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="gap-1 pr-1"
              >
                <span className="max-w-[150px] truncate">
                  {relation.title || relation.id}
                </span>
                <Button aria-label="Close"
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveRelation(index)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground pt-1 border-t">
        {allowMultiple ? 'Multiple records allowed' : 'Single record only'}
        {options.targetDatabase && ` • Links to: ${options.targetDatabase}`}
      </div>
    </div>
  );
};
