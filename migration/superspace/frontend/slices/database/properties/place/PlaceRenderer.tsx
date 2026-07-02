import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { MapPin } from 'lucide-react';

export const PlaceRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">No location</span>;
  }

  // Handle object with address or plain string
  const placeData = typeof value === 'object' && value !== null ? value : { address: String(value) };
  const address = 'address' in placeData ? String(placeData.address) : String(value);
  
  // Build Google Maps URL if we have coordinates
  const mapsUrl = 'lat' in placeData && 'lng' in placeData
    ? `https://www.google.com/maps?q=${placeData.lat},${placeData.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      <MapPin className="h-3 w-3" />
      <span className="text-sm">{address}</span>
    </a>
  );
};
