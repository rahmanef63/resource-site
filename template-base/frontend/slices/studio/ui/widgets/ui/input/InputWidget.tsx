import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputWidgetProps {
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    value?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export const InputWidget: React.FC<InputWidgetProps> = ({
    label = 'Input',
    placeholder = 'Enter text...',
    type = 'text',
    value = '',
    disabled = false,
    required = false,
    className = '',
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Input
                type={type}
                placeholder={placeholder}
                defaultValue={value}
                disabled={disabled}
                className="w-full"
            />
        </div>
    );
};
