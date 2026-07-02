import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const PlaceEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  const placeData = typeof value === 'object' && value !== null ? value : {};
  const [address, setAddress] = useState('address' in placeData ? String(placeData.address) : String(value || ''));
  const [lat, setLat] = useState('lat' in placeData ? String(placeData.lat) : '');
  const [lng, setLng] = useState('lng' in placeData ? String(placeData.lng) : '');

  useEffect(() => {
    if (typeof value === 'object' && value !== null) {
      setAddress('address' in value ? String(value.address) : '');
      setLat('lat' in value ? String(value.lat) : '');
      setLng('lng' in value ? String(value.lng) : '');
    } else {
      setAddress(value ? String(value) : '');
      setLat('');
      setLng('');
    }
  }, [value]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    if (!newAddress && !lat && !lng) {
      onChange(null);
    } else {
      onChange({
        address: newAddress,
        ...(lat && { lat: parseFloat(lat) }),
        ...(lng && { lng: parseFloat(lng) }),
      });
    }
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLat = e.target.value;
    setLat(newLat);
    
    if (address || newLat || lng) {
      onChange({
        address,
        ...(newLat && { lat: parseFloat(newLat) }),
        ...(lng && { lng: parseFloat(lng) }),
      });
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLng = e.target.value;
    setLng(newLng);
    
    if (address || lat || newLng) {
      onChange({
        address,
        ...(lat && { lat: parseFloat(lat) }),
        ...(newLng && { lng: parseFloat(newLng) }),
      });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-muted-foreground">Address</Label>
        <Input
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter address..."
          className="w-full mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Latitude</Label>
          <Input
            type="number"
            step="any"
            value={lat}
            onChange={handleLatChange}
            placeholder="40.7128"
            className="w-full mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Longitude</Label>
          <Input
            type="number"
            step="any"
            value={lng}
            onChange={handleLngChange}
            placeholder="-74.0060"
            className="w-full mt-1"
          />
        </div>
      </div>
    </div>
  );
};
