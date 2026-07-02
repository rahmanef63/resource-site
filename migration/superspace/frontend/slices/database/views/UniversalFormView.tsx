/**
 * UniversalFormView Component
 * 
 * A form view for editing single records in the Universal Database system.
 * Displays properties in a vertical layout with grouped sections.
 * 
 * Features:
 * - Vertical property layout
 * - Property grouping by category
 * - Full property editors (not inline)
 * - Validation display
 * - Save/cancel actions
 * - Read-only mode
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.9
 */

import React, { useState, useMemo } from 'react';
import { Save, X, Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getPropertyConfig } from './table-columns';
import type { PropertyRowData, PropertyColumnConfig } from './table-columns';

export interface UniversalFormViewProps {
  /** The record to display/edit */
  record: PropertyRowData;
  
  /** Array of properties for the record */
  properties: PropertyColumnConfig[];
  
  /** Whether the form is in edit mode */
  isEditing?: boolean;
  
  /** Callback when edit mode is toggled */
  onEditToggle?: (isEditing: boolean) => void;
  
  /** Callback when property value is updated */
  onPropertyUpdate?: (propertyKey: string, value: any) => void;
  
  /** Callback when form is saved */
  onSave?: (record: PropertyRowData) => Promise<void>;
  
  /** Callback when form is cancelled */
  onCancel?: () => void;
  
  /** Show property groups */
  showGroups?: boolean;
  
  /** Optional CSS class name */
  className?: string;
}

interface PropertyGroup {
  name: string;
  properties: PropertyColumnConfig[];
}

export const UniversalFormView: React.FC<UniversalFormViewProps> = ({
  record,
  properties,
  isEditing: externalIsEditing,
  onEditToggle,
  onPropertyUpdate,
  onSave,
  onCancel,
  showGroups = true,
  className,
}) => {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = externalIsEditing ?? internalIsEditing;

  // Group properties by category
  const propertyGroups = useMemo<PropertyGroup[]>(() => {
    if (!showGroups) {
      return [{ name: 'Properties', properties }];
    }

    const groups: Record<string, PropertyColumnConfig[]> = {
      'Basic': [],
      'Dates': [],
      'People': [],
      'Advanced': [],
    };

    properties.forEach(prop => {
      if (prop.type === 'date' || prop.type === 'created_time' || prop.type === 'last_edited_time') {
        groups['Dates'].push(prop);
      } else if (prop.type === 'people' || prop.type === 'created_by' || prop.type === 'last_edited_by') {
        groups['People'].push(prop);
      } else if (prop.type === 'formula' || prop.type === 'rollup' || prop.type === 'relation') {
        groups['Advanced'].push(prop);
      } else {
        groups['Basic'].push(prop);
      }
    });

    return Object.entries(groups)
      .filter(([_, props]) => props.length > 0)
      .map(([name, props]) => ({ name, properties: props }));
  }, [properties, showGroups]);

  // Get title property value
  const recordTitle = useMemo(() => {
    const titleProp = properties.find(p => p.type === 'title');
    if (titleProp) {
      const value = record.properties?.[titleProp.key];
      if (value) return String(value);
    }
    return (record as any).name || 'Untitled';
  }, [record, properties]);

  // Handle edit toggle
  const handleEditToggle = () => {
    const newIsEditing = !isEditing;
    if (onEditToggle) {
      onEditToggle(newIsEditing);
    } else {
      setInternalIsEditing(newIsEditing);
    }
    setErrors({});
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;

    // Validate all properties
    const newErrors: Record<string, string> = {};
    
    properties.forEach(prop => {
      if (prop.required) {
        const value = record.properties?.[prop.key];
        if (value === null || value === undefined || value === '') {
          newErrors[prop.key] = `${prop.name} is required`;
        }
      }

      // Property-specific validation
      const config = getPropertyConfig(prop.type);
      if (config && config.validate) {
        const value = record.properties?.[prop.key];
        const error = config.validate(value, {
          key: prop.key,
          name: prop.name,
          type: prop.type,
        });
        if (error) {
          newErrors[prop.key] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(record);
      handleEditToggle();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleEditToggle();
    setErrors({});
  };

  // Render property value (read-only)
  const renderPropertyValue = (prop: PropertyColumnConfig): React.ReactNode => {
    const value = record.properties?.[prop.key];
    const config = getPropertyConfig(prop.type);

    if (!config || !config.Renderer) {
      return <span className="text-sm">{String(value || '')}</span>;
    }

    const Renderer = config.Renderer;
    return (
      <Renderer 
        value={value} 
        property={{
          key: prop.key,
          name: prop.name,
          type: prop.type,
        }}
        readOnly={true}
      />
    );
  };

  // Render property editor
  const renderPropertyEditor = (prop: PropertyColumnConfig): React.ReactNode => {
    const value = record.properties?.[prop.key];
    const config = getPropertyConfig(prop.type);

    if (!config || !config.Editor) {
      return renderPropertyValue(prop);
    }

    // Auto properties are not editable
    if (config.isAuto) {
      return renderPropertyValue(prop);
    }

    const Editor = config.Editor;
    return (
      <Editor
        value={value}
        onChange={(newValue) => {
          onPropertyUpdate?.(prop.key, newValue);
          // Clear error when value changes
          if (errors[prop.key]) {
            setErrors(prev => {
              const next = { ...prev };
              delete next[prop.key];
              return next;
            });
          }
        }}
        property={{
          key: prop.key,
          name: prop.name,
          type: prop.type,
        }}
      />
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{recordTitle}</CardTitle>
            <CardDescription>
              {isEditing ? 'Editing record' : 'Viewing record'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditToggle}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Please fix the following errors:
              <ul className="list-disc list-inside mt-2">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-8">
            {propertyGroups.map((group, groupIndex) => (
              <div key={group.name}>
                {showGroups && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {group.properties.length}
                      </Badge>
                    </div>
                  </>
                )}

                <div className="space-y-6">
                  {group.properties.map(prop => {
                    const config = getPropertyConfig(prop.type);
                    const isAutoProperty = config?.isAuto || false;

                    return (
                      <div key={prop.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={prop.key} className="text-sm font-medium">
                            {prop.name}
                          </Label>
                          {prop.required && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0">
                              Required
                            </Badge>
                          )}
                          {isAutoProperty && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              Auto
                            </Badge>
                          )}
                        </div>

                        <div className={cn(
                          'min-h-[40px] flex items-center',
                          isEditing && !isAutoProperty && 'border rounded-md p-2'
                        )}>
                          {isEditing && !isAutoProperty ? renderPropertyEditor(prop) : renderPropertyValue(prop)}
                        </div>

                        {errors[prop.key] && (
                          <p className="text-sm text-destructive">{errors[prop.key]}</p>
                        )}

                        {config?.description && !isEditing && (
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {groupIndex < propertyGroups.length - 1 && (
                  <Separator className="my-8" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UniversalFormView;
