import React, { useState } from 'react';
import { Input, Label, Button, Tabs } from '@/components/ui';
import { Palette } from 'lucide-react';

interface TabbedColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tabs?: string[];
}

const tailwindColors = [
  { name: 'Default', value: 'Default' },
  { name: 'Transparent', value: 'transparent' },
  { name: 'Black', value: 'black' },
  { name: 'White', value: 'white' },
  { name: 'Slate 50', value: 'slate-50' },
  { name: 'Slate 100', value: 'slate-100' },
  { name: 'Slate 200', value: 'slate-200' },
  { name: 'Slate 300', value: 'slate-300' },
  { name: 'Slate 400', value: 'slate-400' },
  { name: 'Slate 500', value: 'slate-500' },
  { name: 'Slate 600', value: 'slate-600' },
  { name: 'Slate 700', value: 'slate-700' },
];

const colorPresets = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function TabbedColorPicker({ label, value, onChange, tabs = ['Tailwind', 'Custom'] }: TabbedColorPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const filteredTailwindColors = tailwindColors.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm"
            className="w-8 h-8 p-0"
            style={{ backgroundColor: value?.startsWith('#') ? value : undefined }}
            onClick={() => setShowPicker(!showPicker)}
          >
            <Palette size={14} />
          </Button>
          
          {showPicker && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowPicker(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-80 bg-popover rounded-lg border border-border shadow-lg z-20">
                <div className="flex border-b">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      className="flex-1 px-3 py-2 text-sm border-b-2 border-transparent hover:border-muted-foreground"
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="p-3 space-y-3">
                  <Input
                    placeholder="Search for a color..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredTailwindColors.map((color) => (
                      <Button
                        key={color.value}
                        variant="ghost"
                        className="w-full justify-start h-8 text-xs"
                        onClick={() => {
                          onChange(color.value);
                          setShowPicker(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border cursor-pointer"
                            style={{ backgroundColor: color.value === 'transparent' ? 'transparent' : color.value }}
                          />
                          {color.name}
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((color) => (
                      <Button
                        key={color}
                        className="w-8 h-8 p-0 rounded"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onChange(color);
                          setShowPicker(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1"
          placeholder="Default"
        />
      </div>
    </div>
  );
}
