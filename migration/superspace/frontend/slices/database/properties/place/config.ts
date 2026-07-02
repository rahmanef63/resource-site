import { MapPin } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { PlaceRenderer } from './PlaceRenderer';
import { PlaceEditor } from './PlaceEditor';

export const placePropertyConfig: PropertyConfig = {
  // Identification
  type: 'place',
  label: 'Place',
  description: 'Location with address and coordinates',
  icon: MapPin,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: PlaceRenderer,
  Editor: PlaceEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    
    if (typeof value === 'string') {
      return null; // String addresses are valid
    }
    
    if (typeof value === 'object') {
      // If object, validate coordinates if present
      if ('lat' in value && 'lng' in value) {
        const lat = Number(value.lat);
        const lng = Number(value.lng);
        
        if (isNaN(lat) || lat < -90 || lat > 90) {
          return 'Latitude must be between -90 and 90';
        }
        
        if (isNaN(lng) || lng < -180 || lng > 180) {
          return 'Longitude must be between -180 and 180';
        }
      }
      return null;
    }
    
    return 'Place must be text or object';
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && 'address' in value) {
      return String(value.address);
    }
    return String(value);
  },

  // Metadata
  category: 'extended',
  version: '2.0',
  tags: ['place', 'location', 'address', 'coordinates', 'maps'],
};


export default placePropertyConfig;
