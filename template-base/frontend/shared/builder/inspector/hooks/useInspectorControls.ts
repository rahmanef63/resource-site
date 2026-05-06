import { useMemo } from 'react';
import { inspectorConfig } from '../config/inspectorConfig';
import { InspectorControl } from '../types/InspectorTypes';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';

export function useInspectorControls(widgetType: string) {
  const registry = useCrossFeatureRegistry();
  
  return useMemo(() => {
    const widget = registry.getWidget(widgetType);
    
    if (!widget) {
      return [];
    }

    const widgetWithPreset = widget as typeof widget & { inspectorPreset?: string };
    const presetKey = widgetWithPreset.inspectorPreset;

    // If widget has a preset defined, use it
    if (presetKey) {
      const preset = inspectorConfig.presets[presetKey];
      
      if (preset) {
        const controls: InspectorControl[] = [];
        
        // Get all control keys from extended groups
        preset.extends.forEach(groupName => {
          const group = inspectorConfig.library.groups[groupName];
          if (group) {
            group.forEach(controlKey => {
              const control = inspectorConfig.library.controls[controlKey];
              if (control) {
                controls.push(control);
              }
            });
          }
        });

        return controls;
      }
    }

    // Fallback to legacy inspectorFields if no preset
    return [];
  }, [widgetType, registry]);
}

export function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}
