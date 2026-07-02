/**
 * UniversalGalleryView Component
 * 
 * A comprehensive gallery view for the Universal Database system that supports:
 * - Card-based layout with image previews
 * - Multiple card sizes (small, medium, large)
 * - Grid and masonry layouts
 * - Image from files property or URL property
 * - Property display on cards
 * - Filtering and sorting
 * - Responsive columns
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.7
 */

import React, { useMemo, useState } from 'react';
import { Grid, List as ListIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
// @ts-ignore - Module resolution issue workaround
import { GalleryCard } from './gallery-card';
import { cn } from '@/lib/utils';
import type { PropertyRowData, PropertyColumnConfig } from './table-columns';
import { matchesRecordSearch } from './search-utils';

export type GalleryCardSize = 'small' | 'medium' | 'large';
export type GalleryLayout = 'grid' | 'masonry';

export interface UniversalGalleryViewProps {
  /** Array of records to display */
  records: PropertyRowData[];
  
  /** Array of properties for the records */
  properties: PropertyColumnConfig[];
  
  /** Property key for cover image (files or url type) */
  coverImageProperty?: string;
  
  /** Properties to display on cards */
  visibleProperties?: string[];
  
  /** Card size */
  cardSize?: GalleryCardSize;
  
  /** Layout type */
  layout?: GalleryLayout;
  
  /** Callback when a record is clicked */
  onRecordClick?: (record: PropertyRowData) => void;
  
  /** Optional CSS class name */
  className?: string;
}

export const UniversalGalleryView: React.FC<UniversalGalleryViewProps> = ({
  records,
  properties,
  coverImageProperty,
  visibleProperties,
  cardSize: initialCardSize = 'medium',
  layout: initialLayout = 'grid',
  onRecordClick,
  className,
}) => {
  const [cardSize, setCardSize] = useState<GalleryCardSize>(initialCardSize);
  const [layout, setLayout] = useState<GalleryLayout>(initialLayout);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoverProperty, setSelectedCoverProperty] = useState<string>(coverImageProperty || '');

  // Find potential cover image properties (files and url types)
  const imageProperties = useMemo(() => {
    return properties.filter(prop => 
      prop.type === 'files' || 
      prop.type === 'url'
    );
  }, [properties]);

  // Auto-select first image property if none selected
  React.useEffect(() => {
    if (!selectedCoverProperty && imageProperties.length > 0) {
      setSelectedCoverProperty(imageProperties[0].key);
    }
  }, [selectedCoverProperty, imageProperties]);

  // Get properties to display on cards
  const displayProperties = useMemo(() => {
    if (visibleProperties && visibleProperties.length > 0) {
      return properties.filter(prop => visibleProperties.includes(prop.key));
    }
    // Default: show first 3-4 interesting properties
    return properties
      .filter(prop => 
        prop.type !== 'files' && 
        prop.key !== selectedCoverProperty &&
        prop.visible !== false
      )
      .slice(0, 4);
  }, [properties, visibleProperties, selectedCoverProperty]);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;

    return records.filter(record => matchesRecordSearch(record, searchQuery));
  }, [records, searchQuery]);

  // Get cover image URL for a record
  const getCoverImage = (record: PropertyRowData): string | undefined => {
    if (!selectedCoverProperty) return undefined;

    const value = record.properties?.[selectedCoverProperty];
    
    // Handle URL property
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      return value;
    }

    // Handle files property (array of file objects)
    if (Array.isArray(value) && value.length > 0) {
      const firstFile = value[0];
      if (typeof firstFile === 'object' && firstFile !== null && 'url' in firstFile) {
        return firstFile.url as string;
      }
    }

    return undefined;
  };

  // Get record title
  const getRecordTitle = (record: PropertyRowData): string => {
    // Try to find title or name property
    const titleProp = properties.find(p => p.type === 'title');
    if (titleProp) {
      const value = record.properties?.[titleProp.key];
      if (value) return String(value);
    }

    // Fallback to first text property
    const textProp = properties.find(p => p.type === 'rich_text');
    if (textProp) {
      const value = record.properties?.[textProp.key];
      if (value) return String(value);
    }

    return (record as any).name || record.id || 'Untitled';
  };

  // Calculate grid columns based on card size
  const gridColumns = useMemo(() => {
    switch (cardSize) {
      case 'small': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      case 'medium': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 'large': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
    }
  }, [cardSize]);

  if (filteredRecords.length === 0 && !searchQuery) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-2">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              No records to display. Add some records to see them in gallery view.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-2xl">Gallery</CardTitle>
          <div className="flex items-center gap-2">
            {/* Search */}
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px]"
            />

            {/* Cover image selector */}
            {imageProperties.length > 1 && (
              <Select value={selectedCoverProperty} onValueChange={setSelectedCoverProperty}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Cover image" />
                </SelectTrigger>
                <SelectContent>
                  {imageProperties.map(prop => (
                    <SelectItem key={prop.key} value={prop.key}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Card size selector */}
            <Select value={cardSize} onValueChange={(value) => setCardSize(value as GalleryCardSize)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>

            {/* Layout toggle */}
            <div className="flex items-center border rounded-md">
              <Button aria-label="Grid view"
                variant={layout === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setLayout('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button aria-label="List view"
                variant={layout === 'masonry' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setLayout('masonry')}
                className="rounded-l-none"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No records match your search.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className={cn(
              'grid gap-4',
              layout === 'grid' && gridColumns,
              layout === 'masonry' && 'columns-1 sm:columns-2 md:columns-3 lg:columns-4'
            )}>
              {filteredRecords.map(record => (
                <GalleryCard
                  key={record.id}
                  record={record}
                  title={getRecordTitle(record)}
                  coverImage={getCoverImage(record)}
                  properties={displayProperties}
                  cardSize={cardSize}
                  onClick={() => onRecordClick?.(record)}
                  className={layout === 'masonry' ? 'break-inside-avoid mb-4' : ''}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalGalleryView;
