import React from 'react';
import {
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Toggle,
  Slider,
} from '@/components/ui';
import { InspectorControl } from '../types/InspectorTypes';
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import { SpacingControl } from './SpacingControl';
import { TabbedColorPicker } from './TabbedColorPicker';
import { ToggleGroupControl } from './ToggleGroupControl';

interface DynamicInspectorControlProps {
  control: InspectorControl;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicInspectorControl({ control, value, onChange }: DynamicInspectorControlProps) {
  const renderControl = () => {
    switch (control.ui) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder={control.default}
            className="h-8"
          />
        );

      case 'textarea':
        return (
          <textarea
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px]"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={control.default}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select value={value || control.default} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={control.default} />
            </SelectTrigger>
            <SelectContent>
              {control.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={typeof value === 'boolean' ? value : Boolean(value ?? control.default)}
              onCheckedChange={(checked) => onChange(checked)}
            />
            <Label className="text-xs">{control.label}</Label>
          </div>
        );

      case 'toggleGroup':
        return (
          <ToggleGroupControl
            label={control.label}
            value={value || control.default}
            onChange={onChange}
            options={control.options || []}
          />
        );

      case 'dimension':
        return (
          <Input
            type="text"
            value={value || control.default}
            onChange={(event) => onChange(event.target.value)}
            placeholder={control.default}
            className="h-8"
          />
        );

      case 'colorPicker':
        return (
          <TabbedColorPicker
            label={control.label}
            value={value || control.default}
            onChange={onChange}
            tabs={control.tabs}
          />
        );

      case 'spacing':
        return (
          <SpacingControl
            label={control.label}
            value={value || control.default}
            onChange={onChange}
            sides={control.sides}
            lockable={control.lockable}
          />
        );

      case 'percentage': {
        const fallbackPercentage =
          typeof control.default === 'string'
            ? parseInt(control.default.replace('%', ''), 10) / 100
            : 0
        const percentageValue =
          typeof value === 'number'
            ? value
            : typeof value === 'string'
              ? parseInt(value.replace('%', ''), 10) / 100
              : fallbackPercentage
        
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">{control.label}</Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(percentageValue * 100)}%
              </span>
            </div>
            <Slider
              value={[percentageValue]}
              onValueChange={(vals: number[]) => {
                const [val = 0] = vals;
                onChange(`${Math.round(val * 100)}%`);
              }}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>
        );
      }

      case 'segmented':
        if (control.path === 'layout.direction') {
          return (
            <div className="flex gap-1">
              <Toggle
                pressed={value === 'row'}
                onPressedChange={(pressed: boolean) => onChange(pressed ? 'row' : 'column')}
                size="sm"
              >
                <ArrowLeftRight size={14} />
              </Toggle>
              <Toggle
                pressed={value === 'column'}
                onPressedChange={(pressed: boolean) => onChange(pressed ? 'column' : 'row')}
                size="sm"
              >
                <ArrowUpDown size={14} />
              </Toggle>
            </div>
          );
        }
        
        return (
          <div className="flex gap-1 flex-wrap">
            {control.options?.map((option) => (
              <Toggle
                key={option}
                pressed={value === option}
                onPressedChange={(pressed: boolean) => onChange(pressed ? option : control.default)}
                size="sm"
              >
                {option}
              </Toggle>
            ))}
          </div>
        );

      case 'iconPicker':
        return (
          <Select value={value || control.default} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Home">Home</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder={control.default}
            className="h-8"
          />
        );
    }
  };

  // Special handling for controls that manage their own labels
  if (['toggle', 'toggleGroup', 'spacing', 'colorPicker', 'percentage'].includes(control.ui)) {
    return <div>{renderControl()}</div>;
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">{control.label}</Label>
      {renderControl()}
    </div>
  );
}
