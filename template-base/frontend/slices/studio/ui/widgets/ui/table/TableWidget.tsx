import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableWidgetProps {
  columns?: Array<{
    key: string;
    header: string;
  }>;
  data?: Record<string, any>[];
  caption?: string;
  className?: string;
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
  ],
  data = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ],
  caption,
  className,
}) => {
  return (
    <Table className={className}>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column) => (
              <TableCell key={column.key}>{String(row[column.key] ?? '')}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
