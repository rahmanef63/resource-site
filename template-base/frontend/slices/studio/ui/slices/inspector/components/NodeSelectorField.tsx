import React from 'react';
import type { CMSNode } from '@/frontend/slices/studio/ui/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';

interface NodeSelectorFieldProps {
  value: string;
  onChange: (value: string) => void;
  nodes: CMSNode[];
  filterType?: string;
  placeholder?: string;
}

export const NodeSelectorField: React.FC<NodeSelectorFieldProps> = ({
  value,
  onChange,
  nodes,
  filterType,
  placeholder = "Select a node..."
}) => {
  const filteredNodes = nodes.filter(node => {
    if (!filterType) return true;
    return node.data.comp === filterType;
  });

  const options = filteredNodes.map(node => {
    const config = getWidgetConfig(node.data.comp);
    const label = node.data.props?.label || config?.label || node.data.comp;
    return {
      value: node.id,
      label: `${label} (${node.id.slice(1, 5)})`
    };
  });

  return (
    <Select
      value={value || '__none'}
      onValueChange={(nextValue) => onChange(nextValue === '__none' ? '' : nextValue)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
