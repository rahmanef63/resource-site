import React from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { LastEditedByRenderer } from './LastEditedByRenderer';

export const LastEditedByEditor: React.FC<PropertyEditorProps> = ({ 
  value, 
  property 
}) => {
  // Auto properties are read-only, just render the value
  return (
    <div className="w-full cursor-not-allowed opacity-60">
      <LastEditedByRenderer value={value} property={property} readOnly={true} />
    </div>
  );
};

export default LastEditedByEditor;
