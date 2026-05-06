import React, { useState } from 'react';
import { Input, Label, Toggle } from '@/components/ui';
import { Lock, MoreHorizontal, Grid2X2 } from 'lucide-react';

interface SpacingControlProps {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  sides?: ('top' | 'right' | 'bottom' | 'left')[];
  lockable?: boolean;
}

type SpacingMode = 'single' | 'double' | 'quad';

export function SpacingControl({ label, value, onChange, sides = ['top', 'right', 'bottom', 'left'], lockable = false }: SpacingControlProps) {
  const [mode, setMode] = useState<SpacingMode>('single');

  const handleSingleChange = (newValue: string) => {
    const newValues = sides.reduce((acc, s) => ({ ...acc, [s]: newValue }), {});
    onChange({ ...value, ...newValues });
  };

  const handleDoubleChange = (axis: 'horizontal' | 'vertical', newValue: string) => {
    if (axis === 'horizontal') {
      onChange({ ...value, left: newValue, right: newValue });
    } else {
      onChange({ ...value, top: newValue, bottom: newValue });
    }
  };

  const handleIndividualChange = (side: string, newValue: string) => {
    onChange({ ...value, [side]: newValue });
  };

  const renderInputs = () => {
    switch (mode) {
      case 'single':
        return (
          <div>
            <Input
              type="text"
              value={value[sides[0]] || '0px'}
              onChange={(event) => handleSingleChange(event.target.value)}
              className="h-8"
              placeholder="0px"
            />
          </div>
        );

      case 'double':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Horizontal</Label>
              <Input
                type="text"
                value={value.left || '0px'}
                onChange={(event) => handleDoubleChange('horizontal', event.target.value)}
                className="h-8"
                placeholder="0px"
              />
            </div>
            <div>
              <Label className="text-xs">Vertical</Label>
              <Input
                type="text"
                value={value.top || '0px'}
                onChange={(event) => handleDoubleChange('vertical', event.target.value)}
                className="h-8"
                placeholder="0px"
              />
            </div>
          </div>
        );

      case 'quad':
        return (
          <div className="grid grid-cols-2 gap-2">
            {sides.map((side) => (
              <div key={side}>
                <Label className="text-xs capitalize">{side}</Label>
                <Input
                  type="text"
                  value={value[side] || '0px'}
                  onChange={(event) => handleIndividualChange(side, event.target.value)}
                  className="h-8"
                  placeholder="0px"
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <div className="flex gap-1">
          <Toggle
            pressed={mode === 'single'}
            onPressedChange={() => setMode('single')}
            size="sm"
            variant="outline"
          >
            <Lock size={12} />
          </Toggle>
          <Toggle
            pressed={mode === 'double'}
            onPressedChange={() => setMode('double')}
            size="sm"
            variant="outline"
          >
            <MoreHorizontal size={12} />
          </Toggle>
          <Toggle
            pressed={mode === 'quad'}
            onPressedChange={() => setMode('quad')}
            size="sm"
            variant="outline"
          >
            <Grid2X2 size={12} />
          </Toggle>
        </div>
      </div>
      
      {renderInputs()}
    </div>
  );
}
