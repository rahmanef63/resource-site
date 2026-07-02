import React from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { LastEditedTimeRenderer } from './LastEditedTimeRenderer';

export const LastEditedTimeEditor: React.FC<PropertyEditorProps<number>> = ({ 
  value, 
  property 
}) => {
  // Auto properties are read-only, just render the value
  return (
    <div className="w-full cursor-not-allowed opacity-60">
      <LastEditedTimeRenderer value={value} property={property} readOnly={true} />
    </div>
  );
};

export default LastEditedTimeEditor;
