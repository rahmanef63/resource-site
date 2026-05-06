import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SettingsToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function SettingsToggle({
  id,
  label,
  description,
  checked,
  onChange,
  className
}: SettingsToggleProps) {
  return (
    <div className={cn("flex items-center justify-between py-3", className)}>
      <div className="flex-1 pr-4">
        <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer block">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary flex-shrink-0"
      />
    </div>
  );
}
