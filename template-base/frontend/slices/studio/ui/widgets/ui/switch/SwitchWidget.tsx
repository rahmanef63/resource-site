import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SwitchWidgetProps {
    label?: string;
    description?: string;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
}

export const SwitchWidget: React.FC<SwitchWidgetProps> = ({
    label = 'Switch',
    description = '',
    checked = false,
    disabled = false,
    className = '',
}) => {
    return (
        <div className={`flex items-center justify-between space-x-4 ${className}`}>
            <div className="space-y-0.5">
                {label && <Label className="text-sm font-medium">{label}</Label>}
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            <Switch defaultChecked={checked} disabled={disabled} />
        </div>
    );
};
