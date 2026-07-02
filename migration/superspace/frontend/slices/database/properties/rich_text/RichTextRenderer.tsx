import React from 'react';
import { PropertyRendererProps } from '../../registry/types';

export const RichTextRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  const textValue = String(value);

  // Basic markdown-like preview (first line, truncated)
  const preview = textValue.split('\n')[0].slice(0, 100);
  const isTruncated = textValue.length > 100 || textValue.includes('\n');

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        {preview}
        {isTruncated && <span className="text-muted-foreground">...</span>}
      </span>
    </div>
  );
};
