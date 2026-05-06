import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SelectWidgetProps {
    label?: string;
    placeholder?: string;
    options?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export const SelectWidget: React.FC<SelectWidgetProps> = ({
    label = 'Select',
    placeholder = 'Choose an option',
    options = 'Option 1, Option 2, Option 3',
    value = '',
    disabled = false,
    required = false,
    className = '',
}) => {
    // Parse comma-separated options — guard against array/null from AI-generated schemas
    const optionList = Array.isArray(options)
        ? (options as unknown[]).map(String).filter(Boolean)
        : typeof options === 'string'
        ? options.split(',').map(opt => opt.trim()).filter(Boolean)
        : [];

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Select defaultValue={value} disabled={disabled}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {optionList.map((option, idx) => (
                        <SelectItem key={idx} value={option.toLowerCase().replace(/\s+/g, '-')}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
