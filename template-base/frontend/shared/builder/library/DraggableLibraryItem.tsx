import React from 'react';
import { useDnD } from '../canvas/core/DnDProvider';
import type { LucideIcon } from 'lucide-react';
import { getCategoryIcon, getFeatureIcon } from '@/frontend/shared/ui';

interface DraggableLibraryItemProps {
  componentKey: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  category: string;
  feature: string;
  children?: React.ReactNode;
  className?: string;
}

export const DraggableLibraryItem: React.FC<DraggableLibraryItemProps> = ({
  componentKey,
  label,
  description,
  icon,
  category,
  feature,
  children,
  className = '',
}) => {
  const [, setType] = useDnD();

  const onDragStart = (event: React.DragEvent) => {
    setType(componentKey);
    event.dataTransfer.setData('text/plain', componentKey);
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        componentKey,
        label,
        category,
        feature,
      })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const CategoryIcon = icon || getCategoryIcon(category);
  const FeatureIcon = getFeatureIcon(feature);

  // Enhanced hover classes
  const hoverClasses = `
    transition-all duration-150 ease-out
    hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5
    hover:border-primary/50 hover:ring-1 hover:ring-primary/20
    active:scale-[0.98] active:shadow-sm
  `;

  if (children) {
    return (
      <div draggable onDragStart={onDragStart} className={`${className} ${hoverClasses}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`h-20 rounded-lg border border-border bg-card p-2.5 text-left cursor-grab active:cursor-grabbing group ${hoverClasses} ${className}`}
      draggable
      onDragStart={onDragStart}
    >
      <div className="text-xs font-medium flex items-center gap-1.5">
        {FeatureIcon && <FeatureIcon size={12} className="text-muted-foreground opacity-60" />}
        {CategoryIcon && <CategoryIcon size={14} className="text-foreground" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{description || componentKey}</div>
    </div>
  );
};
