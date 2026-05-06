import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { TableWidget } from './TableWidget';
import React from 'react';
import { Table2 } from 'lucide-react';

const tableInspectorConfig: InspectorField[] = [
  {
    key: 'caption',
    label: 'Caption',
    type: 'text',
    placeholder: 'Table caption',
  },
  {
    key: 'columns',
    label: 'Columns',
    type: 'custom',
    component: ({ value, onChange }: { value: any[], onChange: (v: any[]) => void }) => {
      const columns = value || [];
      
      const addColumn = () => {
        onChange([...columns, { key: `col${columns.length + 1}`, header: 'New Column' }]);
      };
      
      const updateColumn = (index: number, field: string, newValue: string) => {
        const newColumns = [...columns];
        newColumns[index] = { ...newColumns[index], [field]: newValue };
        onChange(newColumns);
      };
      
      const removeColumn = (index: number) => {
        onChange(columns.filter((_: any, i: number) => i !== index));
      };
      
      return (
        <div className="space-y-2">
          {columns.map((column: any, index: number) => (
            <div key={index} className="border rounded p-2 space-y-2">
              <input
                type="text"
                placeholder="Key"
                value={column.key}
                onChange={(e) => updateColumn(index, 'key', e.target.value)}
                className="w-full p-1 border rounded text-xs"
              />
              <input
                type="text"
                placeholder="Header"
                value={column.header}
                onChange={(e) => updateColumn(index, 'header', e.target.value)}
                className="w-full p-1 border rounded text-xs"
              />
              <button
                onClick={() => removeColumn(index)}
                className="text-red-500 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addColumn}
            className="w-full p-1 border border-dashed rounded text-xs"
          >
            Add Column
          </button>
        </div>
      );
    },
  },
];

export const tableManifest: WidgetConfig = {
  label: 'Table',
  category: 'UI',
  description: 'Renders a data table.',
  icon: Table2,
  tags: ['ui', 'table', 'data'],
  defaults: {
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'role', header: 'Role' },
    ],
    data: [
      { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    ],
  },
  render: (props) => <TableWidget {...(props as any)} />,
  inspector: {
    fields: tableInspectorConfig,
  },
};

